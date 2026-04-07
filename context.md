# VoiceForm: Project Context & Status

## 1. Project Overview
**VoiceForm** is a conversational AI form platform that replaces static inputs with voice-driven, human-like, multilingual interactions.
- **Creator Role:** Describe form → AI generates schema → Public link shared → View Analytics.
- **Respondent Role:** Open link → Selection/Preview → High-fidelity Voice Interview or Manual Entry → Review & Submit.

## 2. Current Status (April 7, 2026)

### **Key Improvements & Features Added**
- **Bulk Extraction Engine (Optimized for Quota & Speed):**
  - Shifted from per-question extraction to a single **Bulk Pass** at the end of the interview.
  - Reduces Gemini API calls by ~80%, resolving `429 Resource Exhausted` errors on free tiers.
  - Uses `gemini-1.5-flash` for high-throughput NLU.
- **Human-Centric Voice Interface (Vertex AI Cloud TTS):**
  - Replaced browser `SpeechSynthesis` with **Google Cloud Studio Voices** (`en-US-Studio-Q`).
  - Implemented **SSML (Speech Synthesis Markup Language)** to inject natural "breaths" (400ms pauses) and a calm, 90% speaking rate.
  - Added **"Caring" Persona**: Gemini re-phrases form questions to be warm and conversational during translation.
  - Added **Conversational Fillers**: Randomized acknowledgments like "Got it!", "Hmm, let's see...", and "Wonderful" between questions.
- **Robust State Machine & Error Handling:**
  - Added a **Review & Submit** mode: Users can verify and edit AI-extracted values before final database persistence.
  - **Live Buffering**: Transcripts are buffered in real-time; if a user switches to "Manual Mode" mid-interview, their spoken answers are pre-filled.
  - **JSON Resilience**: Backend now includes regex-based cleaning to handle malformed AI responses or extra conversational filler from LLMs.

### **Tech Stack**
- **Frontend:** React 19 + Lucide Icons + Web Speech API (STT) + HTML5 Audio (Cloud TTS).
- **Backend:** Python 3.12+ + FastAPI + Supabase-py.
- **AI/Cloud:** 
  - **Google Gemini 1.5 Flash**: Bulk entity extraction and form translation.
  - **Vertex AI Text-to-Speech**: Studio-grade voice synthesis.
  - **Supabase**: RLS-secured Postgres and Auth.

---

## 3. Architecture & Design Choices
- **Delayed Persistence**: Sessions are finalized only after the "Review & Submit" step to ensure high data quality.
- **Normalization ("Creator Truth")**: All multilingual responses are normalized back to the Creator's language during the Bulk Extraction pass.
- **SSML Layer**: Direct text-to-speech is wrapped in SSML `<prosody>` and `<break>` tags to solve the "robotic" tone issue.

---

## 4. Remaining P0/P1 Tasks

### **Task 1: AI Summary (P0)**
Implement the "AI Insights" panel in the Creator Dashboard to summarize trends across all responses.

### **Task 2: Audio Archiving (P1)**
Store raw base64 audio fragments in Supabase Storage for the creator to hear the "emotion" behind the text.

### **Task 3: Voice Form Creation (P1)**
Allow creators to describe their form via voice instead of typing the prompt.

---

## 5. How to Run
1.  **Backend:** `cd server && ./run.sh`. 
    - Requires `.env` (Gemini/Supabase) AND `gcp-key.json` (Service Account for TTS).
    - Ensure `GOOGLE_APPLICATION_CREDENTIALS` points to the key.
2.  **Frontend:** `cd client && npm run dev`.
