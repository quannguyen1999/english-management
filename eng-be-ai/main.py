from flask import Flask, render_template
from flask_restful import Api
from controller.ai_controller import AIStreamResource
from controller.conversation_controller import (
    MessageResource,
    ConversationResource,
    ConversationDeleteResource,
    ChatWithAIResource,
)
from controller.chroma_controller import ChromaHealthResource, ChromaDeleteAllResource
from controller.tts_controller import TTSResource
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
api = Api(app)

# AI endpoints
api.add_resource(AIStreamResource, '/ai/stream')

# Conversation endpoints
api.add_resource(MessageResource, '/messages')
api.add_resource(ConversationResource, '/conversations/<string:conversation_id>')
api.add_resource(ConversationDeleteResource, '/conversations/<string:conversation_id>')
api.add_resource(ChatWithAIResource, '/chat')

# ChromaDB health check and data management
api.add_resource(ChromaHealthResource, '/chroma/health')
api.add_resource(ChromaDeleteAllResource, '/chroma/data')

if __name__ == '__main__':
    app.run(debug=True)
