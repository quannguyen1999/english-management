import json

from flask import request, Response
from flask_restful import Resource

from controller.base_controller import handle_errors
from service.ai_service import handle_stream_request
from validate import validate_stream_request


class AIStreamResource(Resource):
    @handle_errors("Failed to stream AI response", catch_value_error=False, include_status=False, error_key="error")
    def post(self):
        data = request.get_json()

        validation_error = validate_stream_request(data)
        if validation_error:
            return validation_error[0], validation_error[1]

        prompt = data["prompt"]
        max_tokens = data.get("max_tokens", 1000)
        temperature = data.get("temperature", 0.5)

        def generate():
            try:
                for chunk in handle_stream_request(prompt, max_tokens, temperature):
                    if chunk:
                        yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
                yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

        return Response(generate(), mimetype="text/event-stream")
