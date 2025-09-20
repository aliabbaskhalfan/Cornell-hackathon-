import google.generativeai as genai
from config import Config
from database import db
from services.game_service import GameService
from services.tts_service import TTSService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class CommentaryService:
    def __init__(self):
        self.db = db
        self.game_service = GameService()
        self.tts_service = TTSService()
        
        # Configure Gemini
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Commentary personas
        self.personas = {
            'nerdy': {
                'style': 'analytical and data-driven',
                'tone': 'professional and statistical',
                'examples': ['According to the advanced metrics', 'The efficiency rating suggests', 'Statistically speaking']
            },
            'passionate': {
                'style': 'energetic and enthusiastic',
                'tone': 'exciting and dramatic',
                'examples': ['What a play!', 'Incredible!', 'That was absolutely amazing!']
            },
            'raw': {
                'style': 'straightforward and factual',
                'tone': 'neutral and informative',
                'examples': ['Player makes the shot', 'Team takes the lead', 'Timeout called']
            }
        }
    
    def generate_commentary(self, game_id, event_type='generic', persona='passionate'):
        """Generate commentary for a game event"""
        try:
            # Get game context
            game_summary = self.game_service.get_game_summary(game_id)
            if not game_summary:
                return self._get_fallback_commentary(persona)
            
            # Get persona style
            persona_config = self.personas.get(persona, self.personas['passionate'])
            
            # Create prompt
            prompt = self._create_commentary_prompt(game_summary, event_type, persona_config)
            
            # Generate with Gemini
            response = self.model.generate_content(prompt)
            commentary_text = response.text.strip()
            
            # Ensure length limit
            if len(commentary_text) > Config.MAX_COMMENTARY_LENGTH:
                commentary_text = commentary_text[:Config.MAX_COMMENTARY_LENGTH] + "..."
            
            # Generate audio
            audio_url = self.tts_service.generate_audio(commentary_text, persona)
            
            # Store commentary
            commentary_doc = {
                'game_id': game_id,
                'timestamp': datetime.now(),
                'text': commentary_text,
                'persona': persona,
                'confidence': 0.8,  # Mock confidence
                'audio_url': audio_url,
                'event_type': event_type
            }
            
            self.db.commentary.insert_one(commentary_doc)
            
            return {
                'text': commentary_text,
                'audio_url': audio_url,
                'persona': persona,
                'timestamp': commentary_doc['timestamp']
            }
            
        except Exception as e:
            logger.error(f"Error generating commentary: {e}")
            return self._get_fallback_commentary(persona)
    
    def _create_commentary_prompt(self, game_summary, event_type, persona_config):
        """Create prompt for Gemini"""
        game = game_summary['game']
        top_scorers = game_summary['top_scorers']
        
        prompt = f"""
        Generate a {persona_config['style']} sports commentary line for an NBA game.
        
        Game Context:
        - {game['teams']['away']['name']} vs {game['teams']['home']['name']}
        - Score: {game['teams']['away']['name']} {game['score']['away']} - {game['teams']['home']['name']} {game['score']['home']}
        - Clock: {game['clock']}
        - Status: {game['status']}
        
        Top Scorers:
        """
        
        for scorer in top_scorers[:2]:
            prompt += f"- {scorer['name']}: {scorer['points']} points\n"
        
        prompt += f"""
        
        Event Type: {event_type}
        Style: {persona_config['style']}
        Tone: {persona_config['tone']}
        
        Generate a single, engaging commentary line (max 150 characters) that captures the current moment.
        Use the {persona_config['style']} style and {persona_config['tone']} tone.
        Make it sound natural and exciting for sports fans.
        
        Examples of this style: {', '.join(persona_config['examples'])}
        
        Commentary:
        """
        
        return prompt
    
    def _get_fallback_commentary(self, persona):
        """Return fallback commentary if generation fails"""
        fallbacks = {
            'nerdy': "The statistical analysis shows interesting trends in this matchup.",
            'passionate': "What an incredible game we're witnessing!",
            'raw': "The game continues with competitive play."
        }
        
        return {
            'text': fallbacks.get(persona, fallbacks['passionate']),
            'audio_url': None,
            'persona': persona,
            'timestamp': datetime.now()
        }
    
    def get_commentary_history(self, game_id, limit=20):
        """Get commentary history for a game"""
        try:
            commentary = list(self.db.commentary.find(
                {'game_id': game_id}
            ).sort('timestamp', -1).limit(limit))
            
            return commentary
            
        except Exception as e:
            logger.error(f"Error fetching commentary history: {e}")
            return []
