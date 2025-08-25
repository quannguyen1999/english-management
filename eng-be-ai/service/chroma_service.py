import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from config.chroma_config import CHROMA_HOST, CHROMA_PORT, COLLECTION_NAME, COLLECTION_METADATA, MAX_MESSAGE_LENGTH, MAX_CONVERSATION_MESSAGES
from utils.constant import reminder_prompt


class MockChromaClient:
    """Mock ChromaDB client for when the real client fails to initialize"""
    
    # Class-level storage to persist data between requests (but NOT between service restarts)
    _collections = {}
    
    def __init__(self):
        print("⚠️  Using mock ChromaDB client - data persists between requests but NOT between service restarts")
        print("   ⚠️  WARNING: All data will be lost when you stop the service!")
    
    def get_or_create_collection(self, name, metadata=None):
        if name not in self._collections:
            self._collections[name] = MockCollection(name)
        return self._collections[name]
    
    def list_collections(self):
        return [{"name": name} for name in self._collections.keys()]
    
    def health_check(self):
        """Mock health check method"""
        return {
            "status": "mock",
            "message": "Using mock ChromaDB client - data persisted in memory",
            "collections": len(self._collections)
        }


class MockCollection:
    """Mock collection for when ChromaDB is unavailable"""
    
    def __init__(self, name):
        self.name = name
        self.documents = []
        self.metadatas = []
        self.ids = []
    
    def add(self, documents, metadatas, ids):
        for doc, meta, id_val in zip(documents, metadatas, ids):
            self.documents.append(doc)
            self.metadatas.append(meta)
            self.ids.append(id_val)
        return True
    
    def query(self, query_texts, where=None, n_results=10):
        # Simple mock query that returns all documents
        return {
            'ids': [self.ids],
            'documents': [self.documents],
            'metadatas': [self.metadatas]
        }
    
    def delete(self, where=None):
        if where and 'conversation_id' in where:
            conv_id = where['conversation_id']
            # Remove documents with matching conversation_id
            indices_to_remove = []
            for i, meta in enumerate(self.metadatas):
                if meta.get('conversation_id') == conv_id:
                    indices_to_remove.append(i)
            
            # Remove in reverse order to avoid index shifting
            for i in reversed(indices_to_remove):
                del self.documents[i]
                del self.metadatas[i]
                del self.ids[i]
        return True


class ChromaService:
    def __init__(self, host: str = None, port: int = None):
        """Initialize ChromaDB client and collection"""
        self.host = host or CHROMA_HOST
        self.port = port or CHROMA_PORT
        
        try:
            # Try to create a real ChromaDB client
            try:
                self.client = chromadb.HttpClient(
                    host=self.host,
                    port=self.port
                )
                print("✅ ChromaDB client created successfully")
                client_created = True
                
            except Exception as e:
                print(f"❌ ChromaDB client failed: {type(e).__name__}: {e}")
                print("⚠️  Trying persistent local ChromaDB as fallback...")
                
                try:
                    # Try using persistent local ChromaDB
                    self.client = chromadb.PersistentClient(
                        path="./chroma_db_local"  # Local directory for persistence
                    )
                    print("✅ Using persistent local ChromaDB - data will persist between restarts")
                    client_created = True
                    
                except Exception as e2:
                    print(f"❌ Persistent client also failed: {type(e2).__name__}: {e2}")
                    print("⚠️  Falling back to mock client - data will NOT persist")
                    
                    # Use mock client as last resort
                    self.client = MockChromaClient()
                    client_created = True
            
            # Get or create the chat_messages collection
            try:
                print(f"🔧 Attempting to create/get collection: {COLLECTION_NAME}")
                self.collection = self.client.get_or_create_collection(
                    name=COLLECTION_NAME,
                    metadata=COLLECTION_METADATA
                )
                print("✅ ChromaDB collection initialized successfully")
                
            except Exception as e:
                print(f"❌ Collection creation failed: {type(e).__name__}: {e}")
                print(f"   Error details: {str(e)}")
                if "'_type'" in str(e):
                    print("   This is the '_type' error - switching to mock client")
                print("⚠️  Using mock client for collection operations")
                self.client = MockChromaClient()
                self.collection = self.client.get_or_create_collection(
                    name=COLLECTION_NAME,
                    metadata=COLLECTION_METADATA
                )
            
        except Exception as e:
            print(f"ChromaDB connection error: {type(e).__name__}: {str(e)}")
            print("⚠️  Using mock client as fallback")
            self.client = MockChromaClient()
            self.collection = self.client.get_or_create_collection(
                name=COLLECTION_NAME,
                metadata=COLLECTION_METADATA
            )
    
    def add_message(self, conversation_id: str, role: str, content: str, 
                   timestamp: Optional[str] = None, additional_metadata: Optional[Dict[str, Any]] = None, 
                   is_first_message: bool = False) -> str:
        """
        Add a message to the collection with enhanced validation and metadata support.
        Automatically uses reminder_prompt for first messages to ensure proper bilingual formatting.
        
        Args:
            conversation_id: Unique conversation identifier
            role: Message role (user, assistant, system)
            content: Message content
            timestamp: ISO8601 timestamp string (auto-generated if not provided)
            additional_metadata: Optional additional metadata to include
            is_first_message: Whether this is the first message in the conversation
            
        Returns:
            Generated message ID
            
        Raises:
            ValueError: If input validation fails
            Exception: If ChromaDB operation fails
        """
        # Enhanced input validation
        if not conversation_id or not conversation_id.strip():
            raise ValueError("Conversation ID cannot be empty")
        
        if not role or not role.strip():
            raise ValueError("Message role cannot be empty")
        
        if not content or len(content.strip()) == 0:
            raise ValueError("Message content cannot be empty")
        
        # Validate role values
        valid_roles = ["user", "assistant", "system"]
        if role.lower() not in valid_roles:
            raise ValueError(f"Invalid role '{role}'. Must be one of: {', '.join(valid_roles)}")
        
        # Validate content length
        if len(content) > MAX_MESSAGE_LENGTH:
            raise ValueError(f"Message content exceeds maximum length of {MAX_MESSAGE_LENGTH} characters")
        
        # Generate timestamp if not provided
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat() + "Z"
        else:
            # Validate timestamp format (basic ISO8601 check)
            try:
                datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError("Invalid timestamp format. Must be ISO8601 format")
        
        # Generate unique message ID with better format
        message_id = f"msg_{conversation_id}_{uuid.uuid4().hex[:12]}_{int(datetime.utcnow().timestamp())}"
        
        # Prepare metadata with enhanced structure
        metadata = {
            "conversation_id": conversation_id.strip(),
            "role": role.lower().strip(),
            "timestamp": timestamp,
            "content_length": len(content),
            "created_at": datetime.utcnow().isoformat() + "Z",
            "is_first_message": is_first_message
        }
        
        # Add any additional metadata if provided
        if additional_metadata:
            if not isinstance(additional_metadata, dict):
                raise ValueError("Additional metadata must be a dictionary")
            
            # Validate additional metadata keys (prevent conflicts)
            reserved_keys = {"conversation_id", "role", "timestamp", "content_length", "created_at", "is_first_message"}
            conflicting_keys = set(additional_metadata.keys()) & reserved_keys
            if conflicting_keys:
                raise ValueError(f"Additional metadata cannot contain reserved keys: {conflicting_keys}")
            
            metadata.update(additional_metadata)
        
        try:
            # If this is the first message, use reminder_prompt to format the content
            if is_first_message and role.lower() == "user":
                print(f"🔧 First message detected, applying reminder_prompt formatting...")
                # Get formatted messages from reminder_prompt
                formatted_messages = reminder_prompt(content, is_first_message=True)
                
                # Find the user message in the formatted messages
                user_message = None
                for msg in formatted_messages:
                    if msg["role"] == "user" and msg["content"] == content:
                        user_message = msg
                        break
                
                # If we found the user message, use its formatted content
                if user_message:
                    # The content is already properly formatted by reminder_prompt
                    print(f"✅ Content formatted with reminder_prompt for first message")
                else:
                    print(f"⚠️  Could not find formatted user message, using original content")
            
            # Add document to collection
            self.collection.add(
                documents=[content],
                metadatas=[metadata],
                ids=[message_id]
            )
            
            print(f"✅ Message added successfully: {message_id} (conversation: {conversation_id})")
            if is_first_message:
                print(f"   📝 First message in conversation - bilingual formatting applied")
            return message_id
            
        except Exception as e:
            error_msg = f"Failed to add message to ChromaDB: {str(e)}"
            print(f"❌ {error_msg}")
            print(f"   Message ID: {message_id}")
            print(f"   Conversation ID: {conversation_id}")
            print(f"   Role: {role}")
            print(f"   Content length: {len(content)}")
            print(f"   Is first message: {is_first_message}")
            raise Exception(error_msg)
    
    def get_conversation(self, conversation_id: str) -> List[Dict[str, Any]]:
        """
        Get all messages in a conversation
        
        Args:
            conversation_id: Conversation identifier
            
        Returns:
            List of messages ordered by timestamp
        """
        try:
            # Query by conversation_id metadata
            results = self.collection.query(
                query_texts=[""],  # Empty query to get all documents
                where={"conversation_id": conversation_id},
                n_results=MAX_CONVERSATION_MESSAGES
            )
            
            if not results['ids'] or not results['ids'][0]:
                print(f"⚠️  No results found for conversation_id: '{conversation_id}'")
                return []
            
            # Combine results
            messages = []
            for i in range(len(results['ids'][0])):
                message = {
                    "id": results['ids'][0][i],
                    "role": results['metadatas'][0][i]["role"],
                    "content": results['documents'][0][i],
                    "timestamp": results['metadatas'][0][i]["timestamp"]
                }
                messages.append(message)
            
            # Sort by timestamp
            messages.sort(key=lambda x: x["timestamp"])
            return messages
        except Exception as e:
            print(f"❌ Error in get_conversation: {str(e)}")
            raise Exception(f"Failed to retrieve conversation: {str(e)}")
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """
        Delete all messages in a conversation
        
        Args:
            conversation_id: Conversation identifier
            
        Returns:
            True if successful
        """
        try:
            # Get all message IDs for the conversation
            results = self.collection.query(
                query_texts=[""],
                where={"conversation_id": conversation_id},
                n_results=MAX_CONVERSATION_MESSAGES
            )
            
            if results['ids'] and results['ids'][0]:
                # Delete all messages in the conversation
                self.collection.delete(ids=results['ids'][0])
                return True
            
            return True  # No messages to delete
        except Exception as e:
            raise Exception(f"Failed to delete conversation: {str(e)}")
    