from fastapi import APIRouter
from app.api.v1.routes import chat, journey, location, timeline

api_router = APIRouter()
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(journey.router, prefix="/journey", tags=["journey"])
api_router.include_router(location.router, prefix="/location", tags=["location"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["timeline"])
