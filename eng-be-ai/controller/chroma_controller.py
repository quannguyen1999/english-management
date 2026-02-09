from flask_restful import Resource

from controller.base_controller import ChromaResourceMixin, handle_errors


class ChromaHealthResource(ChromaResourceMixin, Resource):
    @handle_errors(
        error_message="",
        catch_value_error=False,
        error_status=503,
        error_key="error",
        status_value="unhealthy",
        use_raw_message=True,
    )
    def get(self):
        health_status = self.chroma_service.health_check()
        return health_status, 200 if health_status["status"] == "healthy" else 503


class ChromaDeleteAllResource(ChromaResourceMixin, Resource):
    @handle_errors("Failed to delete all ChromaDB data", catch_value_error=False, use_raw_message=True)
    def delete(self):
        result = self.chroma_service.delete_all_data()
        return {
            "status": "success",
            "message": result.get("message", "All data deleted."),
            "deleted_count": result.get("deleted_count", 0),
        }, 200
