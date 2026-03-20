from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

	app_name: str = "AI Event Concierge API"
	app_version: str = "1.0.0"
	environment: str = "development"
	host: str = "0.0.0.0"
	port: int = 8000
	cors_origins: list[str] = ["*"]

	supabase_url: str = Field("", alias="SUPABASE_URL")
	supabase_service_role_key: str = Field("", alias="SUPABASE_SERVICE_ROLE_KEY")
	supabase_sessions_table: str = Field("sessions", alias="SUPABASE_SESSIONS_TABLE")
	supabase_proposals_table: str = Field("proposals", alias="SUPABASE_PROPOSALS_TABLE")
	groq_api_key: str = Field("", alias="GROQ_API_KEY")
	groq_model: str = Field("llama-3.3-70b-versatile", alias="GROQ_MODEL")


settings = Settings()
