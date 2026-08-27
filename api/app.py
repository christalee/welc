import os
from flask import Flask
from sqlalchemy.orm import DeclarativeBase
from flask_sqlalchemy import SQLAlchemy


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql+psycopg://{os.environ["DB_USERNAME"]}:{os.environ["DB_PASSWORD"]}@localhost/welc"
)
db.init_app(app)

from models import Music
from api import *

with app.app_context():
  db.create_all()
