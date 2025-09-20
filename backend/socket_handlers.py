from flask_socketio import emit, join_room, leave_room
import logging

logger = logging.getLogger(__name__)

def register_socket_handlers(socketio):
    """Register all socket event handlers"""
    
    @socketio.on('connect')
    def handle_connect():
        logger.info(f"Client connected: {request.sid}")
        emit('connected', {'message': 'Connected to Sports Commentator'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        logger.info(f"Client disconnected: {request.sid}")
    
    @socketio.on('join_game')
    def handle_join_game(data):
        game_id = data.get('game_id')
        if game_id:
            join_room(f"game:{game_id}")
            logger.info(f"Client {request.sid} joined game {game_id}")
            emit('joined_game', {'game_id': game_id})
    
    @socketio.on('leave_game')
    def handle_leave_game(data):
        game_id = data.get('game_id')
        if game_id:
            leave_room(f"game:{game_id}")
            logger.info(f"Client {request.sid} left game {game_id}")
            emit('left_game', {'game_id': game_id})
    
    @socketio.on('join_scoreboard')
    def handle_join_scoreboard():
        join_room('scoreboard')
        logger.info(f"Client {request.sid} joined scoreboard")
        emit('joined_scoreboard')
    
    @socketio.on('leave_scoreboard')
    def handle_leave_scoreboard():
        leave_room('scoreboard')
        logger.info(f"Client {request.sid} left scoreboard")
        emit('left_scoreboard')

# Socket emission helpers
def emit_game_update(socketio, game_id, data):
    """Emit game update to all clients watching this game"""
    socketio.emit('game_update', data, room=f"game:{game_id}")

def emit_scoreboard_update(socketio, data):
    """Emit scoreboard update to all clients"""
    socketio.emit('scoreboard_update', data, room='scoreboard')

def emit_commentary(socketio, game_id, commentary_data):
    """Emit new commentary to game watchers"""
    socketio.emit('new_commentary', commentary_data, room=f"game:{game_id}")
