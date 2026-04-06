# VoiceForm: Project Context & Status

## 1. Project Overview
**VoiceForm** is a conversational AI form platform that replaces static inputs with voice-driven multilingual interactions.
- **Creator Role:** Describe form → AI generates schema → Public link shared → View Analytics.
- **Respondent Role:** Open link → Experience form in original or preferred language → Fill via Voice or Manual.

## 2. Current Status (April 6, 2026)

### **Built Features & Improvements**
- **AI Engine (Gemini 3 Flash Preview):** 
  - Token-optimized prompting for high-speed, low-cost generation and translation.
  - Form generation in any creator-chosen language (Hindi, Malayalam, Spanish, etc.).
  - Bi-directional translation: On-demand translation for respondents; Auto-normalization back to Creator's language for submissions.
- **Advanced Analytics Dashboard:**
  - Real-time KPIs: Completion rate, total sessions, and average AI extraction confidence.
  - "Completed-Only" view: Filters out abandoned attempts to keep creator data clean.
  - CSV Export: One-click export of normalized respondent data.
- **UX & Design:**
  - **Luxurious Monochrome System:** Consistent styling across desktop and mobile.
  - **Responsive Engine:** Media-query based utilities for seamless mobile form filling.
  - **Ease-of-Life:** Click-outside-to-close modals, "Copied!" feedback states, and localized translation loaders.
- **Backend (FastAPI + Supabase):**
  - Robust RLS (Row Level Security) policies.
  - Bulk manual submission endpoint to optimize session handling.
  - Optimized form fetching (skips AI translation if languages match).

### **Tech Stack**
- **Frontend:** React 19 + Lucide Icons + Vanilla CSS (Responsive).
- **Backend:** Python 3.12+ + FastAPI + Supabase-py.
- **AI:** Google Gemini 3 Flash Preview (Optimized System Instructions).

---

## 3. Architecture & Design Choices
- **Normalization Principle ("Creator Truth"):** Respondents speak/type in their native tongue, but the system normalizes everything back to the **Creator's original language**. This allows a Malayalam creator to understand an English respondent instantly.
- **Delayed Persistence (Manual Mode):** To avoid "zombie" data, database sessions are not created for manual users until they hit "Submit." This keeps analytics meaningful.
- **Optimized Prompting:** Instead of verbose instructions, we use shorthand JSON schemas and direct constraints to minimize latency and token costs.
- **On-Demand Translation:** We don't pre-translate every form. Translation is requested from Gemini only when a respondent selects a different language in the UI.

---

## 4. Remaining P0 Tasks

### **Task 1: The Voice Loop (CRITICAL)**
Implement the core conversational state machine.
- **Location:** `client/src/hooks/useVoiceSession.js`
- **Logic:**
  1. **TTS:** Use `window.speechSynthesis` to read the current field's `question_phrasing`.
  2. **STT:** Use `window.SpeechRecognition` to capture the respondent's spoken answer.
  3. **Refine:** Send transcript to `/api/v1/public/extract` (passing `form_id` for correct language normalization).
  4. **State:** Move to the next index upon successful extraction.
  5. **Completion:** Mark session as `completed` in Supabase.

### **Task 2: AI Summary Feature**
Enhance the Analytics page with an "AI Insights" panel.
- **Logic:** Fetch all responses for a form, send them to Gemini with a "Summarize trends" prompt, and display key takeaways for the creator.

### **Task 3: Error Recovery (Confidence Check)**
- If extraction confidence is < 0.7, trigger a "Confirmation Loop" where the AI asks: "Just to confirm, did you mean [X]?"

---

## 5. How to Run
1.  **Backend:** `cd server && ./run.sh` (Requires `.env` with Gemini & Supabase keys).
2.  **Frontend:** `cd client && npm run dev`.
3.  **Supabase:** Schema defined in `supabase/migrations/01_initial_schema.sql`.
