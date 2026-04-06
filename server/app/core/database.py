import supabase
from app.core.config import get_settings

settings = get_settings()

if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
    raise ValueError("Supabase credentials are required. Please check your .env file.")

supabase_client = supabase.create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
