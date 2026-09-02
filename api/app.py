import os
from typing import Any
from flask import Flask
from sqlalchemy.types import JSON
from sqlalchemy.orm import DeclarativeBase, registry
from flask_sqlalchemy import SQLAlchemy

mapper_registry = registry(type_annotation_map={dict[str, Any]: JSON})


class Base(DeclarativeBase):
    registry = mapper_registry


db = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql+psycopg://{os.environ["DB_USERNAME"]}:{os.environ["DB_PASSWORD"]}@localhost/welc"
)
db.init_app(app)
