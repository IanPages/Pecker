from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError("Supabase credentials are not set in environment variables.")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# You can import this instance in your routers/services
try:
    supabase = get_supabase_client()
except ValueError:
    supabase = None
