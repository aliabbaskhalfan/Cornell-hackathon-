from flask import Blueprint, jsonify, request
from database import db
from datetime import datetime
import logging

user_bp = Blueprint('user', __name__)
logger = logging.getLogger(__name__)


def _get_user_id():
    """Determine user id from header or query param. Fallback to 'default'."""
    user_id = request.headers.get('X-User-Id') or request.args.get('user_id')
    return user_id or 'default'


@user_bp.route('/preferences', methods=['GET'])
def get_preferences():
    try:
        user_id = _get_user_id()
        user = db.users.find_one({'_id': user_id})
        preferences = user.get('preferences') if user else None
        return jsonify({
            'success': True,
            'user_id': user_id,
            'preferences': preferences
        })
    except Exception as e:
        logger.error(f"Error getting preferences: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@user_bp.route('/preferences', methods=['POST'])
def save_preferences():
    try:
        user_id = _get_user_id()
        data = request.get_json() or {}
        preferences = data.get('preferences') or {}

        update_doc = {
            '_id': user_id,
            'preferences': preferences,
            'updated_at': datetime.utcnow()
        }

        # Use upsert to create/update
        db.users.update_one({'_id': user_id}, {'$set': update_doc}, upsert=True)

        return jsonify({'success': True, 'user_id': user_id})
    except Exception as e:
        logger.error(f"Error saving preferences: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


