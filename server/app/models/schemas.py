from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class FormGenerationRequest(BaseModel):
    prompt: str
    creator_id: str # We need to know who is creating the form

class FormListResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    created_at: str

class ExtractionRequest(BaseModel):
    question: str
    field_type: str
    transcript: str
    language: str

class ExtractionResponse(BaseModel):
    value: Any
    confidence: float
    ambiguous: bool

class FormFieldSchema(BaseModel):
    id: Optional[str] = None # Added for DB response
    form_id: Optional[str] = None # Added for DB response
    label: str
    question_phrasing: str
    type: str
    options: Optional[List[str]] = None
    required: bool = True
    validation_rules: Optional[Dict[str, Any]] = None
    order_index: int

class FormSchemaResponse(BaseModel):
    id: str # Added ID returned from the database
    title: str
    description: Optional[str] = None
    fields: List[FormFieldSchema]
