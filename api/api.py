from flask import request
from pathlib import Path
from app import app, db
from models import Music


AUDIO_EXTENSIONS = ["*.mp3", "*.ogg", "*.flac", "*.wav", "*.m4a"]


@app.route("/api/library", methods=["POST"])
def get_library():
    libraryPath = request.get_json()["library"]
    path = Path(libraryPath).as_uri()
    files = get_library_from_db(path)

    return {"files": files}


def get_library_from_db(path):
    query = db.select(Music.filepath).where(Music.filepath.like(f"{path}%"))
    rows = db.session.execute(query).scalars().all()
    return rows


@app.route("/api/scan_library", methods=["POST"])
def scan_library():
    libraryPath = request.get_json()["library"]
    p = Path(libraryPath)
    matched = [
        f for f in p.rglob("*") if any([f.match(ext) for ext in AUDIO_EXTENSIONS])
    ]
    files = list(map(Path.as_uri, matched))

    query = db.insert(Music)
    db.session.execute(query, [
        {'filepath': f} for f in files
    ],)
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
