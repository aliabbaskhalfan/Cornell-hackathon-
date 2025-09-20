from flask import Blueprint, jsonify, request
from services.voice_service import VoiceService
import logging

voice_bp = Blueprint('voice', __name__)
logger = logging.getLogger(__name__)

voice_service = VoiceService()

@voice_bp.route('/', methods=['POST'])
def process_voice_query():
    """Process voice query and return response with audio"""
    try:
        data = request.get_json()
        transcript = data.get('transcript')
        game_id = data.get('game_id')
        persona = data.get('persona', 'passionate')
        
        if not transcript:
            return jsonify({
                "success": False,
                "error": "transcript is required"
            }), 400
        
        response = voice_service.process_query(
            transcript=transcript,
            game_id=game_id,
            persona=persona
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
