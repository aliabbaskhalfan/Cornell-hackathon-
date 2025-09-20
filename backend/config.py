import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/sports_commentator')
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # SportsDataIO API
    SPORTSDATA_API_KEY = os.getenv('SPORTSDATA_API_KEY')
    SPORTSDATA_BASE_URL = 'https://api.sportsdata.io/v3/nba'
    
    # Google AI
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    # ElevenLabs TTS
    ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
    
    # Polling intervals
    SCOREBOARD_POLL_INTERVAL = 5  # seconds
    GAME_UPDATE_INTERVAL = 3  # seconds
    
    # Commentary settings
    COMMENTARY_CONFIDENCE_THRESHOLD = 0.7
    MAX_COMMENTARY_LENGTH = 150  # characters
