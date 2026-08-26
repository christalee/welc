from flask import Flask, request

app = Flask(__name__)


@app.route('/api/library', methods=["POST"])
def get_library():
  return {'library': request.get_json()['library']}
