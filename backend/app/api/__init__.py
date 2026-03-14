from fastapi import APIRouter
from .persons import router as persons_router
from .logs import router as logs_router
from .faces import router as faces_router

api_router = APIRouter()

api_router.include_router(persons_router)
api_router.include_router(logs_router)
api_router.include_router(faces_router)

__all__ = ["api_router"]
