import requests
from config import Config
import logging
import uuid
import os
import time

logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        self.api_key = Config.ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        self._voices_cache = {
            'timestamp': 0.0,
            'voices': []
        }
        
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
                'voice_id': 'gnPxliFHTp6OK6tcoA6i',  # Default commentator voice
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
    
    def list_voices(self, force_refresh: bool = False):
        """Return available ElevenLabs voices (cached)."""
        try:
            if not self.api_key:
                logger.warning("ElevenLabs API key not configured")
                return []

            now = time.time()
            # Cache for 5 minutes
            if not force_refresh and (now - self._voices_cache['timestamp'] < 300) and self._voices_cache['voices']:
                return self._voices_cache['voices']

            headers = {
                "Accept": "application/json",
                "xi-api-key": self.api_key
            }
            url = f"{self.base_url}/voices"
            resp = requests.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json() or {}
                voices = data.get('voices', [])
                simplified = []
                for v in voices:
                    simplified.append({
                        'voice_id': v.get('voice_id') or v.get('voice_id'),
                        'name': v.get('name'),
                        'category': v.get('category'),
                        'labels': v.get('labels') or {},
                        'description': v.get('description') or ''
                    })
                self._voices_cache = {'timestamp': now, 'voices': simplified}
                return simplified
            else:
                logger.error(f"Failed to fetch ElevenLabs voices: {resp.status_code} - {resp.text}")
                return []
        except Exception as e:
            logger.error(f"Error listing ElevenLabs voices: {e}")
            return []

    def generate_audio(self, text, persona: str = 'passionate', *, voice_id: str | None = None, model_id: str | None = None, language: str | None = None, voice_settings: dict | None = None):
        """Generate audio from text using ElevenLabs TTS.

        Args:
            text: input text
            persona: fallback persona mapping to default voice
            voice_id: explicit ElevenLabs voice id to use
            model_id: explicit model id; if None, auto-select based on language
            language: ISO language code (e.g., 'en', 'es'); used to pick multilingual model
            voice_settings: optional override for voice_settings
        """
        try:
            if not self.api_key:
                logger.warning("ElevenLabs API key not configured")
                return None
            
            voice_config = self.voice_configs.get(persona, self.voice_configs['passionate'])
            
            # Prefer explicit voice_id when provided
            selected_voice_id = voice_id or voice_config['voice_id']

            # ElevenLabs API endpoint
            url = f"{self.base_url}/text-to-speech/{selected_voice_id}"
            
            # Headers
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            # Choose model: if language specified and not English, use multilingual
            effective_model_id = model_id
            if not effective_model_id:
                if language and language.lower() != 'en':
                    effective_model_id = "eleven_multilingual_v2"
                else:
                    effective_model_id = "eleven_monolingual_v1"

            # Voice settings
            vs = voice_settings or {
                "stability": voice_config['stability'],
                "similarity_boost": voice_config['similarity_boost'],
                "style": voice_config['style'],
                "use_speaker_boost": voice_config['use_speaker_boost']
            }

            # Request payload
            data = {
                "text": text,
                "model_id": effective_model_id,
                "voice_settings": vs
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
