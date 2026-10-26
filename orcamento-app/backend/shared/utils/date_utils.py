from datetime import datetime, timezone

def utc_now() -> datetime:
    """Retorna datetime UTC sem fuso para persistência correta no banco."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

def format_date_br(dt: datetime) -> str:
    """Formata data no padrão brasileiro dd/mm/aaaa."""
    if not dt:
        return ""
    return dt.strftime("%d/%m/%Y")
