"""Base classes and mixins for controllers."""

from functools import wraps

from flask_restful import Resource
from service.chroma_service import ChromaService


def handle_errors(
    error_message: str = "Operation failed",
    catch_value_error: bool = True,
    error_status: int = 500,
    error_key: str = "message",
    status_value: str = "error",
    include_status: bool = True,
    use_raw_message: bool = False,
):
    """Decorator for common try/except: ValueError -> 400, Exception -> error_status."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                return fn(*args, **kwargs)
            except ValueError as e:
                if catch_value_error:
                    return {"status": "error", "message": str(e)}, 400
                raise
            except Exception as e:
                msg = str(e) if use_raw_message else f"{error_message}: {str(e)}"
                if include_status:
                    return {"status": status_value, error_key: msg}, error_status
                return {error_key: msg}, error_status
        return wrapper
    return decorator


class ChromaResourceMixin:
    """Mixin that provides lazy-loaded ChromaService for Flask-RESTful Resources."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._chroma_service = None

    @property
    def chroma_service(self):
        """Lazy load ChromaService to avoid connection issues during initialization."""
        if self._chroma_service is None:
            try:
                self._chroma_service = ChromaService()
            except Exception as e:
                raise Exception(f"ChromaDB service unavailable: {str(e)}")
        return self._chroma_service
