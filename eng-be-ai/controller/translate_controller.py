"""Translation controller for English to Vietnamese."""

from flask import request
from flask_restful import Resource

from controller.base_controller import handle_errors
from service.translate_service import translate_to_vietnamese


class TranslateResource(Resource):
    @handle_errors("Translation failed", error_key="error")
    def post(self):
        """
        Translate text from English to Vietnamese.

        Request JSON: { "text": "...", "src": "en", "dest": "vi" }
        Response: { "translated": "..." }
        """
        data = request.get_json() or {}
        text = data.get("text", "")
        src = data.get("src", "en")
        dest = data.get("dest", "vi")

        if not text:
            return {"error": "text is required"}, 400

        translated = translate_to_vietnamese(text, src=src, dest=dest)
        return {"translated": translated}, 200
