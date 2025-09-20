import re
import logging
import google.generativeai as genai
from services.game_service import GameService
from services.commentary_service import CommentaryService
from services.tts_service import TTSService
from config import Config

logger = logging.getLogger(__name__)

class VoiceService:
    def __init__(self):
        self.game_service = GameService()
        self.commentary_service = CommentaryService()
        self.tts_service = TTSService()
        
        # Initialize Gemini AI
        if Config.GEMINI_API_KEY:
            genai.configure(api_key=Config.GEMINI_API_KEY)
            # Use Gemini 1.5 Flash - stable and reliable
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None
            logger.warning("Gemini API key not configured")
        
        # User personas and their characteristics
        self.personas = {
            'nerdy': {
                'description': 'Analytical and data-driven commentator who loves statistics and technical details',
                'voice_config': 'nerdy',
                'style': 'technical'
            },
            'funny': {
                'description': 'Humorous and entertaining commentator with witty observations and jokes',
                'voice_config': 'passionate',
                'style': 'humorous'
            },
            'passionate': {
                'description': 'Energetic and enthusiastic commentator who gets excited about the action',
                'voice_config': 'passionate',
                'style': 'energetic'
            },
            'raw': {
                'description': 'Straightforward and factual commentator without embellishment',
                'voice_config': 'raw',
                'style': 'factual'
            }
        }
        
        # Intent patterns for basic queries
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
    
    def process_query(self, transcript, game_id=None, persona='passionate', user_context=None):
        """Process voice query and return response with Gemini AI integration"""
        try:
            # Get persona configuration
            persona_config = self.personas.get(persona, self.personas['passionate'])
            
            # Try Gemini AI first for enhanced responses
            if self.model:
                response_text = self._generate_gemini_response(
                    transcript, game_id, persona_config, user_context
                )
            else:
                # Fallback to rule-based responses
                response_text = self._generate_rule_based_response(transcript, game_id, persona)
            
            # Generate audio with persona-specific voice
            voice_config = persona_config['voice_config']
            audio_url = self.tts_service.generate_audio(response_text, voice_config)
            
            return {
                'text': response_text,
                'audio_url': audio_url,
                'persona': persona,
                'persona_description': persona_config['description'],
                'user_context': user_context
            }
            
        except Exception as e:
            logger.error(f"Error processing voice query: {e}")
            return self._get_fallback_response(persona)
    
    def _generate_gemini_response(self, transcript, game_id, persona_config, user_context):
        """Generate response using Gemini AI with persona and context"""
        try:
            # Build context for Gemini
            context_parts = []
            
            # Add persona context
            context_parts.append(f"You are a {persona_config['description']}.")
            context_parts.append(f"Your communication style should be {persona_config['style']}.")
            context_parts.append("Keep your response concise and engaging (2-3 sentences max).")
            
            # Add user context if provided
            if user_context:
                if user_context.get('interests'):
                    context_parts.append(f"User interests: {', '.join(user_context['interests'])}")
                if user_context.get('fantasy_info'):
                    context_parts.append(f"User fantasy context: {user_context['fantasy_info']}")
                if user_context.get('preferences'):
                    context_parts.append(f"User preferences: {user_context['preferences']}")
            
            # Add game context if available
            if game_id:
                game_summary = self.game_service.get_game_summary(game_id)
                if game_summary:
                    game = game_summary['game']
                    context_parts.append(f"Current game: {game['teams']['away']['name']} vs {game['teams']['home']['name']}")
                    context_parts.append(f"Score: {game['teams']['away']['name']} {game['score']['away']}, {game['teams']['home']['name']} {game['score']['home']}")
                    context_parts.append(f"Game status: {game['status']}")
            
            # Build the prompt
            context = "\n".join(context_parts)
            prompt = f"{context}\n\nUser question: {transcript}\n\nProvide a helpful, concise response in character (2-3 sentences max):"
            
            # Generate response with safety settings
            generation_config = {
                'max_output_tokens': 150,  # Limit response length
                'temperature': 0.7,        # Balanced creativity
                'top_p': 0.8,             # Focus on likely responses
            }
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            # Clean up the response
            response_text = response.text.strip()
            
            # Remove any garbled text or excessive repetition
            if len(response_text) > 500:  # If too long, truncate
                response_text = response_text[:500] + "..."
            
            return response_text
            
        except Exception as e:
            logger.error(f"Error generating Gemini response: {e}")
            return self._generate_rule_based_response(transcript, game_id, persona_config['voice_config'])
    
    def _generate_rule_based_response(self, transcript, game_id, persona):
        """Generate response using rule-based patterns (fallback)"""
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
        
        return response_text
    
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
        """Get player ID by name (real Lakers vs Trail Blazers April 13, 2025)"""
        # Real player mapping from Lakers vs Trail Blazers game
        player_map = {
            # Lakers Players (from real game)
            'knecht': 1,
            'dalton knecht': 1,
            'goodwin': 2,
            'jordan goodwin': 2,
            'lebron': 3,
            'lebron james': 3,
            'davis': 4,
            'anthony davis': 4,
            'reaves': 5,
            'austin reaves': 5,
            # Trail Blazers Players (from real game)
            'banton': 6,
            'dalano banton': 6,
            'clingan': 7,
            'donovan clingan': 7,
            'henderson': 8,
            'scoot henderson': 8,
            'grant': 9,
            'jerami grant': 9,
            'simons': 10,
            'anfernee simons': 10
        }
        
        return player_map.get(player_name.lower())
    
    def get_available_personas(self):
        """Get list of available personas"""
        return list(self.personas.keys())
    
    def get_persona_info(self, persona):
        """Get information about a specific persona"""
        return self.personas.get(persona)
    
    def _get_fallback_response(self, persona):
        """Get fallback response when intent can't be parsed"""
        fallbacks = {
            'nerdy': "I didn't quite understand that query. Could you rephrase it with more specific terms?",
            'funny': "Hmm, that went over my head! Try asking me something about the game in a different way!",
            'passionate': "Sorry, I didn't catch that! Try asking about scores or player stats!",
            'raw': "Query not understood. Please try again."
        }
        
        return fallbacks.get(persona, fallbacks['passionate'])
