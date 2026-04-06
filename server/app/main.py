from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="VoiceForm API", version="1.0.0")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to VoiceForm API"}

from app.api.v1.creator import router as creator_router
from app.api.v1.public import router as public_router

app.include_router(creator_router, prefix="/api/v1/creator", tags=["Creator"])
app.include_router(public_router, prefix="/api/v1/public", tags=["Public"])
