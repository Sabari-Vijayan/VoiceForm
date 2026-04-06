from google import genai
from google.genai import types
import json
from typing import List, Dict, Any
from app.core.config import get_settings

class GeminiService:
    def __init__(self):
        settings = get_settings()
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_id = 'gemini-3-flash-preview'

    async def generate_form_schema(self, prompt: str, language: str = 'en') -> Dict[str, Any]:
        """
        Generates form JSON. Optimized for tokens.
        """
        lang_map = {"en": "English", "hi": "Hindi", "ml": "Malayalam", "es": "Spanish"}
        L = lang_map.get(language, "English")

        sys = (
            f"Output JSON for a form in {L}. Fields: label(slug), question_phrasing({L}), "
            "type(text|number|date|phone|email|choice), options(array if choice), "
            "required(bool), order_index(int). Keys: title, description, fields."
        )
        
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=f"{sys}\nPrompt: {prompt}",
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error: {e}")
            raise e

    async def translate_form(self, schema: Dict[str, Any], target_lang: str) -> Dict[str, Any]:
        """
        Translates schema. Optimized for tokens.
        """
        lang_map = {"en": "English", "hi": "Hindi", "ml": "Malayalam", "es": "Spanish"}
        T = lang_map.get(target_lang, target_lang)

        sys = f"Translate JSON values to {T}. Keep keys, ids, types, labels same. Translate title, description, question_phrasing, options."
        
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=f"{sys}\nJSON: {json.dumps(schema)}",
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Fail: {e}")
            return schema

    async def extract_value(self, question: str, field_type: str, transcript: str, language: str, target_lang: str = 'en') -> Dict[str, Any]:
        """
        Extracts and translates. Optimized for tokens.
        """
        lang_map = {"en": "English", "hi": "Hindi", "ml": "Malayalam", "es": "Spanish"}
        T = lang_map.get(target_lang, "English")
        L = lang_map.get(language, language)

        sys = (
            f"Extract '{field_type}' from transcript. "
            f"Return JSON: {{'value': (translated to {T}), 'raw_value': (exact value from transcript in {L}), 'confidence': float, 'ambiguous': bool}}."
        )
        
        prompt = f"Q: {question}\nLang: {language}\nTranscript: {transcript}"
        
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=f"{sys}\n{prompt}",
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error: {e}")
            raise e

    async def translate_text(self, text: str, target_lang: str) -> str:
        """
        Translates a single string.
        """
        lang_map = {"en": "English", "hi": "Hindi", "ml": "Malayalam", "es": "Spanish"}
        T = lang_map.get(target_lang, target_lang)

        sys = f"Translate text to {T}. Return only the translated string, no JSON."
        
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=f"{sys}\nText: {text}"
            )
            return response.text.strip()
        except Exception as e:
            return text

# Instantiate as a singleton
gemini_service = GeminiService()
