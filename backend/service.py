import os
import io
import time
import random
import pygame
import asyncio
import edge_tts
from langdetect import detect
from dotenv import load_dotenv
from mistralai.client import Mistral
from tts_system_prompt import SYSTEM_PROMPT

load_dotenv()
TEXT_FILE = "read_this.txt"
AUDIO_FILE = "temp/temp.mp3"

os.makedirs("temp", exist_ok=True)


async def get_random_voice_by_language(language_code):
    # 1. get all available voices
    voices = await edge_tts.voices.list_voices()

    # 2. Filter by language
    # Field 'Locale' contains for example 'es-ES-ElviraNeural'
    filtered_voices = [v for v in voices if v["Locale"].startswith(language_code)]

    if not filtered_voices:
        print(f"No voices found for language: {language_code}")
        return None

    # 3. Choose voice randomly
    random_voice = random.choice(filtered_voices)

    return random_voice["ShortName"]


async def get_audio_from_text(lang: str, voice_code: str, text_string: str) -> bytes:
    """
    Generates audio from text using edge-tts and returns it as bytes.
    """

    try:
        if lang == "auto":
            lang = detect(text_string)
        # print(f"Detected language: {lang}")
        if voice_code == "auto":
            voice_code = await get_random_voice_by_language(lang)
    except Exception as e:
        print(f"Error: {e}")
    # print(f"Generating audio into memory using '{voice_code}'")
    communicate = edge_tts.Communicate(text_string, voice_code)
    audio_buffer = io.BytesIO()

    # Stream the chunks into the memory buffer
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])

    # Return the raw bytes
    return audio_buffer.getvalue()


async def conver_text_to_voice():

    # 1. Read text file or paperclip
    # text_string = pyperclip.paste()
    # if text_string == "":
    # print("No text in clipboard, reading from file")
    with open(TEXT_FILE, "r", encoding="utf-8") as f:
        text_string = f.read()
    if text_string == "":
        with open("instructions", "r", encoding="utf-8") as f:
            text_string = f.read()

    # 2. Determine file language
    try:
        language = detect(text_string)
        print(f"Detected language: {language}")
        # VOICE = "en-IE-EmilyNeural" # OP A
        # VOICE = "en-NZ-MollyNeural" # OP B
        VOICE = await get_random_voice_by_language(language)
    except Exception as e:
        print(f"Error: {e}")

    # 3. Prepare text for reading using IA
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
    if MISTRAL_API_KEY:
        print("USING MISTRAL ENHANCED READING")
        mistral_client = Mistral(api_key=MISTRAL_API_KEY)

        conversation_history = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT.format(language=language, VOICE=VOICE),
            }
        ]

        conversation_history.append({"role": "user", "content": text_string})

        response = mistral_client.chat.complete(
            model="mistral-large-latest", messages=conversation_history
        )

        text_string = response.choices[0].message.content

        with open("./read_this_tmp.txt", "w", encoding="utf-8") as file:
            file.write(text_string)

    # 4. Generate voice file
    print(f"Generating voice file using '{VOICE}'")
    communicate = edge_tts.Communicate("- . . . . . " + text_string, VOICE)
    await communicate.save(
        AUDIO_FILE,
    )
    print("Voice file is done! playing...")

    # 5. play audio file with pygame
    pygame.mixer.init()
    pygame.mixer.music.load(AUDIO_FILE)
    pygame.mixer.music.pause()
    time.sleep(1)
    pygame.mixer.music.play()

    # Keep the program running until the audio finishes playing
    while pygame.mixer.music.get_busy():
        time.sleep(1)

    pygame.mixer.quit()

    # Delete the audio file once it was read
    # os.remove(AUDIO_FILE)


async def get_all_voices():
    # This fetches the live list directly from Microsoft
    voices = await edge_tts.list_voices()
    allowed_prefixes = [
        p.strip().lower() for p in os.getenv("ALLOWED_LANGUAGES", "en").split(",")
    ]
    filtered_voices = [
        v
        for v in voices
        if any(v["Locale"].startswith(prefix) for prefix in allowed_prefixes)
    ]
    return filtered_voices


if __name__ == "__main__":
    asyncio.run(conver_text_to_voice())
