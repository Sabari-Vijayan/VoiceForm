from app.core.database import supabase_client
from typing import Dict, Any, List

class SupabaseService:
    def __init__(self):
        self.client = supabase_client

    async def create_form(self, creator_id: str, schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Saves a generated form and its fields to Supabase.
        """
        try:
            # 1. Insert Form
            form_data = {
                "creator_id": creator_id,
                "title": schema.get("title"),
                "description": schema.get("description", ""),
                "creator_language": "en" # Defaulting for MVP
            }
            
            form_response = self.client.table("forms").insert(form_data).execute()
            if not form_response.data:
                raise Exception("Failed to create form")
                
            form_id = form_response.data[0]["id"]
            
            # 2. Insert Fields
            fields_data = []
            for field in schema.get("fields", []):
                fields_data.append({
                    "form_id": form_id,
                    "label": field.get("label"),
                    "question_phrasing": field.get("question_phrasing"),
                    "type": field.get("type"),
                    "options": field.get("options"),
                    "required": field.get("required", True),
                    "validation_rules": field.get("validation_rules"),
                    "order_index": field.get("order_index")
                })
                
            if fields_data:
                fields_response = self.client.table("form_fields").insert(fields_data).execute()
                if not fields_response.data:
                    raise Exception("Failed to create form fields")

            # Return the combined result
            return {
                "id": form_id,
                **form_data,
                "fields": fields_data
            }
            
        except Exception as e:
            print(f"Error in create_form: {e}")
            raise e

    async def get_forms(self, creator_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all forms for a specific creator.
        """
        try:
            response = self.client.table("forms").select("*").eq("creator_id", creator_id).execute()
            return response.data
        except Exception as e:
            print(f"Error fetching forms: {e}")
            raise e
            
    async def get_public_form(self, form_id: str) -> Dict[str, Any]:
        """
        Retrieves a public form and its fields for the respondent view.
        """
        try:
            # Fetch form
            form_response = self.client.table("forms").select("*").eq("id", form_id).eq("is_public", True).single().execute()
            
            # Fetch fields
            fields_response = self.client.table("form_fields").select("*").eq("form_id", form_id).order("order_index").execute()
            
            return {
                **form_response.data,
                "fields": fields_response.data
            }
        except Exception as e:
            print(f"Error fetching public form: {e}")
            raise e

# Instantiate as singleton
supabase_service = SupabaseService()
