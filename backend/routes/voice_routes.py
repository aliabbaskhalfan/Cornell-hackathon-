from flask import Blueprint, jsonify, request
from services.voice_service import VoiceService
import logging

voice_bp = Blueprint('voice', __name__)
logger = logging.getLogger(__name__)

voice_service = VoiceService()

@voice_bp.route('/', methods=['GET'])
def voice_health():
    """Health/info endpoint for voice API (GET-friendly)."""
    try:
        personas = voice_service.get_available_personas()
        return jsonify({
            "success": True,
            "message": "Voice API is healthy. Use POST to this endpoint to get a Gemini answer and TTS.",
            "personas": personas,
            "usage": {
                "method": "POST",
                "path": "/api/voice",
                "body": {
                    "transcript": "your question",
                    "game_id": "lakers_trailblazers_20250413",
                    "persona": "passionate",
                    "user_context": {"interests": ["lakers"], "preferences": {"brevity": "short"}}
                }
            }
        })
    except Exception as e:
        logger.error(f"Error in voice health: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@voice_bp.route('', methods=['GET'])
def voice_health_no_slash():
    return voice_health()

@voice_bp.route('/', methods=['POST'])
def process_voice_query():
    """Process voice query and return response with audio"""
    try:
        data = request.get_json()
        transcript = data.get('transcript')
        game_id = data.get('game_id')
        persona = data.get('persona', 'passionate')
        user_context = data.get('user_context') or {}
        # Attach user_id from header when missing for persistence
        try:
            if 'user_id' not in user_context:
                user_id = request.headers.get('X-User-Id') or request.args.get('user_id')
                if user_id:
                    user_context['user_id'] = user_id
        except Exception:
            pass
        
        if not transcript:
            return jsonify({
                "success": False,
                "error": "transcript is required"
            }), 400
        
        response = voice_service.process_query(
            transcript=transcript,
            game_id=game_id,
            persona=persona,
            user_context=user_context
        )
        
        return jsonify({
            "success": True,
            "response": response
        })
    except Exception as e:
        logger.error(f"Error processing voice query: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@voice_bp.route('', methods=['POST'])
def process_voice_query_no_slash():
    return process_voice_query()

@voice_bp.route('/personas', methods=['GET'])
def get_personas():
    """Get available personas"""
    try:
        personas = voice_service.get_available_personas()
        persona_info = {}
        for persona in personas:
            persona_info[persona] = voice_service.get_persona_info(persona)
        
        return jsonify({
            "success": True,
            "personas": persona_info
        })
    except Exception as e:
        logger.error(f"Error getting personas: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@voice_bp.route('/test', methods=['POST'])
def test_voice_features():
    """Test endpoint for voice features"""
    try:
        data = request.get_json()
        test_type = data.get('test_type', 'tts')
        
        if test_type == 'tts':
            # Test TTS with specific persona or all personas
            test_text = "Hello! This is a test of the text-to-speech system."
            target_persona = data.get('persona')
            
            if target_persona:
                # Test specific persona only
                audio_url = voice_service.tts_service.generate_audio(test_text, target_persona)
                results = {
                    target_persona: {
                        'text': test_text,
                        'audio_url': audio_url
                    }
                }
            else:
                # Test all personas (fallback for backward compatibility)
                results = {}
                for persona in voice_service.get_available_personas():
                    audio_url = voice_service.tts_service.generate_audio(test_text, persona)
                    results[persona] = {
                        'text': test_text,
                        'audio_url': audio_url
                    }
            
            return jsonify({
                "success": True,
                "test_type": "tts",
                "results": results
            })
        
        elif test_type == 'gemini':
            # Test Gemini AI integration
            test_query = data.get('query', 'Tell me about basketball')
            persona = data.get('persona', 'passionate')
            user_context = data.get('user_context')
            
            response = voice_service.process_query(
                transcript=test_query,
                persona=persona,
                user_context=user_context
            )
            
            return jsonify({
                "success": True,
                "test_type": "gemini",
                "query": test_query,
                "response": response
            })
        
        else:
            return jsonify({
                "success": False,
                "error": "Invalid test_type. Use 'tts' or 'gemini'"
            }), 400
            
    except Exception as e:
        logger.error(f"Error in voice test: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
