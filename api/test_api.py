import os
from api import get_allowed_path, MUSIC_DIR_ENV
from werkzeug.exceptions import (
    NotFound,
    InternalServerError,
    BadRequest,
    UnprocessableEntity,
)
from pathlib import Path
import pytest
from sqlalchemy import text

from app import db, app

mockDirFiles = [
    {
        "filepath": f"file://{os.environ.get(MUSIC_DIR_ENV)}/mockDir/audio5.mp3",
        "metadata_json": {
            "album": None,
            "artist": "Lorem Ipsum",
            "genre": None,
            "length": 141.94938775510204,
            "title": "Track 5",
            "track": 5,
            "year": "2009",
        },
    },
    {
        "filepath": f"file://{os.environ.get(MUSIC_DIR_ENV)}/mockDir/audio4.mp3",
        "metadata_json": {
            "album": None,
            "artist": "Lorem Ipsum",
            "genre": None,
            "length": 151.79755102040815,
            "title": "Track 4",
            "track": 4,
            "year": "2009",
        },
    },
    {
        "filepath": f"file://{os.environ.get(MUSIC_DIR_ENV)}/mockDir/audio6.mp3",
        "metadata_json": {
            "album": None,
            "artist": "Lorem Ipsum",
            "genre": None,
            "length": 184.79020408163265,
            "title": "Track 6",
            "track": 6,
            "year": "2009",
        },
    },
]


@pytest.fixture()
def truncate_music():
    with app.app_context():
        with db.session.begin():
            db.session.execute(text("TRUNCATE music RESTART IDENTITY CASCADE;"))
    yield


# get_allowed_path()
# you get a 404 when you pass a non-existent allowed_dir
def test_missing_allowed_dir(monkeypatch):
    allowed_dir = f"{os.environ.get(MUSIC_DIR_ENV)}/missing"
    monkeypatch.setenv(MUSIC_DIR_ENV, allowed_dir)
    try:
        get_allowed_path()
    except NotFound as e:
        result = e.get_response()
        assert result.status_code == 404
        assert f"Can&#39;t resolve root dir {allowed_dir}".encode() in result.data


# you get a 500 when you don't define VITE_MUSIC_DIR
def test_missing_env_var(monkeypatch):
    monkeypatch.delenv(MUSIC_DIR_ENV)
    try:
        get_allowed_path()
    except InternalServerError as e:
        result = e.get_response()
        assert result.status_code == 500
        assert f"{MUSIC_DIR_ENV} not configured in environment".encode() in result.data


# you get the correct allowed_dir when you give an existing dir
def test_existing_allowed_dir():
    result = get_allowed_path()
    assert result.as_uri() == f"file://{os.environ.get(MUSIC_DIR_ENV)}"


# you get the correct allowed_dir when you include a ~ or a . or a ..
def test_existing_tilde(monkeypatch):
    allowed_dir = "~/Documents"
    monkeypatch.setenv(MUSIC_DIR_ENV, allowed_dir)
    result = get_allowed_path()
    assert result.as_uri() == f"file://{Path("~").expanduser()}/Documents"


def test_existing_dot(monkeypatch):
    allowed_dir = "."
    monkeypatch.setenv(MUSIC_DIR_ENV, allowed_dir)
    result = get_allowed_path()
    assert (
        result.as_uri()
        == f"file://{Path("~/Documents/software/projects/welc").expanduser()}"
    )


def test_existing_two_dots(monkeypatch):
    allowed_dir = ".."
    monkeypatch.setenv(MUSIC_DIR_ENV, allowed_dir)
    result = get_allowed_path()
    assert (
        result.as_uri()
        == f"file://{Path("~/Documents/software/projects").expanduser()}"
    )


# POST /api/library
# you get a 400 when you post a non-existent path
def test_get_library_missing(client):
    try:
        client.post(
            "/api/library", json={"library": f"{os.environ.get(MUSIC_DIR_ENV)}/missing"}
        )
    except BadRequest as e:
        result = e.get_response()
        assert result.status_code == 400
        assert b"Read failed;" in result.data


# you get a 404 when you post a non-relative path
def test_get_library_non_relative(client):
    library_path = "~/Documents"
    try:
        client.post("/api/library", json={"library": library_path})
    except BadRequest as e:
        result = e.get_response()
        assert result.status_code == 404
        assert f"{library_path} is not relative".encode() in result.data


# you get an empty list when you post an existent path and data has not been populated
def test_get_library_exists_no_data(client, truncate_music):
    library_path = f"{os.environ.get(MUSIC_DIR_ENV)}/mockDir"
    result = client.post("/api/library", json={"library": library_path})
    assert result.json == []


# you get a tree of data when you post an existent path and data has been populated
def test_get_library_exists_with_data(client, truncate_music):
    library_path = f"{os.environ.get(MUSIC_DIR_ENV)}/mockDir"
    client.post("/api/scan_library", json={"library": library_path})

    result = client.post("/api/library", json={"library": library_path})
    assert result.json == mockDirFiles


# POST /api/scan_library
# you get a 400 when you post a non-existent path
def test_scan_library_missing(client):
    try:
        client.post(
            "/api/scan_library",
            data={"library": f"{os.environ.get(MUSIC_DIR_ENV)}/missing"},
        )
    except BadRequest as e:
        result = e.get_response()
        assert result.status_code == 400
        assert b"Scan failed; invalid library path" in result.data


# you get a 404 when you post a non-relative path
def test_scan_library_non_relative(client):
    library_path = "~/Documents"
    try:
        client.post("/api/scan_library", data={"library": library_path})
    except BadRequest as e:
        result = e.get_response()
        assert result.status_code == 404
        assert f"{library_path} is not relative".encode() in result.data


# records exist after posting a path that contains files
def test_scan_library_files(client, truncate_music):
    library_path = f"{os.environ.get(MUSIC_DIR_ENV)}/mockDir"
    scanned = client.post("/api/scan_library", json={"library": library_path})

    assert scanned.json == {"scanned": 3}

    records = client.post("/api/library", json={"library": library_path})

    assert records.json == mockDirFiles


# no records exist after posting a path that contains no files
def test_scan_library_no_files(client, truncate_music):
    library_path = f"{os.environ.get(MUSIC_DIR_ENV)}/emptyDir"
    scanned = client.post("/api/scan_library", json={"library": library_path})

    assert scanned.json == {"scanned": 0}

    records = client.post("/api/library", json={"library": library_path})

    assert records.json == []


# what happens when you scan again without deleting files first?
def test_scan_library_repeated(client, truncate_music):
    library_path = f"{os.environ.get(MUSIC_DIR_ENV)}/mockDir"
    scanned = client.post("/api/scan_library", json={"library": library_path})

    assert scanned.json == {"scanned": 3}

    try:
        client.post("/api/scan_library", json={"library": library_path})
    except UnprocessableEntity as e:
        result = e.get_response()
        print(result)
        assert result.status_code == 422
        assert b"Scan failed; records already exist" in result.data


# POST /api/delete_library
# you get a 400 when you post a non-existent path
def test_delete_library_missing(client):
    try:
        client.post(
            "/api/delete_library",
            data={"library": f"{os.environ.get(MUSIC_DIR_ENV)}/missing"},
        )
    except BadRequest as e:
        result = e.get_response()
        assert result.status_code == 400
        assert b"Delete failed; invalid library path" in result.data


# when records exist, they can be deleted by path
def test_delete_library_files(client, truncate_music):
    library_path = f"{os.environ.get(MUSIC_DIR_ENV)}/mockDir"
    scanned = client.post("/api/scan_library", json={"library": library_path})

    assert scanned.json == {"scanned": 3}

    result1 = client.post("/api/library", json={"library": library_path})
    assert result1.json == mockDirFiles

    deleted = client.post("/api/delete_library", json={"library": library_path})

    assert deleted.json == {"deleted": True}

    result2 = client.post("/api/library", json={"library": library_path})
    assert result2.json == []


# throws no errors when no records exist to be deleted
def test_delete_library_no_files(client, truncate_music):
    library_path = f"{os.environ.get(MUSIC_DIR_ENV)}/mockDir"
    deleted = client.post("/api/delete_library", json={"library": library_path})

    assert deleted.json == {"deleted": True}


# POST /api/file
# you get a 404 when the file doesn't exist
def test_get_file_missing(client):
    file = client.post(
        "/api/file",
        json={"file": f"file://{os.environ.get(MUSIC_DIR_ENV)}/mockDir/missing.mp3"},
    )

    assert file.status_code == 404
    assert b"The requested URL was not found" in file.data


# you get a 404 when you post a non-relative URI
def test_get_file_non_relative(client):
    file_path = Path("~/Documents/test.mp3").expanduser().resolve().as_uri()
    file = client.post("/api/file", json={"file": file_path})

    assert file.status_code == 404
    assert f"{file_path} not found".encode() in file.data


# when the file exists in MUSIC_DIR_ENV, it is sent
def test_get_file(client):
    file = client.post(
        "/api/file",
        json={"file": f"file://{os.environ.get(MUSIC_DIR_ENV)}/mockDir/audio4.mp3"},
    )

    assert file.data
