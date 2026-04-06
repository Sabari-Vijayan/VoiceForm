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
            response = self.client.table("forms").select("*").eq("id", form_id).eq("is_public", True).execute()
            
            if not response.data:
                print(f"Form {form_id} not found or is private")
                raise Exception("Form not found or is private")
            
            form = response.data[0]
            
            # Fetch fields
            fields_response = self.client.table("form_fields").select("*").eq("form_id", form_id).order("order_index").execute()
            
            # Merge fields into form
            form["fields"] = fields_response.data if fields_response.data else []
            
            return form
        except Exception as e:
            print(f"Error fetching public form: {e}")
            raise e

    async def create_session(self, form_id: str, language: str) -> Dict[str, Any]:
        """
        Creates a new session for a respondent.
        """
        try:
            session_data = {
                "form_id": form_id,
                "respondent_language": language,
                "status": "in_progress"
            }
            response = self.client.table("sessions").insert(session_data).execute()
            if not response.data:
                raise Exception("Failed to create session")
            return response.data[0]
        except Exception as e:
            print(f"Error creating session: {e}")
            raise e

    async def save_response(self, session_id: str, field_id: str, result: Dict[str, Any], transcript: str) -> Dict[str, Any]:
        """
        Saves a single question's extracted response.
        """
        try:
            response_data = {
                "session_id": session_id,
                "field_id": field_id,
                "raw_transcript": transcript,
                "extracted_value": result.get("value"),
                "confidence": result.get("confidence", 0.0),
                "attempts": 1
            }
            response = self.client.table("responses").insert(response_data).execute()
            return response.data[0]
        except Exception as e:
            print(f"Error saving response: {e}")
            raise e

    async def submit_bulk_manual_responses(self, form_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a session and multiple responses in one go for manual submissions.
        Only marks as 'completed' if data is actually submitted.
        """
        try:
            # 1. Create session
            session = await self.create_session(form_id, data.get("respondent_language", "en"))
            session_id = session["id"]

            # 2. Bulk insert responses
            responses = []
            for field_id, value in data.get("responses", {}).items():
                responses.append({
                    "session_id": session_id,
                    "field_id": field_id,
                    "extracted_value": value,
                    "raw_transcript": "manual_entry",
                    "confidence": 1.0,
                    "attempts": 1
                })
            
            if responses:
                self.client.table("responses").insert(responses).execute()
            
            # 3. Mark session as completed
            self.client.table("sessions").update({"status": "completed", "completed_at": "now()"}).eq("id", session_id).execute()
            
            return {"status": "success", "session_id": session_id}
        except Exception as e:
            print(f"Error in submit_bulk_manual_responses: {e}")
            raise e

    async def get_form_analytics(self, form_id: str) -> Dict[str, Any]:
        """
        Retrieves comprehensive analytics and responses for a specific form.
        Top level stats include all sessions, but the 'sessions' list only contains completed ones.
        """
        try:
            # 1. Fetch Form + Fields
            form = await self.get_public_form(form_id)
            fields = {f["id"]: f["label"] for f in form["fields"]}
            
            # 2. Fetch ALL sessions for this form to calculate stats
            all_sessions_res = self.client.table("sessions").select("*").eq("form_id", form_id).execute()
            all_sessions = all_sessions_res.data if all_sessions_res.data else []
            
            # 3. Filter sessions for the detailed list (Completed only)
            completed_sessions = [s for s in all_sessions if s["status"] == "completed"]
            # Sort completed sessions by date
            completed_sessions.sort(key=lambda x: x["started_at"], reverse=True)
            
            # 4. Fetch all responses for the COMPLETED sessions
            session_ids = [s["id"] for s in completed_sessions]
            responses_list = []
            if session_ids:
                responses_res = self.client.table("responses").select("*").in_("session_id", session_ids).execute()
                responses_list = responses_res.data if responses_res.data else []
                
            # 5. Group responses by session
            session_map = {s["id"]: [] for s in completed_sessions}
            for r in responses_list:
                if r["session_id"] in session_map:
                    session_map[r["session_id"]].append({
                        "field_id": r["field_id"],
                        "label": fields.get(r["field_id"], "Unknown"),
                        "value": r["extracted_value"],
                        "confidence": r["confidence"] or 0.0,
                        "raw_transcript": r["raw_transcript"]
                    })
            
            # 6. Build Stats from ALL sessions
            completed_count = 0
            total_confidence = 0
            confidence_count = 0
            lang_dist = {}
            
            for s in all_sessions:
                if s["status"] == "completed":
                    completed_count += 1
                
                lang = s["respondent_language"]
                lang_dist[lang] = lang_dist.get(lang, 0) + 1
            
            # Use only responses from completed sessions for confidence avg to avoid skewing
            for s_id, s_responses in session_map.items():
                for r in s_responses:
                    total_confidence += r["confidence"]
                    confidence_count += 1
            
            total_sessions = len(all_sessions)
            avg_confidence = (total_confidence / confidence_count) if confidence_count > 0 else 0
            comp_rate = (completed_count / total_sessions * 100) if total_sessions > 0 else 0
            
            # 7. Map responses back to session analytics
            session_analytics = []
            for s in completed_sessions:
                session_analytics.append({
                    **s,
                    "responses": session_map[s["id"]]
                })
            
            return {
                "total_sessions": total_sessions,
                "completed_sessions": completed_count,
                "completion_rate": round(comp_rate, 1),
                "average_confidence": round(avg_confidence, 2),
                "responses_by_language": lang_dist,
                "sessions": session_analytics,
                "form": form
            }
        except Exception as e:
            print(f"Error in get_form_analytics: {e}")
            raise e
        except Exception as e:
            print(f"Error in get_form_analytics: {e}")
            raise e

# Instantiate as singleton
supabase_service = SupabaseService()
