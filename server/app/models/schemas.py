from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class FormGenerationRequest(BaseModel):
    prompt: str
    creator_id: str
    language: Optional[str] = 'en'

class SessionCreateRequest(BaseModel):
    form_id: str
    respondent_language: str

class SessionResponse(BaseModel):
    session_id: str
    form_id: str
    respondent_language: str

class FormListResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    created_at: Any # Using Any to handle datetime objects from Supabase

class FormSchemaWithFields(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    creator_language: str
    fields: List[FormFieldSchema]

class ExtractionRequest(BaseModel):
    form_id: str
    question: str
    field_type: str
    transcript: str
    language: str

class ExtractionResponse(BaseModel):
    value: Any
    raw_value: Any
    confidence: float
    ambiguous: bool

class BulkResponseSubmit(BaseModel):
    respondent_language: str
    responses: Dict[str, Any] # field_id -> value

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

class ResponseValue(BaseModel):
    field_id: str
    label: str
    value: Any
    confidence: float
    raw_transcript: Optional[str] = None

class SessionAnalytics(BaseModel):
    id: str
    respondent_language: str
    status: str
    started_at: Any
    completed_at: Optional[Any] = None
    responses: List[ResponseValue]

class AnalyticsResponse(BaseModel):
    total_sessions: int
    completed_sessions: int
    completion_rate: float
    average_confidence: float
    responses_by_language: Dict[str, int]
    sessions: List[SessionAnalytics]
    form: FormSchemaWithFields
