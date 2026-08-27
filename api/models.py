from sqlalchemy.orm import Mapped, mapped_column
import app


class Music(app.db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    filepath: Mapped[str] = mapped_column(unique=True)
