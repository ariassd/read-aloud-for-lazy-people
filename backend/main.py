import os
import asyncio
from dotenv import load_dotenv
from flask import (
    Flask,
    request,
    jsonify,
    render_template,
    send_from_directory,
    Blueprint,
    Response,
)
from service import get_audio_from_text, get_random_voice_by_language

load_dotenv()

app = Flask(__name__, template_folder="web")
api_bp = Blueprint("api", __name__, url_prefix="/api")
EXPOSED_DIR = os.path.abspath("./web")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/src/<path:filename>")
def src_files(filename):
    return send_from_directory(os.path.join("web", "src"), filename)


@app.route("/public/<path:filename>")
def public_files(filename):
    return send_from_directory(os.path.join("web", "public"), filename)


@api_bp.route("/audio", methods=["POST"])
def generate_audio():
    data = request.get_json()
    lang = data.get("lang", "").strip()
    voice = data.get("voice", "").strip()
    text = data.get("text", "").strip()

    if not voice or not text:
        return jsonify({"error": "Voice and text are required"}), 400

    try:
        # Run the async function synchronously within the Flask route
        audio_bytes = asyncio.run(get_audio_from_text(lang, voice, text))

        # Return the raw bytes as an audio file response
        return Response(
            audio_bytes,
            mimetype="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"},
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


app.register_blueprint(api_bp)
if __name__ == "__main__":
    is_develop = os.getenv("APP_ENV", "DEV") == "DEV"
    port = int(os.getenv("PORT", 8000))
    app.run(debug=is_develop, host="0.0.0.0", port=port)
