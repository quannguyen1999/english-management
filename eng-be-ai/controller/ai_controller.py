from flask import request, Response
from flask_restful import Resource
from service.ai_service import handle_request, handle_stream_request
import json

class AIGenerateResource(Resource):
    """AI text generation endpoint"""
    
    def post(self):
        try:
            data = request.get_json()
            
            if not data or 'prompt' not in data:
                return {'error': 'Prompt is required'}, 400
            
            prompt = data['prompt']
            max_tokens = data.get('max_tokens', 1000)
            temperature = data.get('temperature', 0.5)
            
            # Call AI service with parameters
            response = handle_request(prompt, max_tokens, temperature)
            
            return {
                'success': True,
                'response': response,
                'max_tokens': max_tokens,
                'temperature': temperature
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

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

class AIChatResource(Resource):
    """AI chat endpoint for conversation"""
    
    def post(self):
        try:
            data = request.get_json()
            
            if not data or 'message' not in data:
                return {'error': 'Message is required'}, 400
            
            message = data['message']
            conversation_history = data.get('history', [])
            max_tokens = data.get('max_tokens', 1000)
            temperature = data.get('temperature', 0.5)
            
            # Build context from conversation history
            context = ""
            if conversation_history:
                context = "\n".join([f"User: {msg['user']}\nAI: {msg['ai']}" for msg in conversation_history[-5:]]) + "\n"
            
            full_prompt = context + f"User: {message}\nAI:"
            
            # Call AI service with parameters
            response = handle_request(full_prompt, max_tokens, temperature)
            
            return {
                'success': True,
                'response': response,
                'message': message,
                'conversation_history': conversation_history + [
                    {'user': message, 'ai': response}
                ]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

class AIHealthResource(Resource):
    """Health check endpoint for AI service"""
    
    def get(self):
        try:
            # Test AI service with a simple prompt
            test_response = handle_request("Hello")
            return {
                'status': 'healthy',
                'ai_service': 'operational',
                'test_response': test_response[:50] + "..." if len(test_response) > 50 else test_response
            }, 200
        except Exception as e:
            return {
                'status': 'unhealthy',
                'ai_service': 'error',
                'error': str(e)
            }, 500
