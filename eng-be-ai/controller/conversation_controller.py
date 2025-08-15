from flask import request, jsonify
from flask_restful import Resource
from service.chroma_service import ChromaService
from service.ai_service import handle_request
from typing import Dict, Any
import json


class ChromaHealthResource(Resource):
    """Handle GET /chroma/health endpoint for ChromaDB health check"""
    
    def __init__(self):
        self._chroma_service = None
    
    @property
    def chroma_service(self):
        """Lazy load ChromaService to avoid connection issues during initialization"""
        if self._chroma_service is None:
            try:
                self._chroma_service = ChromaService()
            except Exception as e:
                # Return error response instead of crashing
                raise Exception(f"ChromaDB service unavailable: {str(e)}")
        return self._chroma_service
    
    def get(self):
        """Check ChromaDB connection health"""
        try:
            health_status = self.chroma_service.health_check()
            return health_status, 200 if health_status["status"] == "healthy" else 503
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }, 503


class MessageResource(Resource):
    """Handle POST /messages endpoint for adding messages"""
    
    def __init__(self):
        self._chroma_service = None
    
    @property
    def chroma_service(self):
        """Lazy load ChromaService to avoid connection issues during initialization"""
        if self._chroma_service is None:
            try:
                self._chroma_service = ChromaService()
            except Exception as e:
                # Return error response instead of crashing
                raise Exception(f"ChromaDB service unavailable: {str(e)}")
        return self._chroma_service
    
    def post(self):
        """Add a new message to a conversation"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ["conversation_id", "role", "content"]
            for field in required_fields:
                if field not in data:
                    return {
                        "status": "error",
                        "message": f"Missing required field: {field}"
                    }, 400
            
            # Validate role
            valid_roles = ["user", "assistant", "system"]
            if data["role"] not in valid_roles:
                return {
                    "status": "error",
                    "message": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
                }, 400
            
            # Extract data
            conversation_id = data["conversation_id"]
            role = data["role"]
            content = data["content"]
            timestamp = data.get("timestamp")  # Optional
            
            # Add message to ChromaDB
            message_id = self.chroma_service.add_message(
                conversation_id=conversation_id,
                role=role,
                content=content,
                timestamp=timestamp
            )
            
            return {
                "status": "success",
                "message_id": message_id
            }, 201
            
        except ValueError as e:
            return {
                "status": "error",
                "message": str(e)
            }, 400
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to add message: {str(e)}"
            }, 500


class ConversationResource(Resource):
    """Handle GET /conversations/{conversation_id} endpoint"""
    
    def __init__(self):
        self._chroma_service = None
    
    @property
    def chroma_service(self):
        """Lazy load ChromaService to avoid connection issues during initialization"""
        if self._chroma_service is None:
            try:
                self._chroma_service = ChromaService()
            except Exception as e:
                # Return error response instead of crashing
                raise Exception(f"ChromaDB service unavailable: {str(e)}")
        return self._chroma_service
    
    def get(self, conversation_id):
        """Get all messages in a conversation"""
        try:
            messages = self.chroma_service.get_conversation(conversation_id)
            
            return {
                "conversation_id": conversation_id,
                "messages": messages
            }, 200
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to retrieve conversation: {str(e)}"
            }, 500


class SearchResource(Resource):
    """Handle POST /search endpoint for semantic search"""
    
    def __init__(self):
        self._chroma_service = None
    
    @property
    def chroma_service(self):
        """Lazy load ChromaService to avoid connection issues during initialization"""
        if self._chroma_service is None:
            try:
                self._chroma_service = ChromaService()
            except Exception as e:
                # Return error response instead of crashing
                raise Exception(f"ChromaDB service unavailable: {str(e)}")
        return self._chroma_service
    
    def post(self):
        """Search for messages in a conversation using semantic search"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ["conversation_id", "query"]
            for field in required_fields:
                if field not in data:
                    return {
                        "status": "error",
                        "message": f"Missing required field: {field}"
                    }, 400
            
            # Extract data
            conversation_id = data["conversation_id"]
            query = data["query"]
            n_results = data.get("n_results", 3)  # Default to 3 results
            
            # Validate n_results
            if not isinstance(n_results, int) or n_results < 1:
                return {
                    "status": "error",
                    "message": "n_results must be a positive integer"
                }, 400
            
            # Perform search
            results = self.chroma_service.search_conversation(
                conversation_id=conversation_id,
                query=query,
                n_results=n_results
            )
            
            return {
                "results": results
            }, 200
            
        except ValueError as e:
            return {
                "status": "error",
                "message": str(e)
            }, 400
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to perform search: {str(e)}"
            }, 500


class ConversationStatsResource(Resource):
    """Handle GET /conversations/{conversation_id}/stats endpoint"""
    
    def __init__(self):
        self._chroma_service = None
    
    @property
    def chroma_service(self):
        """Lazy load ChromaService to avoid connection issues during initialization"""
        if self._chroma_service is None:
            try:
                self._chroma_service = ChromaService()
            except Exception as e:
                # Return error response instead of crashing
                raise Exception(f"ChromaDB service unavailable: {str(e)}")
        return self._chroma_service
    
    def get(self, conversation_id):
        """Get statistics for a conversation"""
        try:
            stats = self.chroma_service.get_conversation_stats(conversation_id)
            
            return stats, 200
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to retrieve conversation stats: {str(e)}"
            }, 500


class ConversationDeleteResource(Resource):
    """Handle DELETE /conversations/{conversation_id} endpoint"""
    
    def __init__(self):
        self._chroma_service = None
    
    @property
    def chroma_service(self):
        """Lazy load ChromaService to avoid connection issues during initialization"""
        if self._chroma_service is None:
            try:
                self._chroma_service = ChromaService()
            except Exception as e:
                # Return error response instead of crashing
                raise Exception(f"ChromaDB service unavailable: {str(e)}")
        return self._chroma_service
    
    def delete(self, conversation_id):
        """Delete all messages in a conversation"""
        try:
            success = self.chroma_service.delete_conversation(conversation_id)
            
            if success:
                return {
                    "status": "success",
                    "message": f"Conversation {conversation_id} deleted successfully"
                }, 200
            else:
                return {
                    "status": "error",
                    "message": f"Failed to delete conversation {conversation_id}"
                }, 500
                
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to delete conversation: {str(e)}"
            }, 500 


class ChatWithAIResource(Resource):
    """Handle POST /chat endpoint for AI conversation with storage"""
    
    def __init__(self):
        self._chroma_service = None
    
    @property
    def chroma_service(self):
        """Lazy load ChromaService to avoid connection issues during initialization"""
        if self._chroma_service is None:
            try:
                self._chroma_service = ChromaService()
            except Exception as e:
                # Return error response instead of crashing
                raise Exception(f"ChromaDB service unavailable: {str(e)}")
        return self._chroma_service
    
    def post(self):
        """Send a message and get AI response, storing both in conversation"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ["conversation_id", "message"]
            for field in required_fields:
                if field not in data:
                    return {
                        "status": "error",
                        "message": f"Missing required field: {field}"
                    }, 400
            
            # Extract data
            conversation_id = data["conversation_id"]
            user_message = data["message"]
            max_tokens = data.get("max_tokens", 1000)
            temperature = data.get("temperature", 0.5)
            
            # Ensure conversation_id is a string and clean it
            conversation_id = str(conversation_id).strip()
            if not conversation_id:
                return {
                    "status": "error",
                    "message": "conversation_id cannot be empty"
                }, 400
            
            print(f"💬 Processing chat for conversation: '{conversation_id}'")
            print(f"📝 User message: {user_message[:100]}...")
            
            # Get conversation history for context BEFORE adding the new message
            conversation_history = self.chroma_service.get_conversation(conversation_id)
            
            # Debug: Log the conversation history
            print(f"🔍 Conversation history for {conversation_id}: {len(conversation_history)} messages")
            for i, msg in enumerate(conversation_history):
                print(f"  Message {i}: role={msg.get('role', 'N/A')}, content={msg.get('content', 'N/A')[:50]}...")
            
            # Build context from conversation history (last 5 messages)
            context = ""
            if len(conversation_history) > 0:  # If there are previous messages
                # Get last 5 messages
                recent_messages = conversation_history[-5:] if len(conversation_history) > 5 else conversation_history
                print(f"📝 Building context from {len(recent_messages)} recent messages")
                context = "\n".join([
                    f"{msg['role'].title()}: {msg['content']}" 
                    for msg in recent_messages
                ]) + "\n"
                print(f"📋 Context built: {context[:100]}...")
            else:
                print(f"⚠️  No previous context available (first message in conversation)")
            
            # Store user message in ChromaDB
            user_message_id = self.chroma_service.add_message(
                conversation_id=conversation_id,
                role="user",
                content=user_message
            )
            print(f"✅ User message stored with ID: {user_message_id}")
            
            # Create full prompt with context
            full_prompt = context + f"User: {user_message}\nAI:"
            print(f"🤖 AI Prompt: {full_prompt[:200]}...")
            
            # Generate AI response
            ai_response = handle_request(full_prompt, max_tokens, temperature)
            print(f"🤖 AI Response: {ai_response[:100]}...")
            
            # Store AI response in ChromaDB
            ai_message_id = self.chroma_service.add_message(
                conversation_id=conversation_id,
                role="assistant",
                content=ai_response
            )
            
            return {
                "status": "success",
                "conversation_id": conversation_id,
                "user_message_id": user_message_id,
                "ai_message_id": ai_message_id,
                "ai_response": ai_response,
                "context_used": context.strip() if context else "No previous context"
            }, 200
            
        except ValueError as e:
            return {
                "status": "error",
                "message": str(e)
            }, 400
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to process chat: {str(e)}"
            }, 500 