from flask import request
from tinytag import TinyTag
from pathlib import Path
from sqlalchemy.engine import Row

from app import app, db
from models import Music

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


def create_filetree(path: Path, rows):
    # needs to have structure:
    # {"name": 'libraryPath', "filepath": 'libraryPath', "children": [
    #   {"name": 'directory1', "filepath": 'libraryPath' / 'directory1', "children": [
    #       {"name": 'file1', "filepath": 'libraryPath' / 'directory1' / 'file1', "children": []},
    #       {"name": 'file2', "filepath": 'libraryPath' / 'directory1' / 'file2', "children": []}
    #   ]},
    #   {"name": 'directory2', "filepath": 'libraryPath' / 'directory2', "children": [
    #       {"name": 'file1', "filepath": 'libraryPath' / 'directory2' / 'file1', "children": []},
    #       {"name": 'file2', "filepath": 'libraryPath' / 'directory2' / 'file2', "children": []}
    #   ]},
    # ]}

    filepath = Path.as_uri(path)
    matches = list(filter(lambda x: x["filepath"] == filepath, rows))
    if len(matches) > 0:
        metadata = matches[0]["metadata_json"]
    else:
        metadata = {}
    results = {
        "name": path.name,
        "filepath": filepath,
        "metadata": metadata,
        "children": [],
    }
    if path.is_dir():
        results["children"].extend(
            [
                create_filetree(path / d, rows)
                for d in path.iterdir()
                if d.is_dir() or any([d.suffix in AUDIO_EXTENSIONS])
            ]
        )

    return results


def get_library_from_db(path):
    query = db.select(Music.filepath, Music.metadata_json).where(
        Music.filepath.like(f"{path}%")
    )
    rows = list(map(Row._asdict, db.session.execute(query).all()))
    results = create_filetree(Path.from_uri(path), rows)

    return results


@app.route("/api/scan_library", methods=["POST"])
def scan_library():
    library_path = request.get_json()["library"]
    p = Path(library_path)
    matched = [
        f for f in p.rglob("*") if any([f.suffix in AUDIO_EXTENSIONS])
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
    library_path = request.get_json()["library"]
    path = Path(library_path).as_uri()
    query = db.delete(Music).where(Music.filepath.like(f"{path}%"))
    db.session.execute(query)
    db.session.commit()

    return {"deleted": True}
