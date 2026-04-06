from google import genai
from google.genai import types
import json
from typing import List, Dict, Any
from app.core.config import get_settings

class GeminiService:
    def __init__(self):
        settings = get_settings()
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        # We'll use these IDs with the new client
        self.lite_model_id = 'gemini-3.1-flash-lite-preview'
        self.live_model_id = 'gemini-3.1-flash-live-preview'

    async def generate_form_schema(self, prompt: str) -> Dict[str, Any]:
        """
        Generates a form schema from a text prompt using Gemini 3.1 Flash-Lite.
        """
        system_instruction = (
            "You are a form generation expert. Given a description of a form, "
            "generate a structured JSON schema. The output MUST be a JSON object with: "
            "title, description, and an array 'fields'. "
            "Each field MUST have: label, question_phrasing, type, options (if type is 'choice'), "
            "required (boolean), validation_rules (json), and order_index (integer starting from 0). "
            "Valid types: 'text', 'number', 'date', 'phone', 'email', 'choice'."
        )
        
        try:
            response = self.client.models.generate_content(
                model=self.lite_model_id,
                contents=f"{system_instruction}\n\nUser Prompt: {prompt}",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            # In the new SDK, the response object has a .text attribute or we can parse directly
            return json.loads(response.text)
        except Exception as e:
            print(f"Error generating form: {e}")
            raise e

    async def extract_value(self, question: str, field_type: str, transcript: str, language: str) -> Dict[str, Any]:
        """
        Extracts structured value using Gemini 3.1 Flash-Lite for low latency.
        """
        system_instruction = (
            "You are an expert data extractor. Given a question, a field type, a user's spoken transcript, "
            "and the language used, extract the structured value. "
            "Return a JSON object with: 'value', 'confidence' (float 0.0 to 1.0), and 'ambiguous' (boolean). "
            "If the transcript doesn't match the field type or is unclear, set ambiguous=true."
        )
        
        prompt = (
            f"Question: {question}\n"
            f"Field Type: {field_type}\n"
            f"User Transcript: {transcript}\n"
            f"Language: {language}"
        )
        
        try:
            response = self.client.models.generate_content(
                model=self.lite_model_id,
                contents=f"{system_instruction}\n\n{prompt}",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error extracting value: {e}")
            raise e

# Instantiate as a singleton
gemini_service = GeminiService()
