import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
import json
import os
from config.chroma_config import CHROMA_HOST, CHROMA_PORT, COLLECTION_NAME, COLLECTION_METADATA, MAX_MESSAGE_LENGTH, MAX_CONVERSATION_MESSAGES


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
            print(f"Attempting to connect to ChromaDB at {self.host}:{self.port}")
            
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
                   timestamp: Optional[str] = None) -> str:
        """
        Add a message to the collection
        
        Args:
            conversation_id: Unique conversation identifier
            role: Message role (user, assistant, system)
            content: Message content
            timestamp: ISO8601 timestamp string (auto-generated if not provided)
            
        Returns:
            Generated message ID
        """
        # Validate input
        if not content or len(content.strip()) == 0:
            raise ValueError("Message content cannot be empty")
        
        if len(content) > MAX_MESSAGE_LENGTH:
            raise ValueError(f"Message content exceeds maximum length of {MAX_MESSAGE_LENGTH} characters")
        
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Generate unique message ID
        message_id = f"msg_{uuid.uuid4().hex[:8]}"
        
        print(f"💾 Storing message: id={message_id}, conversation_id='{conversation_id}', role={role}")
        
        try:
            # Add document to collection
            self.collection.add(
                documents=[content],
                metadatas=[{
                    "conversation_id": conversation_id,
                    "role": role,
                    "timestamp": timestamp
                }],
                ids=[message_id]
            )
            
            print(f"✅ Message stored successfully with ID: {message_id}")
            return message_id
        except Exception as e:
            print(f"❌ Failed to store message: {str(e)}")
            raise Exception(f"Failed to add message to ChromaDB: {str(e)}")
    
    def get_conversation(self, conversation_id: str) -> List[Dict[str, Any]]:
        """
        Get all messages in a conversation
        
        Args:
            conversation_id: Conversation identifier
            
        Returns:
            List of messages ordered by timestamp
        """
        try:
            print(f"🔍 Querying ChromaDB for conversation: '{conversation_id}'")
            
            # Query by conversation_id metadata
            results = self.collection.query(
                query_texts=[""],  # Empty query to get all documents
                where={"conversation_id": conversation_id},
                n_results=MAX_CONVERSATION_MESSAGES
            )
            
            print(f"📊 Query results: {len(results['ids'][0]) if results['ids'] and results['ids'][0] else 0} messages found")
            
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
                print(f"  📝 Message {i}: role={message['role']}, content={message['content'][:50]}...")
            
            # Sort by timestamp
            messages.sort(key=lambda x: x["timestamp"])
            print(f"✅ Returning {len(messages)} messages for conversation '{conversation_id}'")
            
            return messages
        except Exception as e:
            print(f"❌ Error in get_conversation: {str(e)}")
            raise Exception(f"Failed to retrieve conversation: {str(e)}")
    
    def search_conversation(self, conversation_id: str, query: str, 
                           n_results: int = 3) -> List[Dict[str, Any]]:
        """
        Search for messages in a conversation using semantic search
        
        Args:
            conversation_id: Conversation identifier
            query: Search query text
            n_results: Number of results to return
            
        Returns:
            List of search results with scores
        """
        if not query or len(query.strip()) == 0:
            raise ValueError("Search query cannot be empty")
        
        if n_results > MAX_CONVERSATION_MESSAGES:
            n_results = MAX_CONVERSATION_MESSAGES
        
        try:
            # Perform semantic search within the conversation
            results = self.collection.query(
                query_texts=[query],
                where={"conversation_id": conversation_id},
                n_results=n_results,
                include=["metadatas", "documents", "distances"]
            )
            
            if not results['ids'] or not results['ids'][0]:
                return []
            
            # Combine results with scores
            search_results = []
            for i in range(len(results['ids'][0])):
                # Convert distance to similarity score (1 - distance)
                score = 1 - results['distances'][0][i] if results['distances'][0][i] is not None else 0
                
                result = {
                    "id": results['ids'][0][i],
                    "role": results['metadatas'][0][i]["role"],
                    "content": results['documents'][0][i],
                    "timestamp": results['metadatas'][0][i]["timestamp"],
                    "score": round(score, 2)
                }
                search_results.append(result)
            
            return search_results
        except Exception as e:
            raise Exception(f"Failed to perform search: {str(e)}")
    
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
    
    def get_conversation_stats(self, conversation_id: str) -> Dict[str, Any]:
        """
        Get statistics for a conversation
        
        Args:
            conversation_id: Conversation identifier
            
        Returns:
            Dictionary with conversation statistics
        """
        try:
            messages = self.get_conversation(conversation_id)
            
            if not messages:
                return {
                    "conversation_id": conversation_id,
                    "message_count": 0,
                    "user_messages": 0,
                    "assistant_messages": 0,
                    "system_messages": 0
                }
            
            user_count = sum(1 for msg in messages if msg["role"] == "user")
            assistant_count = sum(1 for msg in messages if msg["role"] == "assistant")
            system_count = sum(1 for msg in messages if msg["role"] == "system")
            
            return {
                "conversation_id": conversation_id,
                "message_count": len(messages),
                "user_messages": user_count,
                "assistant_messages": assistant_count,
                "system_messages": system_count,
                "first_message": messages[0]["timestamp"],
                "last_message": messages[-1]["timestamp"]
            }
        except Exception as e:
            raise Exception(f"Failed to get conversation stats: {str(e)}")
    
    def health_check(self) -> Dict[str, Any]:
        """Check ChromaDB connection health"""
        try:
            # Check which type of client we're using
            if isinstance(self.client, MockChromaClient):
                client_type = "mock"
                # Show some debug info about stored conversations
                debug_info = {}
                for conv_id, collection in self.client._collections.items():
                    debug_info[conv_id] = {
                        "message_count": len(collection.documents),
                        "last_message": collection.documents[-1] if collection.documents else "None"
                    }
                
                return {
                    "status": "mock",
                    "message": "Using mock ChromaDB client - data will NOT persist between restarts",
                    "client_type": client_type,
                    "collections": len(self.client._collections),
                    "is_mock": True,
                    "debug_info": debug_info
                }
            elif hasattr(self.client, '_persist_directory'):
                # This is a PersistentClient
                client_type = "persistent"
                collections = self.client.list_collections()
                return {
                    "status": "healthy",
                    "message": "Using persistent local ChromaDB - data WILL persist between restarts",
                    "client_type": client_type,
                    "collections": len(collections),
                    "persist_directory": "./chroma_db_local",
                    "is_mock": False
                }
            else:
                # This is an HttpClient
                client_type = "http"
                collections = self.client.list_collections()
                return {
                    "status": "healthy",
                    "message": "Using ChromaDB server - data persists on server",
                    "client_type": client_type,
                    "collections": len(collections),
                    "is_mock": False
                }
                
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "is_mock": False
            } 