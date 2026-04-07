import os
import base64
from google.cloud import texttospeech
from typing import Optional

class TTSService:
    def __init__(self):
        print("DEBUG: Initializing TTS Service...")
        
        # Check if GOOGLE_APPLICATION_CREDENTIALS is already set, if not, try default file
        if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
            # Check for gcp-key.json in the current working directory (server/)
            potential_key = os.path.join(os.getcwd(), "gcp-key.json")
            if os.path.exists(potential_key):
                print(f"DEBUG: Found credentials file at {potential_key}. Setting environment variable.")
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = potential_key
            else:
                print("DEBUG: GOOGLE_APPLICATION_CREDENTIALS not set and gcp-key.json not found in server/")

        try:
            self.client = texttospeech.TextToSpeechClient()
            print("DEBUG: TTS Client successfully initialized.")
        except Exception as e:
            print(f"CRITICAL ERROR: TTS Client initialization failed: {e}")
            print("HINT: Ensure 'google-cloud-texttospeech' is installed and GOOGLE_APPLICATION_CREDENTIALS is set.")
            self.client = None

    async def text_to_speech(self, text: str, language_code: str) -> Optional[str]:
        """
        Converts text to speech using Google Cloud TTS with SSML for human-like rhythm.
        """
        if not self.client:
            return None

        # Upgrade to "Studio" voices for English (the most human-sounding)
        # Neural2 for others
        voice_map = {
            "en": ("en-US", "en-US-Studio-Q"),  # High-fidelity Studio voice
            "hi": ("hi-IN", "hi-IN-Neural2-A"), 
            "ml": ("ml-IN", "ml-IN-Standard-A"), 
            "es": ("es-ES", "es-ES-Neural2-A")  
        }

        lang, voice_name = voice_map.get(language_code, ("en-US", "en-US-Studio-Q"))

        # Wrap text in SSML to add a "breath" (pause) after the acknowledgment
        # We also slightly slow down the speech for better clarity/caring tone
        # NOTE: Studio voices do not support 'pitch' attribute in prosody tags yet.
        ssml_text = (
            f"<speak>"
            f"<prosody rate='90%'>"
            f"{text.replace('.', '. <break time=\"400ms\"/>')}"
            f"</prosody>"
            f"</speak>"
        )

        synthesis_input = texttospeech.SynthesisInput(ssml=ssml_text)

        voice = texttospeech.VoiceSelectionParams(
            language_code=lang,
            name=voice_name
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        try:
            response = self.client.synthesize_speech(
                input=synthesis_input, voice=voice, audio_config=audio_config
            )
            return base64.b64encode(response.audio_content).decode('utf-8')
        except Exception as e:
            print(f"CRITICAL TTS ERROR: {str(e)}")
            # This print will show up in your terminal where the backend is running
            raise e

# Singleton instance
tts_service = TTSService()
