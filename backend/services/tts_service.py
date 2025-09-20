from google.cloud import texttospeech
from config import Config
import logging
import uuid
import os

logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        self.client = texttospeech.TextToSpeechClient()
        
        # Voice configurations for different personas
        self.voice_configs = {
            'nerdy': {
                'name': 'en-US-Neural2-D',
                'ssml_gender': texttospeech.SsmlVoiceGender.MALE,
                'speaking_rate': 0.9,
                'pitch': -2.0
            },
            'passionate': {
                'name': 'en-US-Neural2-F',
                'ssml_gender': texttospeech.SsmlVoiceGender.FEMALE,
                'speaking_rate': 1.1,
                'pitch': 2.0
            },
            'raw': {
                'name': 'en-US-Neural2-A',
                'ssml_gender': texttospeech.SsmlVoiceGender.MALE,
                'speaking_rate': 1.0,
                'pitch': 0.0
            }
        }
    
    def generate_audio(self, text, persona='passionate'):
        """Generate audio from text using Google Cloud TTS"""
        try:
            voice_config = self.voice_configs.get(persona, self.voice_configs['passionate'])
            
            # Configure synthesis input
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Configure voice
            voice = texttospeech.VoiceSelectionParams(
                language_code="en-US",
                name=voice_config['name'],
                ssml_gender=voice_config['ssml_gender']
            )
            
            # Configure audio
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=voice_config['speaking_rate'],
                pitch=voice_config['pitch']
            )
            
            # Perform synthesis
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            # Save audio file
            audio_filename = f"audio_{uuid.uuid4().hex}.mp3"
            audio_path = os.path.join('static', 'audio', audio_filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(audio_path), exist_ok=True)
            
            with open(audio_path, 'wb') as out:
                out.write(response.audio_content)
            
            # Return URL path
            return f"/static/audio/{audio_filename}"
            
        except Exception as e:
            logger.error(f"Error generating TTS audio: {e}")
            return None
