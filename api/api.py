from flask import request, abort, send_from_directory
from tinytag import TinyTag, tinytag
from sqlalchemy.engine import Row
from psycopg.errors import UniqueViolation
from sqlalchemy.exc import IntegrityError

from pathlib import Path
import os

from app import app, db
from models import Music
from utils import create_filetree_with_metadata

# keep this in sync with the list in utils.ts
AUDIO_EXTENSIONS = [".mp3", ".ogg", ".flac", ".wav", ".m4a"]
MUSIC_DIR_ENV = "VITE_MUSIC_DIR"


def get_allowed_path():
    allowed_dir = os.environ.get(MUSIC_DIR_ENV)
    if not allowed_dir:
        abort(500, description=f"{MUSIC_DIR_ENV} not configured in environment")
    try:
        return Path(allowed_dir).expanduser().resolve(strict=True)

    # expanduser throws a RuntimeError if it can't find a home dir
    # resolve throws an OSError when strict and path does not exist
    except OSError, RuntimeError:
        abort(404, description=f"Can't resolve root dir {allowed_dir}")


@app.route("/")
def heartbeat():
    return "it's alive!"


@app.route("/api/library", methods=["POST"])
def get_library():
    library_path = request.get_json()["library"]
    try:
        allowed_path = get_allowed_path()
        path = Path(library_path).expanduser().resolve(strict=True)
        if not path.is_relative_to(allowed_path):
            abort(404, description=f"{library_path} is not relative to {allowed_path}")

        return get_library_from_db(library_path)

    # expanduser throws a RuntimeError if it can't find a home dir
    # resolve throws an OSError when strict and path does not exist
    except OSError, RuntimeError:
        abort(400, description=f"Read failed; invalid library path {library_path}")

    except Exception as e:
        abort(404, description=e)


def get_library_from_db(library_str: str):
    query = db.select(Music.filepath, Music.metadata_json).where(
        Music.filepath.like(f"%{library_str}%")
    )
    with db.session.begin():
        rows = list(map(Row._asdict, db.session.execute(query).all()))

    try:
        library_uri = Path(library_str).expanduser().resolve(strict=True).as_uri()
        results = create_filetree_with_metadata(library_uri, rows)

        return results

    # expanduser throws a RuntimeError if it can't find a home dir
    # resolve throws an OSError when strict and path does not exist
    except OSError, RuntimeError:
        abort(400, description=f"Read failed; invalid library path {library_str}")


@app.route("/api/scan_library", methods=["POST"])
def scan_library():
    library_path = request.get_json()["library"]
    try:
        p = Path(library_path).expanduser().resolve(strict=True)
        allowed_path = get_allowed_path()
        if not p.is_relative_to(allowed_path):
            abort(
                404,
                description=f"Scan failed; {p} not relative to {MUSIC_DIR_ENV}",
            )
        matched = [f for f in p.rglob("*") if any([f.suffix in AUDIO_EXTENSIONS])]
        files = []
        for file in matched:
            try:
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
            except tinytag.ParseError as e:
                app.logger.error(f"{file} has metadata that could not be parsed: {e}")
                continue

        query = db.insert(Music)
        if len(files) > 0:
            with db.session.begin():
                try:
                    db.session.execute(
                        query,
                        files,
                    )
                except UniqueViolation, IntegrityError:
                    abort(422, description=f"Scan failed; records already exist in {library_path}")

        return {"scanned": len(files)}

    # expanduser throws a RuntimeError if it can't find a home dir
    # resolve throws an OSError when strict and path does not exist
    except OSError, RuntimeError:
        abort(400, description=f"Scan failed; invalid library path {library_path}")


@app.route("/api/delete_library", methods=["POST"])
def delete_library():
    library_path = request.get_json()["library"]
    try:
        path_uri = Path(library_path).expanduser().resolve(strict=True).as_uri()
        query = db.delete(Music).where(Music.filepath.like(f"{path_uri}%"))
        with db.session.begin():
            db.session.execute(query)

        return {"deleted": True}

    # expanduser throws a RuntimeError if it can't find a home dir
    # resolve throws an OSError when strict and path does not exist
    except OSError, RuntimeError:
        abort(400, description=f"Delete failed; invalid library path {library_path}")


@app.route("/api/file", methods=["POST"])
def get_file():
    file_uri = request.get_json()["file"]
    file_path = Path.from_uri(file_uri)
    allowed_path = get_allowed_path()
    if file_path.is_relative_to(allowed_path):
        relative_file = file_path.relative_to(allowed_path)

        return send_from_directory(allowed_path, relative_file)
    else:
        abort(404, description=f"{file_uri} not found in {allowed_path}")
