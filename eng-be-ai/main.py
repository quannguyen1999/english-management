from flask import Flask, render_template
from flask_restful import Api
from controller.ai_controller import AIGenerateResource, AIChatResource, AIHealthResource, AIStreamResource
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
api = Api(app)

# main process
# Serve the test UI
@app.route('/')
def test_ui():
    return render_template('test_ui.html')

api.add_resource(AIGenerateResource, '/ai/generate')
api.add_resource(AIStreamResource, '/ai/stream')
api.add_resource(AIChatResource, '/ai/chat')
api.add_resource(AIHealthResource, '/ai/health')

if __name__ == '__main__':
    app.run(debug=True)
