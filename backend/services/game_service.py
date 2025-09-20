from database import db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class GameService:
    def __init__(self):
        self.db = db
    
    def update_game_data(self, game_id, game_data, box_score, play_by_play):
        """Update game data in database"""
        try:
            # Update game
            game_doc = {
                'game_id': game_id,
                'league': 'NBA',
                'status': game_data.get('Status'),
                'clock': game_data.get('Clock'),
                'score': {
                    'home': game_data.get('HomeTeamScore'),
                    'away': game_data.get('AwayTeamScore')
                },
                'updated_at': datetime.now()
            }
            
            self.db.games.update_one(
                {'game_id': game_id},
                {'$set': game_doc},
                upsert=True
            )
            
            # Update statlines
            if 'Players' in box_score:
                for player in box_score['Players']:
                    statline = {
                        'game_id': game_id,
                        'player_id': player.get('PlayerID'),
                        'name': player.get('Name'),
                        'team': player.get('Team'),
                        'points': player.get('Points', 0),
                        'rebounds': player.get('Rebounds', 0),
                        'assists': player.get('Assists', 0),
                        'steals': player.get('Steals', 0),
                        'blocks': player.get('Blocks', 0),
                        'turnovers': player.get('Turnovers', 0),
                        'updated_at': datetime.now()
                    }
                    
                    self.db.statlines.update_one(
                        {'game_id': game_id, 'player_id': player.get('PlayerID')},
                        {'$set': statline},
                        upsert=True
                    )
            
            # Store events from play-by-play
            if isinstance(play_by_play, list):
                for play in play_by_play:
                    event = {
                        'game_id': game_id,
                        'timestamp': datetime.now(),
                        'type': 'play',
                        'payload': {
                            'play_id': play.get('PlayID'),
                            'period': play.get('Period'),
                            'clock': play.get('Clock'),
                            'description': play.get('Description'),
                            'player_id': play.get('PlayerID'),
                            'team': play.get('Team')
                        }
                    }
                    
                    self.db.events.insert_one(event)
            
            logger.info(f"Updated game data for {game_id}")
            
        except Exception as e:
            logger.error(f"Error updating game data for {game_id}: {e}")
            raise
    
    def get_triple_double_progress(self, game_id, player_id):
        """Get triple-double progress for a player"""
        try:
            statline = self.db.statlines.find_one({
                'game_id': game_id,
                'player_id': int(player_id)
            })
            
            if not statline:
                return {
                    'player_name': 'Unknown Player',
                    'current_stats': {'points': 0, 'rebounds': 0, 'assists': 0},
                    'needs': {'points': 10, 'rebounds': 10, 'assists': 10},
                    'progress': {'points': 0, 'rebounds': 0, 'assists': 0}
                }
            
            current_stats = {
                'points': statline.get('points', 0),
                'rebounds': statline.get('rebounds', 0),
                'assists': statline.get('assists', 0)
            }
            
            needs = {
                'points': max(0, 10 - current_stats['points']),
                'rebounds': max(0, 10 - current_stats['rebounds']),
                'assists': max(0, 10 - current_stats['assists'])
            }
            
            progress = {
                'points': min(100, (current_stats['points'] / 10) * 100),
                'rebounds': min(100, (current_stats['rebounds'] / 10) * 100),
                'assists': min(100, (current_stats['assists'] / 10) * 100)
            }
            
            return {
                'player_name': statline.get('name', 'Unknown Player'),
                'current_stats': current_stats,
                'needs': needs,
                'progress': progress,
                'is_triple_double': all(needs[key] == 0 for key in needs)
            }
            
        except Exception as e:
            logger.error(f"Error getting triple-double progress: {e}")
            raise
    
    def get_game_summary(self, game_id):
        """Get game summary for commentary"""
        try:
            game = self.db.games.find_one({'game_id': game_id})
            if not game:
                return None
            
            # Get top performers
            top_scorers = list(self.db.statlines.find(
                {'game_id': game_id}
            ).sort('points', -1).limit(3))
            
            return {
                'game': game,
                'top_scorers': top_scorers,
                'score_difference': abs(game['score']['home'] - game['score']['away'])
            }
            
        except Exception as e:
            logger.error(f"Error getting game summary: {e}")
            return None
