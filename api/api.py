from flask import request
from tinytag import TinyTag
from pathlib import Path
from sqlalchemy.engine import Row

from app import app, db
from models import Music
from utils import create_filetree_with_metadata

AUDIO_EXTENSIONS = [".mp3", ".ogg", ".flac", ".wav", ".m4a"]


@app.route("/")
def heartbeat():
    return "it's alive!"


@app.route("/api/library", methods=["POST"])
def get_library():
    library_path = request.get_json()["library"]
    path = Path(library_path).as_uri()
    files = get_library_from_db(path)

    return files


def get_library_from_db(path_uri: str):
    query = db.select(Music.filepath, Music.metadata_json).where(
        Music.filepath.like(f"{path_uri}%")
    )
    with db.session.begin():
        rows = list(map(Row._asdict, db.session.execute(query).all()))

    results = create_filetree_with_metadata(path_uri, rows)

    return results


@app.route("/api/scan_library", methods=["POST"])
def scan_library():
    library_path = request.get_json()["library"]
    p = Path(library_path)
    matched = [f for f in p.rglob("*") if any([f.suffix in AUDIO_EXTENSIONS])]
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
    with db.session.begin():
        db.session.execute(
            query,
            files,
        )

    return {"scanned": len(files)}


@app.route("/api/delete_library", methods=["POST"])
def delete_library():
    library_path = request.get_json()["library"]
    path_uri = Path(library_path).as_uri()
    query = db.delete(Music).where(Music.filepath.like(f"{path_uri}%"))
    with db.session.begin():
        db.session.execute(query)

    return {"deleted": True}
