VoiceForm — Project Context for Gemini CLIYou are an AI coding assistant working on VoiceForm, a Conversational Multilingual AI Form Platform built for a hackathon. This file is your primary reference. Read it fully before writing any code or making suggestions.What This Product IsVoiceForm transforms traditional static forms into dynamic, voice-driven, multilingual conversations. Instead of clicking through form fields, a respondent talks — the system listens, understands, extracts structured data, and moves to the next question like a human interviewer would.The core insight: Millions of users (especially in India) are more comfortable speaking in their native language than typing in a foreign one. VoiceForm removes that friction entirely.The Three Core User Roles1. Creator (Authenticated)Must register/login to access the dashboard.Describes the form they want in plain English (or their language).The system generates a structured form with fields, types, and validation.Generates a unique public link for respondents.Views collected responses + AI-generated summary on a private dashboard.2. Respondent (Public/Anonymous)Opens a shared public link (No login required).Selects their preferred language.Completes the form through a voice conversation (no typing).Hears questions via TTS, answers via microphone, gets confirmations.3. (Implicit) SystemOrchestrates the conversation state machine.Extracts structured values from freeform speech.Translates between respondent language and creator language.Feature PrioritiesP0 — Must ship (core MVP)User Authentication: Sign-up/Login for Creators (Supabase Auth).Form creation via text prompt → AI-generated field schema.Voice-based form filling: TTS questions + STT answers.Multilingual support (minimum: English, Hindi, Malayalam).Confirmation/retry loop when confidence is low.Structured data extraction from conversational speech.Responses dashboard with raw answers + AI-generated summary.P1 — Build if time allowsForm creation via voice (creator speaks the description).Translation of responses into creator's preferred language.Completion rate and drop-off analytics per field.Store original audio alongside extracted value.P2 — Out of scope for hackathonPDF/CSV export.Webhooks or third-party integrations.Custom branding or white-labeling.Core Data ModelsForm
  id
  creator_id             -- References Supabase Auth User ID
  title
  description
  creator_language       -- language the creator works in
  is_public              -- Default: true
  created_at

FormField
  id
  form_id
  label                  -- internal name (e.g. "full_name")
  question_phrasing      -- what gets spoken to respondent (e.g. "What is your full name?")
  type                   -- text | number | date | phone | email | choice
  options                -- only for type=choice
  required               -- bool
  validation_rules       -- JSON (min, max, pattern, etc.)
  order                  -- field sequence

Session
  id
  form_id
  respondent_language
  status                 -- in_progress | completed | abandoned
  started_at
  completed_at

Response
  id
  session_id
  field_id
  raw_transcript         -- exactly what the user said, in their language
  extracted_value        -- normalized, structured value
  translated_value       -- value in creator's language (if different)
  audio_url              -- optional, raw audio blob
  confidence             -- float 0.0 to 1.0
  attempts               -- how many retries were needed
The Voice Conversation LoopThis is the most important flow in the product. When implementing the respondent experience, follow this state machine exactly:START SESSION
  └─ Load form fields in order
  └─ Set respondent language

FOR EACH FIELD:
  1. TTS: Speak question_phrasing (translated to respondent language)
  2. Record user speech
  3. STT: Transcribe audio → raw_transcript (WebSpeech API)
  4. LLM: Extract value from transcript (Gemini API)
       Input: { question, field_type, transcript, language }
       Output: { value, confidence, ambiguous }
  5. IF confidence < 0.7 OR ambiguous:
       TTS: "Just to confirm — you said [value], is that correct?"
       IF yes → save, move to next field
       IF no  → re-ask question (max 3 attempts)
  6. IF confidence >= 0.7:
       Save silently, move to next field

ALL FIELDS DONE:
  └─ TTS: "All done. Your response has been submitted."
  └─ Mark session as completed
Tech Stack (FINALIZED)LayerSelectionNotesFrontendReact (Vite)Main UI library.BackendPython (FastAPI/Flask)Handles Gemini API and complex logic.DatabaseSupabase (Postgres)Stores forms, fields, and responses.AuthSupabase AuthUsed only for Creators.LLMGemini APIFor form generation and intent extraction.STTWeb Speech APIClient-side transcription.TTSWeb Speech APIClient-side synthesis.TranslationGoogle Translate APIFor UI and question translation.StorageSupabase StorageFor storing response audio blobs.Code Generation GuidelinesGeneralAuth Logic: Always verify the JWT for /api/creator/* routes. Do NOT require auth for /api/public/forms/:id or /api/responses/submit.Write clean, readable code with clear variable names.Prefer simple implementations — this is a hackathon, not production.FrontendKeep Creator Dashboard (/dashboard) and Respondent View (/f/:formId) as separate routes.The voice UI should clearly show: current question, recording state, transcript preview, and progress bar.Backend / APIUse Python's type hinting for better AI understanding.Wrap Gemini API calls with robust error handling for rate limits or malformed JSON.What You Should Always DoCheck for Creator session/auth before allowing form modifications.Ensure the public form link is accessible without a session token.Follow the data model field names when creating DB schema or API responses.Validate all Gemini JSON outputs before using them.What You Should Never DoDo not require a login for a respondent to fill out a form.Do not hardcode language strings in components.Do not let the LLM control conversation flow — it is an extraction tool only.Do not start with P1 or P2 features before P0 is working end-to-end.
