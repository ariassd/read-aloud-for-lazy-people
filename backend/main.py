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
from service import get_audio_from_text, get_all_voices

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "dist"))
PUBLIC_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "public"))

app = Flask(__name__, template_folder=DIST_DIR, static_folder=DIST_DIR)
api_bp = Blueprint("api", __name__, url_prefix="/api")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/public/<path:path>")
def serve_static(path):
    return send_from_directory(PUBLIC_DIR, path)


@app.route("/<path:path>")
def serve_static_pu(path):

    return send_from_directory(DIST_DIR, path)


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


@api_bp.route("/voices-data", methods=["GET"])
async def get_all_voices_data():
    voices = await get_all_voices()
    formatted_data = [
        {
            "name": v["ShortName"],
            "gender": v["Gender"],
            "lang": v["Locale"],
            "label": v["FriendlyName"].replace("Microsoft", "").strip(),
        }
        for v in voices
    ]
    return jsonify(formatted_data)


app.register_blueprint(api_bp)
if __name__ == "__main__":
    is_develop = os.getenv("APP_ENV", "DEV") == "DEV"
    port = int(os.getenv("PORT", 8000))
    app.run(debug=is_develop, host="0.0.0.0", port=port)
