import re
import logging
from services.game_service import GameService
from services.commentary_service import CommentaryService
from services.tts_service import TTSService

logger = logging.getLogger(__name__)

class VoiceService:
    def __init__(self):
        self.game_service = GameService()
        self.commentary_service = CommentaryService()
        self.tts_service = TTSService()
        
        # Intent patterns
        self.intent_patterns = {
            'triple_double': [
                r'how (close|far) is (.+) from (a )?triple.?double',
                r'(.+) triple.?double (progress|status)',
                r'is (.+) close to (a )?triple.?double'
            ],
            'score': [
                r'what\'?s the score',
                r'current score',
                r'who\'?s winning'
            ],
            'player_stats': [
                r'how many (points|rebounds|assists) does (.+) have',
                r'(.+) (points|rebounds|assists)',
                r'what are (.+) stats'
            ],
            'game_status': [
                r'what\'?s happening in the game',
                r'game status',
                r'what\'?s going on'
            ]
        }
    
    def process_query(self, transcript, game_id=None, persona='passionate'):
        """Process voice query and return response"""
        try:
            # Parse intent
            intent, entities = self._parse_intent(transcript)
            
            if not intent:
                return self._get_fallback_response(persona)
            
            # Generate response based on intent
            if intent == 'triple_double':
                response_text = self._handle_triple_double_query(entities, game_id)
            elif intent == 'score':
                response_text = self._handle_score_query(game_id)
            elif intent == 'player_stats':
                response_text = self._handle_player_stats_query(entities, game_id)
            elif intent == 'game_status':
                response_text = self._handle_game_status_query(game_id)
            else:
                response_text = self._get_fallback_response(persona)
            
            # Generate audio
            audio_url = self.tts_service.generate_audio(response_text, persona)
            
            return {
                'text': response_text,
                'audio_url': audio_url,
                'intent': intent,
                'entities': entities
            }
            
        except Exception as e:
            logger.error(f"Error processing voice query: {e}")
            return self._get_fallback_response(persona)
    
    def _parse_intent(self, transcript):
        """Parse intent and entities from transcript"""
        transcript_lower = transcript.lower()
        
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, transcript_lower)
                if match:
                    entities = match.groups()
                    return intent, entities
        
        return None, None
    
    def _handle_triple_double_query(self, entities, game_id):
        """Handle triple-double queries"""
        if not game_id or len(entities) < 2:
            return "I need to know which game and player you're asking about."
        
        player_name = entities[1].strip()
        
        # For demo, use mock player ID
        player_id = self._get_player_id_by_name(player_name)
        if not player_id:
            return f"I couldn't find information about {player_name}."
        
        progress = self.game_service.get_triple_double_progress(game_id, player_id)
        
        if progress['is_triple_double']:
            return f"{progress['player_name']} has already achieved a triple-double!"
        
        needs = progress['needs']
        needs_list = []
        if needs['points'] > 0:
            needs_list.append(f"{needs['points']} points")
        if needs['rebounds'] > 0:
            needs_list.append(f"{needs['rebounds']} rebounds")
        if needs['assists'] > 0:
            needs_list.append(f"{needs['assists']} assists")
        
        if needs_list:
            return f"{progress['player_name']} needs {', '.join(needs_list)} for a triple-double."
        else:
            return f"{progress['player_name']} has already achieved a triple-double!"
    
    def _handle_score_query(self, game_id):
        """Handle score queries"""
        if not game_id:
            return "I need to know which game you're asking about."
        
        game_summary = self.game_service.get_game_summary(game_id)
        if not game_summary:
            return "I couldn't find the current game information."
        
        game = game_summary['game']
        return f"The score is {game['teams']['away']['name']} {game['score']['away']}, {game['teams']['home']['name']} {game['score']['home']}."
    
    def _handle_player_stats_query(self, entities, game_id):
        """Handle player stats queries"""
        if not game_id or len(entities) < 2:
            return "I need to know which player and stat you're asking about."
        
        stat_type = entities[0].strip()
        player_name = entities[1].strip()
        
        player_id = self._get_player_id_by_name(player_name)
        if not player_id:
            return f"I couldn't find information about {player_name}."
        
        statline = self.game_service.db.statlines.find_one({
            'game_id': game_id,
            'player_id': player_id
        })
        
        if not statline:
            return f"I couldn't find stats for {player_name} in this game."
        
        stat_value = statline.get(stat_type.lower(), 0)
        return f"{player_name} has {stat_value} {stat_type}."
    
    def _handle_game_status_query(self, game_id):
        """Handle game status queries"""
        if not game_id:
            return "I need to know which game you're asking about."
        
        game_summary = self.game_service.get_game_summary(game_id)
        if not game_summary:
            return "I couldn't find the current game information."
        
        game = game_summary['game']
        return f"The game is {game['status']} with {game['clock']} remaining. {game['teams']['away']['name']} {game['score']['away']}, {game['teams']['home']['name']} {game['score']['home']}."
    
    def _get_player_id_by_name(self, player_name):
        """Get player ID by name (mock implementation)"""
        # Mock player mapping for demo
        player_map = {
            'lebron': 1,
            'lebron james': 1,
            'tatum': 2,
            'jayson tatum': 2,
            'curry': 3,
            'stephen curry': 3,
            'jokic': 4,
            'nikola jokic': 4
        }
        
        return player_map.get(player_name.lower())
    
    def _get_fallback_response(self, persona):
        """Get fallback response when intent can't be parsed"""
        fallbacks = {
            'nerdy': "I didn't quite understand that query. Could you rephrase it?",
            'passionate': "Sorry, I didn't catch that! Try asking about scores or player stats!",
            'raw': "Query not understood. Please try again."
        }
        
        return fallbacks.get(persona, fallbacks['passionate'])
