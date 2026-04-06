from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import FormGenerationRequest, FormSchemaResponse, FormListResponse, AnalyticsResponse
from app.services.gemini_service import gemini_service
from app.services.supabase_service import supabase_service
from typing import List

router = APIRouter()

@router.get("/forms/{form_id}/analytics", response_model=AnalyticsResponse)
async def get_form_analytics(form_id: str):
    """
    Retrieve comprehensive analytics and responses for a specific form.
    """
    try:
        analytics = await supabase_service.get_form_analytics(form_id)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=FormSchemaResponse)
async def generate_form(request: FormGenerationRequest):
    """
    Generate a form schema using Gemini from a text prompt and save it to Supabase.
    """
    try:
        # 1. Generate the raw schema from Gemini
        schema = await gemini_service.generate_form_schema(request.prompt, request.language)
        
        # 2. Save the generated schema into the Supabase 'forms' and 'form_fields' tables
        saved_form = await supabase_service.create_form(creator_id=request.creator_id, schema=schema, language=request.language)
        
        # Return the saved form, which now includes the DB-generated 'id'
        return saved_form
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forms", response_model=List[FormSchemaResponse])
async def get_creator_forms(creator_id: str = Query(..., description="The user ID of the creator")):
    """
    Retrieve all forms (with fields) created by a specific user.
    """
    try:
        # We'll use a slightly different approach to get forms + fields
        # In a real app, a join or dedicated RPC would be better, but we'll fetch them individually for now
        forms = await supabase_service.get_forms(creator_id)
        
        full_forms = []
        for f in forms:
            full_form = await supabase_service.get_public_form(f["id"])
            full_forms.append(full_form)
            
        return full_forms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
