from google import genai
from google.genai import types
import json
from typing import List, Dict, Any
from app.core.config import get_settings

class GeminiService:
    def __init__(self):
        settings = get_settings()
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_id = 'gemini-2.5-flash'

    async def generate_form_schema(self, prompt: str) -> Dict[str, Any]:
        """
        Generates a form schema from a text prompt using Gemini 2.5 Flash.
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
                model=self.model_id,
                contents=f"{system_instruction}\n\nUser Prompt: {prompt}",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error generating form: {e}")
            raise e

    async def translate_form(self, schema: Dict[str, Any], target_lang: str) -> Dict[str, Any]:
        """
        Translates a form schema (title, description, and fields) into the target language using Gemini 2.5 Flash.
        """
        lang_map = {"en": "English", "hi": "Hindi", "ml": "Malayalam", "es": "Spanish"}
        target_name = lang_map.get(target_lang, target_lang)

        print(f"Translating form {schema.get('id')} to {target_name}...")

        system_instruction = (
            f"You are a translation expert. Your task is to translate the provided form schema JSON into '{target_name}'.\n"
            "STRICT RULES:\n"
            "1. You MUST return a JSON object with the EXACT same keys as the input.\n"
            "2. Translate the values for 'title' and 'description'.\n"
            "3. For the 'fields' array, you MUST translate the 'question_phrasing' and the 'options' array for EVERY object in the list.\n"
            "4. DO NOT translate 'id', 'form_id', 'type', 'label', 'required', or 'order_index'.\n"
            "5. The output must be valid JSON."
        )
        
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=f"{system_instruction}\n\nInput JSON: {json.dumps(schema)}",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            translated = json.loads(response.text)
            print(f"Translation successful for {target_name}")
            return translated
        except Exception as e:
            print(f"Translation FAILED: {e}")
            return schema

    async def extract_value(self, question: str, field_type: str, transcript: str, language: str) -> Dict[str, Any]:
        """
        Extracts structured value using Gemini 2.5 Flash for well-rounded performance.
        """
        system_instruction = (
            "You are an expert data extractor. Given a question, a field type, a user's spoken transcript, "
            "and the language used, extract the structured value. "
            "Return a JSON object with: 'value', 'confidence' (float 0.0 to 1.0), and 'ambiguous' (boolean). "
            "CRITICAL: If the answer is in a language other than English, translate the extracted 'value' into English."
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
                model=self.model_id,
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
