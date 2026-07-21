import re
import os
import io
import ffmpeg
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from service import get_audio_from_text, prepare_reading_ai
# from pydub import AudioSegment

load_dotenv()
TEXT_FILE = "podcast_script.txt"
AUDIO_FILE = "temp/podcast.mp3"

os.makedirs("temp", exist_ok=True)


def parse_dialog(script: str):
    pattern = re.compile(
        r"^\[(LUIS|CRISTINA)\]\s*(.+?)(?=^\[(?:LUIS|CRISTINA)\]|\Z)",
        re.MULTILINE | re.DOTALL,
    )

    dialog = []

    for match in pattern.finditer(script):
        dialog.append(
            {
                "speaker": match.group(1),
                "text": match.group(2).strip(),
            }
        )

    return dialog


async def makePodcast(language: str = "ES"):

    VOICES = {
        "LUIS": "es-PY-MarioNeural",
        "CRISTINA": "es-EC-AndreaNeural",
    }

    if language == "EN":
        VOICES = {
            "LUIS": "en-US-AndrewMultilingualNeural",
            "CRISTINA": "en-US-AriaNeural",
        }

    file_path = Path(AUDIO_FILE)
    file_path.unlink(missing_ok=True)

    with open(TEXT_FILE, "r", encoding="utf-8") as f:
        text_string = f.read()

    text_string = prepare_reading_ai(
        text_string, "es", VOICES["CRISTINA"], speakers=["[LUIS]", "[CRISTINA]"]
    )
    dialog = parse_dialog(text_string)

    # podcast = AudioSegment.empty()
    files = []
    for i, turn in enumerate(dialog):
        print(turn["speaker"])
        voice = VOICES[turn["speaker"].upper()]
        audio = await get_audio_from_text("es", voice, turn["text"])

        file_name = f"temp/pcast-part{i:03}.mp3"
        files.append(file_name)
        with open(file_name, "wb") as f:
            f.write(audio)

        # segment = AudioSegment.from_file(io.BytesIO(audio), format="mp3")
        # podcast += segment
        # podcast += AudioSegment.silent(duration=350)

    # podcast.export(AUDIO_FILE, format="mp3")
    join_audios(files)
    print(f"Podcast file: {AUDIO_FILE}")


def join_audios(files):
    try:
        inputs = [ffmpeg.input(f) for f in files]
        joined = ffmpeg.concat(*inputs, v=0, a=1)
        output = ffmpeg.output(joined, AUDIO_FILE)
        output.run()
        for archivo in files:
            if os.path.exists(archivo):
                os.remove(archivo)
    except ffmpeg.Error as e:
        print("FFmpeg failed. Source files were NOT deleted to prevent data loss.", e)


if __name__ == "__main__":
    asyncio.run(makePodcast(language="EN"))
