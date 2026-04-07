# VoiceForm 🎙️

**VoiceForm** is a conversational, multilingual AI form platform that transforms traditional static forms into dynamic, voice-driven conversations. Instead of clicking through fields, respondents speak naturally in their native language, while our AI listens, understands, and extracts structured data.

Built for accessibility and high-quality data collection, VoiceForm removes the friction of typing, especially for users who prefer native languages over English.

---

## ✨ Core Features

### 🛠️ For Creators
- **AI Form Generation**: Describe your form goal in plain English (e.g., "Customer satisfaction survey for a cafe"), and Gemini generates the optimal field schema instantly.
- **Multilingual Support**: Generate and translate forms into English, Hindi, Malayalam, and Spanish.
- **Insightful Dashboard**: View collected responses with AI-generated sentiment analysis and summaries.
- **Secure Auth**: Creator accounts managed via Supabase Auth.

### 🗣️ For Respondents
- **Voice-First UI**: Complete forms through a natural conversation. No typing required.
- **Real-time Feedback**: Hear questions via Text-to-Speech (TTS) and see live transcriptions via Speech-to-Text (STT).
- **Intelligent Extraction**: Gemini extracts normalized values (names, numbers, dates) from freeform speech.
- **Empathetic Interaction**: A warm, human-like personality designed to make respondents feel heard.

---

## 🚀 Tech Stack

### Frontend
- **React (Vite)**: Modern, fast UI development.
- **Tailwind CSS (v4)**: High-end, "breathable" design with glassmorphism.
- **Web Speech API**: Client-side Speech-to-Text and Text-to-Speech.
- **Lucide React**: Beautiful, consistent iconography.

### Backend
- **FastAPI (Python)**: High-performance asynchronous API layer.
- **Gemini API (`gemini-3.1-flash-lite-preview`)**: Powers form generation and bulk data extraction.
- **Supabase**: Managed Postgres database, Auth, and Storage.

---

## 📂 Project Structure

```text
VoiceForm/
├── client/           # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI (VoiceOrb, Waveform, etc.)
│   │   ├── contexts/    # Auth and Global State
│   │   ├── hooks/       # Voice session logic
│   │   └── pages/       # Dashboard, Home, Respondent View
├── server/           # FastAPI backend
│   ├── app/
│   │   ├── api/         # V1 API Routes
│   │   ├── services/    # Gemini and Supabase logic
│   │   └── models/      # Pydantic schemas
├── supabase/         # Database migrations and seed data
└── GEMINI.md         # Project context and rules
```

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- Supabase Account
- Google Gemini API Key

### 1. Database Setup
1. Create a new Supabase project.
2. Run the SQL in `supabase/migrations/01_initial_schema.sql` in your Supabase SQL Editor.

### 2. Backend Setup
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your GEMINI_API_KEY and SUPABASE details
./run.sh
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Fill in your VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_BACKEND_URL
npm run dev
```

---

## 🎯 Hackathon Focus (P0)
- [x] Creator Sign-up/Login (Supabase).
- [x] AI Form Generation from text prompt.
- [x] Voice-based form filling loop.
- [x] Multilingual support (EN, HI, ML, ES).
- [x] Structured data extraction from speech.
- [x] Response dashboard & AI summaries.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the AI Hackathon.
