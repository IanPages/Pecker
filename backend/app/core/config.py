from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Supabase Backend"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    # Comma separated list of frontend URLs allowed by CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    # Pydantic v2 configuration style
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

settings = Settings()