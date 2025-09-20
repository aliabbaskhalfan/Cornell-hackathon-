from celery_app import celery_app
from services.sportsdata_service import SportsDataService
from services.game_service import GameService
from socket_handlers import emit_scoreboard_update, emit_game_update
from flask_socketio import SocketIO
import logging

logger = logging.getLogger(__name__)

sportsdata_service = SportsDataService()
game_service = GameService()

@celery_app.task
def poll_scoreboard():
    """Poll for scoreboard updates"""
    try:
        games = sportsdata_service.get_todays_games()
        
        # Emit update to all scoreboard subscribers
        # Note: In production, you'd need to pass socketio instance
        # emit_scoreboard_update(socketio, {'games': games})
        
        logger.info(f"Polled scoreboard: {len(games)} games")
        return {'success': True, 'games_count': len(games)}
        
    except Exception as e:
        logger.error(f"Error polling scoreboard: {e}")
        return {'success': False, 'error': str(e)}

@celery_app.task
def poll_game_updates(game_id):
    """Poll for specific game updates"""
    try:
        game_data = sportsdata_service.get_game_details(game_id)
        box_score = sportsdata_service.get_box_score(game_id)
        play_by_play = sportsdata_service.get_play_by_play(game_id)
        
        # Update database
        game_service.update_game_data(game_id, game_data, box_score, play_by_play)
        
        # Emit update to game subscribers
        # emit_game_update(socketio, game_id, {
        #     'game': game_data,
        #     'box_score': box_score,
        #     'play_by_play': play_by_play
        # })
        
        logger.info(f"Updated game {game_id}")
        return {'success': True, 'game_id': game_id}
        
    except Exception as e:
        logger.error(f"Error polling game updates for {game_id}: {e}")
        return {'success': False, 'error': str(e)}

@celery_app.task
def schedule_game_polling():
    """Schedule polling for all active games"""
    try:
        games = sportsdata_service.get_todays_games()
        active_games = [game for game in games if game['status'] in ['InProgress', 'Scheduled']]
        
        for game in active_games:
            poll_game_updates.apply_async(
                args=[game['game_id']],
                countdown=3  # Poll every 3 seconds
            )
        
        logger.info(f"Scheduled polling for {len(active_games)} active games")
        return {'success': True, 'scheduled_games': len(active_games)}
        
    except Exception as e:
        logger.error(f"Error scheduling game polling: {e}")
        return {'success': False, 'error': str(e)}
