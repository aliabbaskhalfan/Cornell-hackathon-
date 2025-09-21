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
    
    def generate_commentary(self, game_id, event_type='generic', persona='passionate', play_description='', user_context=None):
        """Generate commentary for a specific play"""
        try:
            logger.info(f"Generating commentary for game_id={game_id}, event_type={event_type}, persona={persona}, play={play_description[:50]}...")
            
            # Get game context - try database first, then direct API as fallback
            game_summary = self.game_service.get_game_summary(game_id)
            
            if not game_summary:
                logger.warning(f"No game summary found in database for {game_id}, creating minimal context")
                # Create minimal game context for commentary generation
                game_summary = self._create_minimal_game_context(game_id)
            
            # Get persona style
            persona_config = self.personas.get(persona, self.personas['passionate'])
            
            # Create prompt
            prompt = self._create_commentary_prompt(game_summary, event_type, persona_config, play_description, user_context)
            logger.info(f"Generated prompt for Gemini: {prompt[:200]}...")
            
            # Generate with Gemini
            response = self.model.generate_content(prompt)
            commentary_text = response.text.strip()
            logger.info(f"Gemini response: {commentary_text}")
            
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
    
    def _create_commentary_prompt(self, game_summary, event_type, persona_config, play_description='', user_context=None):
        """Create prompt for Gemini"""
        game = game_summary['game']
        top_scorers = game_summary['top_scorers']
        
        prompt = f"""You are an NBA sports commentator with a {persona_config['style']} style.

Game Context:
- {game['teams']['away']['name']} vs {game['teams']['home']['name']}
- Score: {game['teams']['away']['name']} {game['score']['away']} - {game['teams']['home']['name']} {game['score']['home']}
- Clock: {game['clock']}
- Status: {game['status']}"""

        if top_scorers:
            prompt += "\n\nTop Performers:"
            for scorer in top_scorers[:2]:
                prompt += f"\n- {scorer['name']}: {scorer['points']} points"

        if user_context:
            if user_context.get('interests'):
                prompt += f"\nUser interests: {', '.join(user_context['interests'])}"
            if user_context.get('preferences'):
                prompt += f"\nUser preferences: {user_context['preferences']}"

        prompt += f"""

Raw Play-by-Play Event: "{play_description}"

Your task: Convert this raw play-by-play line into natural, exciting commentary that a {persona_config['style']} sports commentator would say.

Style Guidelines:
- Tone: {persona_config['tone']}
- Examples: {', '.join(persona_config['examples'])}
- Keep it to 1-2 sentences max
- Make it sound natural and engaging for sports fans
- Don't just repeat the raw data - interpret it with excitement and context

Commentary:"""
        
        return prompt
    
    def _create_minimal_game_context(self, game_id):
        """Create minimal game context when database lookup fails"""
        try:
            # Import here to avoid circular imports
            from services.sportsdata_service import SportsDataService
            sports_service = SportsDataService()
            
            # Get fresh data directly from sports service
            game_details = sports_service.get_game_details(game_id)
            box_score = sports_service.get_box_score(game_id)
            
            if not game_details:
                # Return bare minimum for Lakers vs Trail Blazers
                return {
                    'game': {
                        'teams': {
                            'away': {'name': 'Los Angeles Lakers'},
                            'home': {'name': 'Portland Trail Blazers'}
                        },
                        'score': {'away': 0, 'home': 0},
                        'clock': '12:00',
                        'status': 'InProgress'
                    },
                    'top_scorers': [],
                    'score_difference': 0
                }
            
            # Extract player stats if available
            top_scorers = []
            if box_score and 'Players' in box_score:
                players = sorted(box_score['Players'], key=lambda p: p.get('Points', 0), reverse=True)
                top_scorers = players[:3]
            
            return {
                'game': {
                    'teams': {
                        'away': {'name': 'Los Angeles Lakers'},
                        'home': {'name': 'Portland Trail Blazers'}
                    },
                    'score': {
                        'away': game_details.get('AwayTeamScore', 0),
                        'home': game_details.get('HomeTeamScore', 0)
                    },
                    'clock': f"{game_details.get('TimeRemainingMinutes', 12):02d}:{game_details.get('TimeRemainingSeconds', 0):02d}",
                    'status': game_details.get('Status', 'InProgress')
                },
                'top_scorers': [{'name': p.get('Name', 'Player'), 'points': p.get('Points', 0)} for p in top_scorers],
                'score_difference': abs(game_details.get('HomeTeamScore', 0) - game_details.get('AwayTeamScore', 0))
            }
        except Exception as e:
            logger.error(f"Error creating minimal game context: {e}")
            # Return absolute minimum
            return {
                'game': {
                    'teams': {
                        'away': {'name': 'Los Angeles Lakers'},
                        'home': {'name': 'Portland Trail Blazers'}
                    },
                    'score': {'away': 0, 'home': 0},
                    'clock': '12:00',
                    'status': 'InProgress'
                },
                'top_scorers': [],
                'score_difference': 0
            }
    
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
