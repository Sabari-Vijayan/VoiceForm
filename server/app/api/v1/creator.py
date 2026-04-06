from fastapi import APIRouter, HTTPException
from server.app.models.schemas import FormGenerationRequest, FormSchemaResponse
from server.app.services.gemini_service import gemini_service

router = APIRouter()

@router.post("/generate", response_model=FormSchemaResponse)
async def generate_form(request: FormGenerationRequest):
    """
    Generate a form schema using Gemini from a text prompt.
    """
    try:
        schema = await gemini_service.generate_form_schema(request.prompt)
        return schema
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
