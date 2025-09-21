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
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
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
            
            # Generate with Gemini using preference-influenced settings
            # Adjust generation parameters based on user preferences
            base_temp = 0.8  # Default for commentary (slightly more creative than chat)
            max_tokens = 100
            
            if user_context and user_context.get('preferences'):
                prefs = user_context['preferences']
                energy = prefs.get('energyLevel', 50)
                comedy = prefs.get('comedyLevel', 25)
                stat_focus = prefs.get('statFocus', 50)
                
                # DEBUG: Log the actual preference values received
                logger.info(f"[PREFERENCES DEBUG] Energy: {energy}, Comedy: {comedy}, StatFocus: {stat_focus}")
                logger.info(f"[PREFERENCES DEBUG] Raw preferences object: {prefs}")
                
                # Higher energy/comedy = higher temperature (more varied responses)
                if energy >= 80 or comedy >= 70:
                    base_temp = 1.0  # Maximum creativity for high energy/comedy
                    logger.info(f"[TEMP DEBUG] Using MAXIMUM creativity temp={base_temp} (energy={energy}, comedy={comedy})")
                elif energy >= 60 or comedy >= 40:
                    base_temp = 0.9  # High creativity
                    logger.info(f"[TEMP DEBUG] Using medium creativity temp={base_temp} (energy={energy}, comedy={comedy})")
                elif energy <= 30 and comedy <= 20:
                    base_temp = 0.6  # More measured and consistent
                    logger.info(f"[TEMP DEBUG] Using low creativity temp={base_temp} (energy={energy}, comedy={comedy})")
                else:
                    logger.info(f"[TEMP DEBUG] Using default temp={base_temp} (energy={energy}, comedy={comedy})")
                
                # Higher stat focus = more tokens for detailed analysis
                if stat_focus >= 70:
                    max_tokens = 150  # Allow more room for stats and analysis
                    logger.info(f"[TOKENS DEBUG] Using extended tokens={max_tokens} for high stat focus ({stat_focus})")
            else:
                logger.info("[PREFERENCES DEBUG] No user_context or preferences found, using defaults")
            
            generation_config = {
                'max_output_tokens': max_tokens,
                'temperature': base_temp,
                'top_p': 0.95 if base_temp >= 1.0 else 0.9,  # Even more diverse for max creativity
                'top_k': 40 if base_temp >= 1.0 else 50,  # More randomness for high energy/comedy
            }
            
            response = self.model.generate_content(prompt, generation_config=generation_config)
            commentary_text = response.text.strip()
            logger.info(f"Gemini response (temp={base_temp}): {commentary_text}")
            
            # Ensure length limit
            if len(commentary_text) > Config.MAX_COMMENTARY_LENGTH:
                commentary_text = commentary_text[:Config.MAX_COMMENTARY_LENGTH] + "..."
            
            # Generate audio (respect user preferences if provided)
            language = None
            explicit_voice_id = None
            if isinstance(user_context, dict):
                prefs = user_context.get('preferences') or {}
                language = prefs.get('language')
                explicit_voice_id = prefs.get('voiceId') or prefs.get('voice_id')

            audio_url = self.tts_service.generate_audio(
                commentary_text,
                persona,
                voice_id=explicit_voice_id,
                language=language
            )
            
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
            # Check if it's a quota error and use smart fallback
            if "quota" in str(e).lower() or "429" in str(e):
                return self._get_smart_fallback_commentary(persona, play_description, event_type)
            return self._get_fallback_commentary(persona)
    
    def _create_commentary_prompt(self, game_summary, event_type, persona_config, play_description='', user_context=None):
        """Create prompt for Gemini"""
        game = game_summary['game']
        top_scorers = game_summary['top_scorers']
        
        # Handle both database structure (no teams field) and minimal context structure (has teams field)
        if 'teams' in game:
            away_team = game['teams']['away']['name']
            home_team = game['teams']['home']['name']
        else:
            # Default team names for mock game when no teams field
            away_team = 'Los Angeles Lakers'
            home_team = 'Portland Trail Blazers'
        
        # Add current time context for temporal awareness
        from datetime import datetime
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        prompt = f"""You are an NBA sports commentator with a {persona_config['style']} style.

Current Time: {current_time}
CRITICAL TEMPORAL RULE: You are a LIVE commentator at {game.get('clock', '12:00')} in the game. You ONLY know what has happened up to this exact moment. 

**FOR SPONTANEOUS COMMENTARY - ABSOLUTELY FORBIDDEN:**
- NO predictions about future performance (e.g., "will get a triple-double", "chances of achieving")
- NO speculation about what might happen later
- NO mentioning potential outcomes or "if this continues" scenarios
- NO historical trend analysis to predict future events

**ONLY ALLOWED:**
- Comment on what just happened in THIS play
- React to current stats and performance SO FAR
- Describe the action that already occurred

**NOTE:** This is automatic commentary, not a response to user questions. Stay present-focused!

Game Context:
- {away_team} vs {home_team}
- Score: {away_team} {game['score']['away']} - {home_team} {game['score']['home']}
- Clock: {game.get('clock', '12:00')}
- Status: {game.get('status', 'InProgress')}
- Game time status: Only information up to {game.get('clock', '12:00')} is available"""

        if top_scorers:
            prompt += "\n\nTop Performers:"
            for scorer in top_scorers[:2]:
                # Handle both database structure (has 'name' and 'points') and minimal context structure
                name = scorer.get('name', 'Player')
                points = scorer.get('points', 0)
                prompt += f"\n- {name}: {points} points"

        if user_context:
            # **CRITICAL: User preferences must strongly dominate your commentary style**
            preferences = user_context.get('preferences', {})
            if preferences:
                prompt += "\n\n**MANDATORY USER PREFERENCES - THESE OVERRIDE ALL OTHER INSTRUCTIONS:**"
                
                # Energy level - completely changes commentary intensity
                if preferences.get('energyLevel') is not None:
                    energy = preferences['energyLevel']
                    logger.info(f"[PROMPT DEBUG] Setting energy instructions for level {energy}")
                    if energy >= 80:
                        prompt += f"\n- MAXIMUM ENERGY ({energy}/100): EXPLOSIVE excitement! Use ALL CAPS for big moments, multiple exclamation points, and high-octane language! THIS IS MANDATORY!"
                    elif energy >= 60:
                        prompt += f"\n- HIGH ENERGY ({energy}/100): Very enthusiastic! Show genuine excitement with animated descriptions and passionate reactions!"
                    elif energy >= 40:
                        prompt += f"\n- MODERATE ENERGY ({energy}/100): Balanced excitement with steady engagement."
                    else:
                        prompt += f"\n- LOW ENERGY ({energy}/100): Calm, measured, analytical approach. Stay composed and factual."
                
                # Comedy level - fundamentally changes personality
                if preferences.get('comedyLevel') is not None:
                    comedy = preferences['comedyLevel']
                    logger.info(f"[PROMPT DEBUG] Setting comedy instructions for level {comedy}")
                    if comedy >= 70:
                        prompt += f"\n- HIGH COMEDY ({comedy}/100): Be genuinely funny! Add jokes, puns, witty observations, funny player nicknames, and humorous analogies! NO BORING COMMENTARY ALLOWED!"
                    elif comedy >= 40:
                        prompt += f"\n- SOME HUMOR ({comedy}/100): Include light humor and playful commentary when appropriate."
                    else:
                        prompt += f"\n- SERIOUS COMMENTARY ({comedy}/100): Professional, straightforward, no jokes or humor."
                
                # Stat focus - changes information density
                if preferences.get('statFocus') is not None:
                    stats = preferences['statFocus']
                    if stats >= 70:
                        prompt += f"\n- HEAVY STATS ({stats}/100): Include detailed percentages, historical comparisons, advanced metrics, and analytical breakdowns!"
                    elif stats >= 40:
                        prompt += f"\n- MODERATE STATS ({stats}/100): Mention key relevant statistics."
                    else:
                        prompt += f"\n- EMOTION FOCUS ({stats}/100): Emphasize storylines, momentum, and feelings over numbers."
                
                # Team bias - affects favoritism and excitement
                if preferences.get('biasLevel') is not None and preferences.get('favoriteTeam'):
                    bias = preferences['biasLevel']
                    team = preferences['favoriteTeam'].get('name', 'favorite team') if isinstance(preferences['favoriteTeam'], dict) else preferences['favoriteTeam']
                    if bias >= 70:
                        prompt += f"\n- STRONG {team.upper()} FAN ({bias}/100): Show clear favoritism! Get EXTRA excited for {team} plays, use 'we/us', be defensive about criticism!"
                    elif bias >= 40:
                        prompt += f"\n- {team} PREFERENCE ({bias}/100): Show noticeable but restrained favoritism toward {team}."
                    else:
                        prompt += f"\n- NEUTRAL COVERAGE ({bias}/100): Balanced commentary between teams."
            
            # User interests - make them central to commentary
            if user_context.get('interests'):
                interests = user_context['interests']
                prompt += f"\n\n**USER'S PRIMARY INTERESTS - ALWAYS PRIORITIZE:** {', '.join(interests)}"
                prompt += "\n- Frame every comment through the lens of what the user cares about most"
                prompt += "\n- Use references and examples that connect to their interests"
            
            # Fantasy context - make it the star when relevant
            if user_context.get('fantasy_info'):
                prompt += f"\n\n**FANTASY PRIORITY:** {user_context['fantasy_info']}"
                prompt += "\n- ALWAYS mention fantasy implications for player performances"
                prompt += "\n- Call out fantasy-relevant stats (points, rebounds, assists, steals, blocks)"
                prompt += "\n- React to performances from a fantasy owner's perspective"
            
            # Custom instructions - absolute highest priority
            if user_context.get('customInstructions'):
                prompt += f"\n\n**CUSTOM USER INSTRUCTIONS - ABSOLUTE PRIORITY - OVERRIDE EVERYTHING ELSE:**"
                prompt += f"\n'{user_context['customInstructions']}'"
                prompt += "\n- These instructions are more important than any other guidelines - follow them exactly!"

        prompt += f"""

Raw Play-by-Play Event: "{play_description}"

Your task: Convert this raw play-by-play line into natural commentary that follows the user's preferences EXACTLY.

**CRITICAL REQUIREMENTS:**
1. **NO FUTURE PREDICTIONS** - Only comment on what JUST HAPPENED, never predict what will happen
2. **FOLLOW USER PREFERENCES ABOVE ALL ELSE** - Their settings determine how you respond
3. **Energy Level**: Match their exact energy setting (high energy = excited, low energy = calm)
4. **Comedy Level**: Add humor ONLY if their comedy level is high
5. **Stat Focus**: Include detailed stats ONLY if their stat focus is high
6. **Team Bias**: Show favoritism ONLY if they have bias toward a team involved
7. **Fantasy Focus**: Always mention fantasy implications if they have fantasy info
8. **Custom Instructions**: These override everything else - follow them precisely
9. **User Interests**: Connect to what they care about most

**STYLE ENFORCEMENT FOR HIGH SETTINGS - ABSOLUTELY MANDATORY:**
- If Energy ≥ 80: USE CAPS for big moments, multiple exclamation points!!!, explosive adjectives! BE EXPLOSIVE!
- If Comedy ≥ 70: MUST include puns, jokes, or funny observations - NO BORING COMMENTARY WHATSOEVER!
- If StatFocus ≥ 70: Include specific numbers, percentages, or comparisons

**FOR THIS USER (Energy={user_context.get('preferences', {}).get('energyLevel', 'unknown')}, Comedy={user_context.get('preferences', {}).get('comedyLevel', 'unknown')}):**
MAKE IT EXPLOSIVE AND FUNNY! Use caps, jokes, and high energy!

**EXAMPLES OF HIGH ENERGY + HIGH COMEDY STYLE (PRESENT TENSE ONLY):**
- "BOOM! That three-pointer was SPICIER than my grandma's hot sauce! 🔥"
- "OH MY GOODNESS! He just COOKED that defender like Sunday dinner!"
- "WOWZA! That dunk was so nasty it needs a parental advisory warning!"
- "Murray's got 8 points already - he's COOKING with GAS tonight!"
- "LeBron just picked up his 3rd assist - the King is DEALING right now!"

**BAD EXAMPLES (NEVER DO THIS):**
- "If this continues, LeBron will get a triple-double" ❌
- "Murray's chances of a big game are looking good" ❌
- "This trend suggests..." ❌

Base persona style: {persona_config['style']} with tone: {persona_config['tone']}
But ADAPT this persona to match their exact preference settings!

Keep it about 1 max 2 sentences while being authentic to their personalized style.

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
    
    def _get_smart_fallback_commentary(self, persona, play_description, event_type):
        """Generate contextual commentary without Gemini when quota exceeded"""
        import re
        
        # Extract key info from play description
        player_match = re.search(r'(\w+)\s+(?:3PT|3-pt|Jump Shot|Layup|Dunk|Free Throw)', play_description, re.IGNORECASE)
        player_name = player_match.group(1) if player_match else None
        
        points_match = re.search(r'\((\d+)\s+PTS?\)', play_description, re.IGNORECASE)
        points = points_match.group(1) if points_match else None
        
        # Generate contextual commentary based on event type and persona
        if 'shot' in event_type.lower() or 'basket' in event_type.lower():
            if persona == 'passionate':
                if '3PT' in play_description or '3-pt' in play_description:
                    commentary = f"What a shot from beyond the arc!" if player_name else "Three-pointer connects!"
                else:
                    commentary = f"Beautiful basket!" if player_name else "Great shot!"
            else:  # nerdy
                if '3PT' in play_description or '3-pt' in play_description:
                    commentary = f"Three-point field goal successfully converted" if player_name else "Long-range shooting efficiency on display"
                else:
                    commentary = f"Field goal percentage improving" if player_name else "Efficient scoring"
        elif 'foul' in event_type.lower():
            commentary = "Referee's whistle stops play" if persona == 'nerdy' else "Foul called on the play!"
        elif 'turnover' in event_type.lower():
            commentary = "Possession changes hands" if persona == 'nerdy' else "Turnover! What a mistake!"
        else:
            # Default based on persona
            fallbacks = {
                'nerdy': "Game statistics continue to develop",
                'passionate': "The action continues!",
                'raw': "Play continues"
            }
            commentary = fallbacks.get(persona, fallbacks['passionate'])
        
        return {
            'text': commentary,
            'audio_url': None,
            'persona': persona,
            'timestamp': datetime.now()
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
