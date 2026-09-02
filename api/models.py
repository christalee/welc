from sqlalchemy.orm import Mapped, mapped_column
from typing import Any

import app


class Music(app.db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    filepath: Mapped[str] = mapped_column(unique=True)
    metadata_json: Mapped[dict[str, Any] | None]
