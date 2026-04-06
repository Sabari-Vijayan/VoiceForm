from fastapi import APIRouter, HTTPException
from app.models.schemas import ExtractionRequest, ExtractionResponse, FormSchemaWithFields, SessionCreateRequest, SessionResponse, BulkResponseSubmit
from app.services.gemini_service import gemini_service
from app.services.supabase_service import supabase_service

router = APIRouter()

@router.post("/forms/{form_id}/submit")
async def submit_manual_responses(form_id: str, request: BulkResponseSubmit):
    """
    Save bulk manual responses.
    """
    try:
        result = await supabase_service.submit_bulk_manual_responses(form_id, request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forms/{form_id}", response_model=FormSchemaWithFields)
async def get_public_form(form_id: str, lang: str = "en"):
    """
    Retrieve a public form and its fields, optionally translated.
    """
    try:
        # 1. Fetch the original form from DB
        form = await supabase_service.get_public_form(form_id)
        print(f"Fetched form: {form.get('title')} (Creator Lang: {form.get('creator_language')})")
        
        # 2. If a different language is requested, translate the schema
        if lang and lang != "en" and lang != form.get("creator_language"):
            print(f"ACTUALLY Requesting translation to: {lang}")
            translated_form = await gemini_service.translate_form(form, lang)
            print(f"Returning translated form: {translated_form.get('title')}")
            return translated_form
            
        print("Returning original form (no translation needed)")
        return form
    except Exception as e:
        print(f"Error in get_public_form: {e}")
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/sessions", response_model=SessionResponse)
async def start_session(request: SessionCreateRequest):
    """
    Start a new voice session for a form.
    """
    try:
        session = await supabase_service.create_session(request.form_id, request.respondent_language)
        return {
            "session_id": session["id"],
            "form_id": session["form_id"],
            "respondent_language": session["respondent_language"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
