from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://sih_user:sih_password@localhost:5432/sih_platform"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    pinecone_api_key: str = ""
    pinecone_index: str = "sih-platform"
    pinecone_cloud: str = "aws"
    pinecone_region: str = "us-east-1"

    express_url: str = "http://localhost:5000"
    cors_origin: str = "http://localhost:5173"

    @property
    def ai_enabled(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def vector_enabled(self) -> bool:
        return bool(self.pinecone_api_key)


# Hybrid recommendation engine weights — tune here without touching logic.
MATCH_WEIGHTS = {
    "skill": 0.40,
    "semantic": 0.25,
    "interest": 0.15,
    "experience": 0.10,
    "eligibility": 0.10,
}

settings = Settings()
