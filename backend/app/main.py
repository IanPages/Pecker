from fastapi import FastAPI
from app.core.config import settings
from app.db.supabase import supabase

app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the FastAPI Backend!",
        "supabase_connected": supabase is not None
    }
