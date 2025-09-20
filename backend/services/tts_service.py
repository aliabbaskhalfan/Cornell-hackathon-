import requests
from config import Config
import logging
import uuid
import os

logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        self.api_key = Config.ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        
        # ElevenLabs voice configurations for different personas
        self.voice_configs = {
            'nerdy': {
                'voice_id': 'pNInz6obpgDQGcFmaJgB',  # Adam - analytical male voice
                'stability': 0.75,
                'similarity_boost': 0.75,
                'style': 0.0,
                'use_speaker_boost': True
            },
            'passionate': {
                'voice_id': 'EXAVITQu4vr4xnSDxMaL',  # Bella - energetic female voice
                'stability': 0.5,
                'similarity_boost': 0.75,
                'style': 0.0,
                'use_speaker_boost': True
            },
            'funny': {
                'voice_id': 'VR6AewLTigWG4xSOukaG',  # Josh - expressive male voice
                'stability': 0.4,
                'similarity_boost': 0.8,
                'style': 0.2,
                'use_speaker_boost': True
            },
            'raw': {
                'voice_id': 'AZnzlk1XvdvUeBnXmlld',  # Domi - clear female voice
                'stability': 0.8,
                'similarity_boost': 0.6,
                'style': 0.0,
                'use_speaker_boost': False
            }
        }
    
    def generate_audio(self, text, persona='passionate'):
        """Generate audio from text using ElevenLabs TTS"""
        try:
            if not self.api_key:
                logger.warning("ElevenLabs API key not configured")
                return None
            
            voice_config = self.voice_configs.get(persona, self.voice_configs['passionate'])
            
            # ElevenLabs API endpoint
            url = f"{self.base_url}/text-to-speech/{voice_config['voice_id']}"
            
            # Headers
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            # Request payload
            data = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": voice_config['stability'],
                    "similarity_boost": voice_config['similarity_boost'],
                    "style": voice_config['style'],
                    "use_speaker_boost": voice_config['use_speaker_boost']
                }
            }
            
            # Make API request
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 200:
                # Save audio file
                audio_filename = f"audio_{uuid.uuid4().hex}.mp3"
                audio_path = os.path.join('static', 'audio', audio_filename)
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(audio_path), exist_ok=True)
                
                with open(audio_path, 'wb') as out:
                    out.write(response.content)
                
                # Return URL path
                return f"/static/audio/{audio_filename}"
            else:
                logger.error(f"ElevenLabs API error: {response.status_code} - {response.text}")
                return None
            
        except Exception as e:
            logger.error(f"Error generating ElevenLabs TTS audio: {e}")
            return None
