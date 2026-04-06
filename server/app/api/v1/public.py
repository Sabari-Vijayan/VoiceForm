from fastapi import APIRouter, HTTPException
from app.models.schemas import ExtractionRequest, ExtractionResponse
from app.services.gemini_service import gemini_service

router = APIRouter()

@router.post("/extract", response_model=ExtractionResponse)
async def extract_value(request: ExtractionRequest):
    """
    Extract a structured value from a voice transcript.
    """
    try:
        result = await gemini_service.extract_value(
            question=request.question,
            field_type=request.field_type,
            transcript=request.transcript,
            language=request.language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
