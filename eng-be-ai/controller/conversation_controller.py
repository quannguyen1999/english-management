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
            is_first_message = data.get("is_first_message", False)  # New parameter
            additional_metadata = data.get("additional_metadata")  # Optional additional metadata
            
            # Add message to ChromaDB with enhanced functionality
            message_id = self.chroma_service.add_message(
                conversation_id=conversation_id,
                role=role,
                content=content,
                timestamp=timestamp,
                additional_metadata=additional_metadata,
                is_first_message=is_first_message
            )
            
            return {
                "status": "success",
                "message_id": message_id,
                "is_first_message": is_first_message,
                "conversation_id": conversation_id
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
            is_first_message = len(conversation_history) == 0
            
            print(f"📊 Conversation history: {len(conversation_history)} messages")
            if is_first_message:
                print(f"🎯 This is the first message in the conversation")
            else:
                for i, msg in enumerate(conversation_history):
                    print(f"  Message {i}: role={msg.get('role', 'N/A')}, content={msg.get('content', 'N/A')[:50]}...")
            
            # Build context from conversation history (last 5 messages)
            context = ""
            if not is_first_message and len(conversation_history) > 0:
                # Get last 5 messages for context
                recent_messages = conversation_history[-5:] if len(conversation_history) > 5 else conversation_history
                print(f"📝 Building context from {len(recent_messages)} recent messages")
                context = "\n".join([
                    f"{msg['role'].title()}: {msg['content']}" 
                    for msg in recent_messages
                ]) + "\n"
                print(f"📋 Context built: {context[:100]}...")
            else:
                print(f"⚠️  No previous context available (first message in conversation)")
            
            # Store user message in ChromaDB with first message detection
            user_message_id = self.chroma_service.add_message(
                conversation_id=conversation_id,
                role="user",
                content=user_message,
                is_first_message=is_first_message
            )
            print(f"✅ User message stored with ID: {user_message_id}")
            
            # If this is the first message, save the initial system messages to ChromaDB
            if is_first_message:
                from utils.constant import create_initial_messages
                initial_messages = create_initial_messages()
                
                print(f"🔧 Saving initial system messages to conversation history...")
                # Save system message and examples (skip the last user message as we already saved it)
                for msg in initial_messages[:-1]:  # Exclude the last user message
                    if msg["role"] == "system":
                        system_msg_id = self.chroma_service.add_message(
                            conversation_id=conversation_id,
                            role="system",
                            content=msg["content"],
                            is_first_message=False,
                            additional_metadata={"message_type": "system_prompt"}
                        )
                        print(f"✅ System prompt saved with ID: {system_msg_id}")
                    elif msg["role"] == "assistant":
                        example_msg_id = self.chroma_service.add_message(
                            conversation_id=conversation_id,
                            role="assistant",
                            content=msg["content"],
                            is_first_message=False,
                            additional_metadata={"message_type": "example_response"}
                        )
                        print(f"✅ Example response saved with ID: {example_msg_id}")
                    elif msg["role"] == "user":
                        example_user_msg_id = self.chroma_service.add_message(
                            conversation_id=conversation_id,
                            role="user",
                            content=msg["content"],
                            is_first_message=False,
                            additional_metadata={"message_type": "example_user_input"}
                        )
                        print(f"✅ Example user input saved with ID: {example_user_msg_id}")
                
                print(f"✅ All initial system messages saved to conversation history")
            
            # Create full prompt with context
            if is_first_message:
                # For first message, use reminder_prompt to get properly formatted context
                from utils.constant import reminder_prompt
                formatted_messages = reminder_prompt(user_message, is_first_message=True)
                
                # Build prompt from formatted messages
                full_prompt = ""
                for msg in formatted_messages:
                    if msg["role"] == "system":
                        full_prompt += f"System: {msg['content']}\n\n"
                    elif msg["role"] == "user":
                        full_prompt += f"User: {msg['content']}\n\n"
                    elif msg["role"] == "assistant":
                        full_prompt += f"Assistant: {msg['content']}\n\n"
                
                full_prompt += "Assistant: "
                print(f"🤖 First message prompt built with reminder_prompt formatting")
            else:
                # For subsequent messages, use conversation context
                full_prompt = context + f"User: {user_message}\nAI:"
            
            print(f"🤖 AI Prompt: {full_prompt[:200]}...")
            
            # Generate AI response
            ai_response = handle_request(full_prompt, max_tokens, temperature)
            print(f"🤖 AI Response: {ai_response[:100]}...")
            
            # Store AI response in ChromaDB
            ai_message_id = self.chroma_service.add_message(
                conversation_id=conversation_id,
                role="assistant",
                content=ai_response,
                is_first_message=False  # AI response is never the first message
            )
            
            return {
                "status": "success",
                "conversation_id": conversation_id,
                "user_message_id": user_message_id,
                "ai_message_id": ai_message_id,
                "ai_response": ai_response,
                "is_first_message": is_first_message,
                "context_used": context.strip() if context else "First message - no previous context",
                "total_messages": len(conversation_history) + 2,  # +2 for user and AI messages just added
                "system_messages_saved": is_first_message,  # Indicates if system messages were saved
                "conversation_type": "new" if is_first_message else "existing"
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