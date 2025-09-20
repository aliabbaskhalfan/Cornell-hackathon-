from flask import Blueprint

api_bp = Blueprint('api', __name__)

from .nba_routes import nba_bp
from .commentary_routes import commentary_bp
from .voice_routes import voice_bp
from .user_routes import user_bp

api_bp.register_blueprint(nba_bp, url_prefix='/nba')
api_bp.register_blueprint(commentary_bp, url_prefix='/commentary')
api_bp.register_blueprint(voice_bp, url_prefix='/voice')
api_bp.register_blueprint(user_bp, url_prefix='/user')
