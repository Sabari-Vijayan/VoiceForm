from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class FormGenerationRequest(BaseModel):
    prompt: str

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
    label: str
    question_phrasing: str
    type: str
    options: Optional[List[str]] = None
    required: bool = True
    validation_rules: Optional[Dict[str, Any]] = None
    order_index: int

class FormSchemaResponse(BaseModel):
    title: str
    description: Optional[str] = None
    fields: List[FormFieldSchema]
