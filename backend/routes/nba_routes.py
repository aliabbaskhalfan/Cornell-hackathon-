from flask import Blueprint, jsonify, request
from services.sportsdata_service import SportsDataService
from services.game_service import GameService
from database import db
import logging

nba_bp = Blueprint('nba', __name__)
logger = logging.getLogger(__name__)

sportsdata_service = SportsDataService()
game_service = GameService()

@nba_bp.route('/scoreboard')
def get_scoreboard():
    """Get today's NBA games"""
    try:
        games = sportsdata_service.get_todays_games()
        return jsonify({
            "success": True,
            "games": games,
            "count": len(games)
        })
    except Exception as e:
        logger.error(f"Error fetching scoreboard: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@nba_bp.route('/game/<game_id>/snapshot')
def get_game_snapshot(game_id):
    """Get live game data including box score and play-by-play"""
    try:
        # Fetch fresh data from SportsDataIO
        game_data = sportsdata_service.get_game_details(game_id)
        box_score = sportsdata_service.get_box_score(game_id)
        play_by_play = sportsdata_service.get_play_by_play(game_id)
        
        # Update database
        game_service.update_game_data(game_id, game_data, box_score, play_by_play)
        
        return jsonify({
            "success": True,
            "game": game_data,
            "box_score": box_score,
            "play_by_play": play_by_play
        })
    except Exception as e:
        logger.error(f"Error fetching game snapshot for {game_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@nba_bp.route('/q/triple/<game_id>/<player_id>')
def get_triple_double_progress(game_id, player_id):
    """Get triple-double progress for a player"""
    try:
        progress = game_service.get_triple_double_progress(game_id, player_id)
        return jsonify({
            "success": True,
            "player_id": player_id,
            "progress": progress
        })
    except Exception as e:
        logger.error(f"Error getting triple-double progress: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
