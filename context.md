# VoiceForm: Project Context & Handover

## 1. Project Overview
**VoiceForm** is a conversational AI form platform that replaces static inputs with voice-driven multilingual interactions.
- **Creator Role:** Describe form → AI generates schema → Public link shared.
- **Respondent Role:** Open link → Select language → Fill via Voice (AI-guided) or Manual.

## 2. Current Status (April 6, 2026)

### **Built Features**
- **AI Core:** `GeminiService` implemented using `google-genai` (Gemini 2.5 Flash).
  - Handles form generation from text prompts.
  - Handles dynamic translation of entire form schemas.
  - Handles structured data extraction from transcripts (with auto-translation to English).
- **Backend (FastAPI):**
  - Persistence layer integrated with Supabase.
  - Creator API: `/generate`, `/forms` (returns full schema + fields).
  - Public API: `/forms/{id}?lang=XX`, `/sessions` (start tracking).
- **Frontend (React/Vite):**
  - **Auth:** Supabase Auth integrated (Login/Register/ProtectedRoute).
  - **Dashboard:** Sleek, monochrome sidebar-based UI. AI form generation + structure preview modals.
  - **Respondent View:** Cinema-mode landing page. Dynamic language selection with instant AI translation of fields. Dual-mode support (Voice/Manual).
- **Design System:** Minimalist Monochrome (Vercel/Linear style). Defined in `index.css`.

### **Tech Stack**
- **Frontend:** React + Lucide Icons + Vanilla CSS.
- **Backend:** Python + FastAPI + Supabase-py.
- **Database:** Supabase (Postgres).
- **AI:** Google Gemini 2.5 Flash.

---

## 3. Architecture & Design Choices
- **Data Normalization:** Respondents can speak/type in any language, but Gemini is instructed to **extract and save values in English** for the creator's benefit.
- **On-Demand Translation:** Forms are translated by the AI only when a respondent requests a specific language, avoiding the need to pre-translate every form.
- **Monochrome Aesthetic:** "Luxurious Monochrome" using `Inter` typography, soft corners (14px), and high whitespace.

---

## 4. Remaining Tasks (P0 Roadmap)

### **Task 1: The Voice Loop (CRITICAL)**
Implement the `useVoiceSession` hook in `client/src/hooks/`.
- **Logic:**
  1.  Speak `form.fields[current].question_phrasing` using `window.speechSynthesis`.
  2.  Listen for answer using `window.SpeechRecognition`.
  3.  POST to `/api/v1/public/extract` with the transcript.
  4.  Update UI with extracted value and move to `index + 1`.
  5.  Final TTS: "Thank you, your form is submitted."

### **Task 2: Manual Data Persistence**
- The "Manual" form in `RespondentFormView.jsx` currently simulates submission.
- **To-do:** Implement a backend route `POST /api/v1/public/responses/bulk` to save the `manualData` object to the `responses` table.

### **Task 3: Results Dashboard**
- Currently, the "Results" button on the dashboard is a placeholder.
- **To-do:** Create `client/src/pages/ResponsesPage.jsx`.
  - Fetch all entries from the `responses` table for a `form_id`.
  - Display a table/grid of the normalized (English) data.
  - Add an "AI Summary" feature that uses Gemini to summarize all responses into key bullet points.

---

## 5. How to Run
1.  **Backend:** `cd server && ./run.sh` (Requires `.env` with Gemini & Supabase keys).
2.  **Frontend:** `cd client && npm run dev`.
3.  **Supabase:** Run `supabase/migrations/01_initial_schema.sql` in the SQL editor.
