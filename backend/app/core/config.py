from pydantic_settings import BaseSettings
import dotenv

env= dotenv.load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Supabase Backend"
    SUPABASE_URL: str = env.SUPABASE_URL
    SUPABASE_KEY: str = env.SUPABASE_KEY

    class Config:
        env_file = ".env"

settings = Settings()
