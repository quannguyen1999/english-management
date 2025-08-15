from flask import Flask, render_template
from flask_restful import Api
from controller.ai_controller import AIGenerateResource, AIChatResource, AIHealthResource, AIStreamResource
from controller.conversation_controller import (
    MessageResource, 
    ConversationResource, 
    SearchResource, 
    ConversationStatsResource,
    ConversationDeleteResource,
    ChromaHealthResource,
    ChatWithAIResource
)
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
api = Api(app)

# main process
# Serve the test UI
@app.route('/')
def test_ui():
    return render_template('test_ui.html')

# AI endpoints
api.add_resource(AIGenerateResource, '/ai/generate')
api.add_resource(AIStreamResource, '/ai/stream')
api.add_resource(AIChatResource, '/ai/chat')
api.add_resource(AIHealthResource, '/ai/health')

# Conversation endpoints
api.add_resource(MessageResource, '/messages')
api.add_resource(ConversationResource, '/conversations/<string:conversation_id>')
api.add_resource(SearchResource, '/search')
api.add_resource(ConversationStatsResource, '/conversations/<string:conversation_id>/stats')
api.add_resource(ConversationDeleteResource, '/conversations/<string:conversation_id>')
api.add_resource(ChatWithAIResource, '/chat')

# ChromaDB health check
api.add_resource(ChromaHealthResource, '/chroma/health')

if __name__ == '__main__':
    app.run(debug=True)
