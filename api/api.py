from flask import request
from tinytag import TinyTag
from pathlib import Path
from sqlalchemy.engine import Row

from app import app, db
from models import Music

AUDIO_EXTENSIONS = ["*.mp3", "*.ogg", "*.flac", "*.wav", "*.m4a"]


@app.route("/")
def heartbeat():
    return "it's alive!"


@app.route("/api/library", methods=["POST"])
def get_library():
    libraryPath = request.get_json()["library"]
    path = Path(libraryPath).as_uri()
    files = get_library_from_db(path)

    return {"files": files}


def get_library_from_db(path):
    query = db.select(Music.filepath, Music.metadata_json).where(
        Music.filepath.like(f"{path}%")
    )
    rows = list(map(Row._asdict, db.session.execute(query).all()))
    return rows


@app.route("/api/scan_library", methods=["POST"])
def scan_library():
    libraryPath = request.get_json()["library"]
    p = Path(libraryPath)
    matched = [
        f for f in p.rglob("*") if any([f.match(ext) for ext in AUDIO_EXTENSIONS])
    ]
    files = []
    for file in matched:
        metadata = TinyTag.get(file)
        data = {
            "filepath": Path.as_uri(file),
            "metadata_json": {
                "title": metadata.title,
                "artist": metadata.artist,
                "album": metadata.album,
                "year": metadata.year,
                "track": metadata.track,
                "length": metadata.duration,
                "genre": metadata.genre,
            },
        }
        files.append(data)

    query = db.insert(Music)
    db.session.execute(
        query,
        files,
    )
    db.session.commit()

    return {"scanned": len(files)}


@app.route("/api/delete_library", methods=["POST"])
def delete_library():
    libraryPath = request.get_json()["library"]
    path = Path(libraryPath).as_uri()
    query = db.delete(Music).where(Music.filepath.like(f"{path}%"))
    db.session.execute(query)
    db.session.commit()

    return {"deleted": True}
