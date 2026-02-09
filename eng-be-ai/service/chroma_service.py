import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from config.config import CHROMA_HOST, CHROMA_PORT, COLLECTION_NAME, COLLECTION_METADATA, MAX_CONVERSATION_MESSAGES
from utils.constant import reminder_prompt
from validate import validate_message_for_storage

class MockChromaClient:
    _collections = {}

    def __init__(self):
        pass

    def get_or_create_collection(self, name, metadata=None):
        if name not in self._collections:
            self._collections[name] = MockCollection(name)
        return self._collections[name]
    def list_collections(self):
        return [{"name": name} for name in self._collections.keys()]
    def health_check(self):
        return {
            "status": "mock",
            "message": "Using mock ChromaDB client - data persisted in memory",
            "collections": len(self._collections)
        }


class MockCollection:
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
        return {
            'ids': [self.ids],
            'documents': [self.documents],
            'metadatas': [self.metadatas]
        }
    
    def get(self, ids=None, where=None, limit=None, include=None):
        return {
            "ids": self.ids.copy(),
            "documents": self.documents.copy(),
            "metadatas": self.metadatas.copy(),
        }

    def delete(self, ids=None, where=None):
        if ids is not None:
            indices_to_remove = [i for i, id_val in enumerate(self.ids) if id_val in ids]
            for i in reversed(indices_to_remove):
                del self.documents[i]
                del self.metadatas[i]
                del self.ids[i]
        elif where and "conversation_id" in where:
            conv_id = where["conversation_id"]
            indices_to_remove = [i for i, meta in enumerate(self.metadatas) if meta.get("conversation_id") == conv_id]
            for i in reversed(indices_to_remove):
                del self.documents[i]
                del self.metadatas[i]
                del self.ids[i]
        return True


class ChromaService:
    def _get_collection(self):
        """Get or create the ChromaDB collection from the current client."""
        return self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata=COLLECTION_METADATA
        )

    def __init__(self, host: str = None, port: int = None):
        self.host = host or CHROMA_HOST
        self.port = port or CHROMA_PORT

        try:
            try:
                self.client = chromadb.HttpClient(
                    host=self.host,
                    port=self.port
                )
                print("✅ ChromaDB client created successfully")

            except Exception as e:
                print(f"❌ ChromaDB client failed: {type(e).__name__}: {e}")
                try:
                    self.client = chromadb.PersistentClient(
                        path="./chroma_db_local"
                    )
                except Exception:
                    self.client = MockChromaClient()

            try:
                self.collection = self._get_collection()
            except Exception:
                self.client = MockChromaClient()
                self.collection = self._get_collection()

        except Exception:
            self.client = MockChromaClient()
            self.collection = self._get_collection()
    
    def add_message(self, conversation_id: str, role: str, content: str,
                    timestamp: Optional[str] = None, additional_metadata: Optional[Dict[str, Any]] = None,
                    is_first_message: bool = False) -> str:
        validate_message_for_storage(
            conversation_id=conversation_id,
            role=role,
            content=content,
            timestamp=timestamp,
            additional_metadata=additional_metadata,
        )

        if timestamp is None:
            timestamp = datetime.utcnow().isoformat() + "Z"

        message_id = f"msg_{conversation_id}_{uuid.uuid4().hex[:12]}_{int(datetime.utcnow().timestamp())}"
        
        metadata = {
            "conversation_id": conversation_id.strip(),
            "role": role.lower().strip(),
            "timestamp": timestamp,
            "content_length": len(content),
            "created_at": datetime.utcnow().isoformat() + "Z",
            "is_first_message": is_first_message
        }
        
        if additional_metadata:
            metadata.update(additional_metadata)
        
        try:
            if is_first_message and role.lower() == "user":
                formatted_messages = reminder_prompt(content, is_first_message=True)
                user_message = None
                for msg in formatted_messages:
                    if msg["role"] == "user" and msg["content"] == content:
                        user_message = msg
                        break
            
            self.collection.add(
                documents=[content],
                metadatas=[metadata],
                ids=[message_id]
            )
            return message_id
            
        except Exception as e:
            error_msg = f"Failed to add message to ChromaDB: {str(e)}"
            raise Exception(error_msg)
    
    def get_conversation(self, conversation_id: str) -> List[Dict[str, Any]]:
        try:
            results = self.collection.query(
                query_texts=[""],
                where={"conversation_id": conversation_id},
                n_results=MAX_CONVERSATION_MESSAGES
            )
            
            if not results['ids'] or not results['ids'][0]:
                return []
            
            messages = []
            for i in range(len(results['ids'][0])):
                message = {
                    "id": results['ids'][0][i],
                    "role": results['metadatas'][0][i]["role"],
                    "content": results['documents'][0][i],
                    "timestamp": results['metadatas'][0][i]["timestamp"]
                }
                messages.append(message)
            
            messages.sort(key=lambda x: x["timestamp"])
            return messages
        except Exception as e:
            raise Exception(f"Failed to retrieve conversation: {str(e)}")
    
    def delete_conversation(self, conversation_id: str) -> bool:
        try:
            results = self.collection.query(
                query_texts=[""],
                where={"conversation_id": conversation_id},
                n_results=MAX_CONVERSATION_MESSAGES
            )
            
            if results['ids'] and results['ids'][0]:
                self.collection.delete(ids=results['ids'][0])
                return True
            
            return True
        except Exception as e:
            raise Exception(f"Failed to delete conversation: {str(e)}")

    def delete_all_data(self) -> dict:
        try:
            if isinstance(self.client, MockChromaClient):
                data = self.collection.get(include=[])
                count = len(data["ids"]) if data["ids"] else 0
                if count > 0:
                    self.collection.delete(ids=data["ids"])
                return {"deleted_count": count, "message": "All data deleted (mock)."}
            data = self.collection.get(include=[])
            ids = data.get("ids") or []
            count = len(ids)
            if count > 0:
                self.collection.delete(ids=ids)
            return {"deleted_count": count, "message": "All data deleted."}
        except Exception as e:
            raise Exception(f"Failed to delete all data: {str(e)}")
