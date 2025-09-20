from flask import Blueprint, jsonify, request
from services.commentary_service import CommentaryService
import logging

commentary_bp = Blueprint('commentary', __name__)
logger = logging.getLogger(__name__)

commentary_service = CommentaryService()

@commentary_bp.route('/emit', methods=['POST'])
def emit_commentary():
    """Force generate a commentary line for testing"""
    try:
        data = request.get_json()
        game_id = data.get('game_id')
        event_type = data.get('event_type', 'generic')
        persona = data.get('persona', 'passionate')
        
        if not game_id:
            return jsonify({
                "success": False,
                "error": "game_id is required"
            }), 400
        
        commentary = commentary_service.generate_commentary(
            game_id=game_id,
            event_type=event_type,
            persona=persona
        )
        
        return jsonify({
            "success": True,
            "commentary": commentary
        })
    except Exception as e:
        logger.error(f"Error generating commentary: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@commentary_bp.route('/history/<game_id>')
def get_commentary_history(game_id):
    """Get commentary history for a game"""
    try:
        history = commentary_service.get_commentary_history(game_id)
        return jsonify({
            "success": True,
            "commentary": history
        })
    except Exception as e:
        logger.error(f"Error fetching commentary history: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
