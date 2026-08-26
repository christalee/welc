from flask import Flask, request
from pathlib import Path

app = Flask(__name__)

AUDIO_EXTENSIONS = ["*.mp3", "*.ogg", "*.flac", "*.wav", "*.m4a"]


@app.route("/api/library", methods=["POST"])
def get_library():
  libraryPath = request.get_json()["library"]
  p = Path(libraryPath)
  matched = [
      f for f in p.rglob("*") if any([f.match(ext) for ext in AUDIO_EXTENSIONS])
  ]
  files = list(map(Path.as_uri, matched))
  return {"files": files}
