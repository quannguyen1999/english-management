from flask import request
from flask_restful import Resource

from controller.base_controller import ChromaResourceMixin, handle_errors
from service.ai_service import process_chat_with_storage
from validate import validate_add_message, validate_chat_request


class MessageResource(ChromaResourceMixin, Resource):
    @handle_errors("Failed to add message")
    def post(self):
        data = request.get_json()

        validation_error = validate_add_message(data)
        if validation_error:
            return validation_error[0], validation_error[1]

        conversation_id = data["conversation_id"]
        role = data["role"]
        content = data["content"]
        timestamp = data.get("timestamp")
        is_first_message = data.get("is_first_message", False)
        additional_metadata = data.get("additional_metadata")

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


class ConversationResource(ChromaResourceMixin, Resource):
    @handle_errors("Failed to retrieve conversation", catch_value_error=False)
    def get(self, conversation_id):
        messages = self.chroma_service.get_conversation(conversation_id)
        return {
            "conversation_id": conversation_id,
            "messages": messages
        }, 200


class ConversationStatsResource(ChromaResourceMixin, Resource):
    @handle_errors("Failed to retrieve conversation stats", catch_value_error=False)
    def get(self, conversation_id):
        return self.chroma_service.get_conversation_stats(conversation_id), 200


class ConversationDeleteResource(ChromaResourceMixin, Resource):
    @handle_errors("Failed to delete conversation")
    def delete(self, conversation_id):
        success = self.chroma_service.delete_conversation(conversation_id)
        if success:
            return {
                "status": "success",
                "message": f"Conversation {conversation_id} deleted successfully"
            }, 200
        return {
            "status": "error",
            "message": f"Failed to delete conversation {conversation_id}"
        }, 500


class ChatWithAIResource(ChromaResourceMixin, Resource):
    @handle_errors("Failed to process chat")
    def post(self):
        data = request.get_json()

        validation_error = validate_chat_request(data)
        if validation_error:
            return validation_error[0], validation_error[1]

        conversation_id = data["conversation_id"]
        user_message = data["message"]
        max_tokens = data.get("max_tokens", 280)
        temperature = data.get("temperature", 0.5)

        result = process_chat_with_storage(
            chroma_service=self.chroma_service,
            conversation_id=conversation_id,
            user_message=user_message,
            max_tokens=max_tokens,
            temperature=temperature
        )
        return result, 200 