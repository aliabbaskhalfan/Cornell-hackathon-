from celery_app import celery_app
from services.commentary_service import CommentaryService
from socket_handlers import emit_commentary
import logging

logger = logging.getLogger(__name__)

commentary_service = CommentaryService()

@celery_app.task
def generate_commentary_task(game_id, event_type='generic', persona='passionate'):
    """Generate commentary for a game event"""
    try:
        commentary = commentary_service.generate_commentary(
            game_id=game_id,
            event_type=event_type,
            persona=persona
        )
        
        # Emit commentary to game subscribers
        # emit_commentary(socketio, game_id, commentary)
        
        logger.info(f"Generated commentary for game {game_id}")
        return {'success': True, 'commentary': commentary}
        
    except Exception as e:
        logger.error(f"Error generating commentary: {e}")
        return {'success': False, 'error': str(e)}

@celery_app.task
def auto_commentary_on_event(game_id, event_data):
    """Automatically generate commentary when significant events occur"""
    try:
        event_type = event_data.get('type', 'generic')
        
        # Determine if event is significant enough for commentary
        if _is_significant_event(event_data):
            # Generate commentary with different personas
            personas = ['passionate', 'nerdy', 'raw']
            
            for persona in personas:
                generate_commentary_task.apply_async(
                    args=[game_id, event_type, persona],
                    countdown=1  # Small delay to avoid spam
                )
        
        return {'success': True, 'event_processed': True}
        
    except Exception as e:
        logger.error(f"Error processing event for commentary: {e}")
        return {'success': False, 'error': str(e)}

def _is_significant_event(event_data):
    """Determine if an event is significant enough for commentary"""
    payload = event_data.get('payload', {})
    description = payload.get('description', '').lower()
    
    # Significant event keywords
    significant_keywords = [
        'three', 'three-pointer', '3-pointer',
        'dunk', 'block', 'steal',
        'timeout', 'foul', 'free throw',
        'lead', 'tie', 'overtime'
    ]
    
    return any(keyword in description for keyword in significant_keywords)
