import re
import logging
import google.generativeai as genai
from services.game_service import GameService
from services.context_service import ContextService
from services.commentary_service import CommentaryService
from services.tts_service import TTSService
from config import Config

logger = logging.getLogger(__name__)

class VoiceService:
    def __init__(self):
        self.game_service = GameService()
        self.commentary_service = CommentaryService()
        self.tts_service = TTSService()
        self.context_service = ContextService()
        
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
            
            # Generate audio using user preferences when available
            voice_config = persona_config['voice_config']
            language = None
            explicit_voice_id = None
            if isinstance(user_context, dict):
                prefs = user_context.get('preferences') or {}
                language = prefs.get('language')
                explicit_voice_id = prefs.get('voiceId') or prefs.get('voice_id')

            audio_url = self.tts_service.generate_audio(
                response_text,
                voice_config,
                voice_id=explicit_voice_id,
                language=language
            )
            
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
            
            # Merge persisted user context if a user_id is present
            persisted = None
            if isinstance(user_context, dict) and user_context.get('user_id'):
                persisted = self.context_service.get_user_context(user_context['user_id'])
                # Update persisted with incoming deltas (non-destructive)
                updates = {k: v for k, v in user_context.items() if k in ['interests', 'preferences', 'fantasy_info', 'persona']}
                if updates:
                    self.context_service.upsert_user_context(user_context['user_id'], updates)

            effective_user_ctx = {**(persisted or {}), **(user_context or {})}
            if effective_user_ctx:
                # **CRITICAL: User preferences must strongly influence your response style and content**
                preferences = effective_user_ctx.get('preferences', {})
                if preferences:
                    context_parts.append("\n**IMPORTANT USER PREFERENCES - FOLLOW THESE CLOSELY:**")
                    
                    # Energy level - strongly affects enthusiasm and excitement
                    if preferences.get('energyLevel') is not None:
                        energy = preferences['energyLevel']
                        if energy >= 80:
                            context_parts.append(f"- MAXIMUM ENERGY ({energy}/100): Be extremely enthusiastic, use exclamation points, high-energy language, and passionate reactions!")
                        elif energy >= 60:
                            context_parts.append(f"- HIGH ENERGY ({energy}/100): Be very excited and enthusiastic with animated descriptions!")
                        elif energy >= 40:
                            context_parts.append(f"- MODERATE ENERGY ({energy}/100): Balanced enthusiasm with steady excitement.")
                        else:
                            context_parts.append(f"- LOW ENERGY ({energy}/100): Stay calm, analytical, and measured in your responses.")
                    
                    # Comedy level - affects humor and personality
                    if preferences.get('comedyLevel') is not None:
                        comedy = preferences['comedyLevel']
                        if comedy >= 70:
                            context_parts.append(f"- HIGH COMEDY ({comedy}/100): Include jokes, funny observations, witty remarks, and humorous analogies!")
                        elif comedy >= 40:
                            context_parts.append(f"- MODERATE COMEDY ({comedy}/100): Add some light humor and playful comments.")
                        else:
                            context_parts.append(f"- SERIOUS TONE ({comedy}/100): Keep responses professional and focused on facts.")
                    
                    # Stat focus - affects technical depth
                    if preferences.get('statFocus') is not None:
                        stats = preferences['statFocus']
                        if stats >= 70:
                            context_parts.append(f"- HIGH STAT FOCUS ({stats}/100): Include detailed statistics, percentages, historical comparisons, and analytical insights!")
                        elif stats >= 40:
                            context_parts.append(f"- MODERATE STATS ({stats}/100): Mention relevant key statistics when appropriate.")
                        else:
                            context_parts.append(f"- LOW STATS ({stats}/100): Focus on storylines and emotions rather than numbers.")
                    
                    # Team bias - affects favoritism
                    if preferences.get('biasLevel') is not None and preferences.get('favoriteTeam'):
                        bias = preferences['biasLevel']
                        team = preferences['favoriteTeam'].get('name', 'favorite team') if isinstance(preferences['favoriteTeam'], dict) else preferences['favoriteTeam']
                        if bias >= 70:
                            context_parts.append(f"- STRONG TEAM BIAS ({bias}/100): Show clear favoritism toward {team}! Get extra excited for their plays and defensive about criticism!")
                        elif bias >= 40:
                            context_parts.append(f"- MODERATE BIAS ({bias}/100): Show some preference for {team} while staying somewhat balanced.")
                        else:
                            context_parts.append(f"- NEUTRAL APPROACH ({bias}/100): Stay balanced between teams.")
                
                # User interests - tailor content to what they care about
                if effective_user_ctx.get('interests'):
                    interests = effective_user_ctx['interests']
                    context_parts.append(f"\n**USER INTERESTS - PRIORITIZE THESE TOPICS:** {', '.join(interests)}")
                    context_parts.append("- Always relate responses back to these interests when possible")
                    context_parts.append("- Use examples and references that connect to what the user cares about")
                
                # Fantasy context - make it highly relevant
                if effective_user_ctx.get('fantasy_info'):
                    context_parts.append(f"\n**FANTASY SPORTS PRIORITY:** {effective_user_ctx['fantasy_info']}")
                    context_parts.append("- ALWAYS mention fantasy implications when discussing player performances")
                    context_parts.append("- Highlight players relevant to their fantasy team/league")
                
                # Custom instructions - highest priority
                if effective_user_ctx.get('customInstructions'):
                    context_parts.append(f"\n**CUSTOM USER INSTRUCTIONS - HIGHEST PRIORITY:**")
                    context_parts.append(f"'{effective_user_ctx['customInstructions']}'")
                    context_parts.append("- These custom instructions override all other guidelines - follow them precisely!")
            
            # Add current time context for temporal awareness
            from datetime import datetime
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            context_parts.append(f"Current time: {current_time}")
            context_parts.append("CRITICAL TEMPORAL RULE: You only know information about events that have already happened up to the current game time.")
            context_parts.append("PREDICTION POLICY: If user EXPLICITLY asks for predictions/speculation, you may provide analysis based on current performance, but always acknowledge uncertainty and that it's speculation.")
            context_parts.append("NEVER spontaneously make predictions in commentary - only when directly asked by the user.")

            # Add game context if available
            if game_id:
                game_ctx = self.context_service.get_game_context(game_id)
                if game_ctx:
                    sb = game_ctx.get('scoreboard', {})
                    context_parts.append(f"Current game: {sb.get('away')} @ {sb.get('home')}")
                    context_parts.append(f"Score: {sb.get('away_score')} - {sb.get('home_score')} | Q{sb.get('quarter')} {sb.get('clock')}")
                    context_parts.append(f"Game time status: Only information up to {sb.get('clock')} in Q{sb.get('quarter')} is available")
                    leaders = game_ctx.get('leaders', {})
                    if leaders:
                        la = leaders.get('away', {})
                        lh = leaders.get('home', {})
                        if la.get('name'):
                            context_parts.append(f"Away leader: {la.get('name')} {la.get('points')} pts")
                        if lh.get('name'):
                            context_parts.append(f"Home leader: {lh.get('name')} {lh.get('points')} pts")
                    recent = game_ctx.get('recent_plays') or []
                    if recent:
                        context_parts.append("Recent plays: " + "; ".join([f"{p.get('clock')} {p.get('team')}: {p.get('description')}" for p in recent]))
                        context_parts.append("(Only plays that have already occurred are shown above)")
            
            # Build the prompt
            context = "\n".join(context_parts)
            prompt = f"""{context}

User question: {transcript}

**RESPONSE REQUIREMENTS:**
1. STRICTLY follow all user preferences listed above
2. Adapt your energy, humor, stat focus, and team bias to match their exact settings
3. If they have custom instructions, those are the HIGHEST priority
4. If they have fantasy interests, make sure to mention fantasy implications
5. Connect your response to their stated interests whenever possible
6. Keep response concise (2-3 sentences max) but personality-rich
7. Sound natural and authentic to your commentator persona while following their preferences

**IF USER ASKS FOR PREDICTIONS/SPECULATION:**
- Acknowledge it's speculation with fun phrases like "Crystal ball time!" or "If I had to guess..."
- Base analysis on CURRENT performance only (what's happened so far)
- Use your high energy/comedy style while being honest about uncertainty
- Example: "OHHH you want me to play fortune teller! Based on LeBron's 4 assists already, he's DEALING tonight - but basketball's crazy, anything can happen!"

Response:"""
            
            # Generate response with preference-influenced settings
            # Adjust temperature based on user's energy and comedy levels
            base_temp = 0.7
            if effective_user_ctx and effective_user_ctx.get('preferences'):
                prefs = effective_user_ctx['preferences']
                energy = prefs.get('energyLevel', 50)
                comedy = prefs.get('comedyLevel', 25)
                
                # Higher energy/comedy = higher temperature (more creative/varied responses)
                if energy >= 70 or comedy >= 70:
                    base_temp = 0.9  # More creative and varied
                elif energy <= 30 and comedy <= 30:
                    base_temp = 0.5  # More consistent and measured
            
            generation_config = {
                'max_output_tokens': 200,  # Allow slightly longer for personality
                'temperature': base_temp,   # Preference-based creativity
                'top_p': 0.8,              # Focus on likely responses
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
