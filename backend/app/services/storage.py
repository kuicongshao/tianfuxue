from app.core.config import settings


def active_database_mode() -> str:
    return settings.database_mode


def require_json_mode() -> None:
    if settings.database_mode != "json":
        raise NotImplementedError(
            "DATABASE_MODE=postgres is prepared in docs/database.sql, but this MVP service layer currently uses the local JSON store. "
            "Keep DATABASE_MODE=json for the runnable demo, or implement repository adapters for PostgreSQL."
        )
