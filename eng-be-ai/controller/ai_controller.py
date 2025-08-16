from flask import request, Response
from flask_restful import Resource
from service.ai_service import handle_stream_request
import json

class AIStreamResource(Resource):
    """AI streaming endpoint for real-time response"""
    
    def post(self):
        try:
            data = request.get_json()
            
            if not data or 'prompt' not in data:
                return {'error': 'Prompt is required'}, 400
            
            prompt = data['prompt']
            max_tokens = data.get('max_tokens', 1000)
            temperature = data.get('temperature', 0.5)
            
            def generate():
                try:
                    for chunk in handle_stream_request(prompt, max_tokens, temperature):
                        if chunk:
                            yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
                    # Send completion signal
                    yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
            
            return Response(generate(), mimetype='text/event-stream')
            
        except Exception as e:
            return {'error': str(e)}, 500
