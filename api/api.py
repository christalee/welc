from flask import request, abort, send_from_directory
from tinytag import TinyTag
from sqlalchemy.engine import Row

from pathlib import Path
import os

from app import app, db
from models import Music
from utils import create_filetree_with_metadata

AUDIO_EXTENSIONS = [".mp3", ".ogg", ".flac", ".wav", ".m4a"]
MUSIC_DIR_ENV = "VITE_MUSIC_DIR"


@app.route("/")
def heartbeat():
    return "it's alive!"


@app.route("/api/library", methods=["POST"])
def get_library():
    library_path = request.get_json()["library"]
    try:
        path = Path(library_path).as_uri()
        files = get_library_from_db(path)

        return files
    except Exception as e:
        abort(404, description=e)


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


@app.route("/api/file", methods=["POST"])
def get_file():
    file_uri = request.get_json()["file"]
    file_path = Path.from_uri(file_uri)
    allowed_dir = os.environ.get(MUSIC_DIR_ENV)
    if not allowed_dir:
        abort(500, description=f"{MUSIC_DIR_ENV} not configured in environment")
    allowed_dir = Path(allowed_dir)
    if file_path.is_relative_to(allowed_dir):
        relative_file = file_path.relative_to(allowed_dir)
        return send_from_directory(allowed_dir, relative_file)
    else:
        abort(404, description=f"File not found in {MUSIC_DIR_ENV}")
