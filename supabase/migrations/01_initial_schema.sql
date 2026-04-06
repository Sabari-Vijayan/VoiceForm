-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Forms Table
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    creator_language VARCHAR(10) NOT NULL DEFAULT 'en',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Form Fields Table (One-to-Many with Forms)
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    question_phrasing TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'phone', 'email', 'choice')),
    options JSONB, -- Array of strings for 'choice' type
    required BOOLEAN DEFAULT true,
    validation_rules JSONB, -- Min, Max, Pattern, etc.
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    respondent_language VARCHAR(10) NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 4. Responses Table
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
    raw_transcript TEXT,
    extracted_value JSONB,
    translated_value JSONB,
    audio_url TEXT,
    confidence FLOAT DEFAULT 0.0,
    attempts INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Forms: Creators can manage their own; Respondents can read public forms.
CREATE POLICY "Creators can manage their own forms" ON public.forms
    FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Public can view public forms" ON public.forms
    FOR SELECT USING (is_public = true);

-- Form Fields: Anyone who can view the form can view its fields.
CREATE POLICY "Public can view fields of public forms" ON public.form_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_fields.form_id AND forms.is_public = true
        )
    );

CREATE POLICY "Creators can manage their own form fields" ON public.form_fields
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_fields.form_id AND forms.creator_id = auth.uid()
        )
    );

-- Sessions: Public can insert; Creators can view sessions for their forms.
CREATE POLICY "Public can create sessions" ON public.sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can view sessions for their forms" ON public.sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = sessions.form_id AND forms.creator_id = auth.uid()
        )
    );

-- Responses: Public can insert; Creators can view responses for their forms.
CREATE POLICY "Public can submit responses" ON public.responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can view responses for their forms" ON public.responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            JOIN public.forms ON forms.id = sessions.form_id
            WHERE sessions.id = responses.session_id AND forms.creator_id = auth.uid()
        )
    );
