import requests
import logging
from config import Config
from datetime import datetime, date

logger = logging.getLogger(__name__)

class SportsDataService:
    def __init__(self):
        self.api_key = Config.SPORTSDATA_API_KEY
        self.base_url = Config.SPORTSDATA_BASE_URL
        self.headers = {
            'Ocp-Apim-Subscription-Key': self.api_key
        }
    
    def get_todays_games(self):
        """Get today's NBA games"""
        try:
            today = date.today().strftime('%Y-%m-%d')
            url = f"{self.base_url}/scores/json/GamesByDate/{today}"
            
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            games = response.json()
            return self._normalize_games(games)
        except Exception as e:
            logger.error(f"Error fetching today's games: {e}")
            # Return mock data for demo
            return self._get_mock_games()
    
    def get_game_details(self, game_id):
        """Get detailed game information"""
        try:
            url = f"{self.base_url}/scores/json/Game/{game_id}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching game details for {game_id}: {e}")
            return self._get_mock_game_details(game_id)
    
    def get_box_score(self, game_id):
        """Get box score for a game"""
        try:
            url = f"{self.base_url}/scores/json/BoxScore/{game_id}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching box score for {game_id}: {e}")
            return self._get_mock_box_score(game_id)
    
    def get_play_by_play(self, game_id):
        """Get play-by-play data for a game"""
        try:
            url = f"{self.base_url}/scores/json/PlayByPlay/{game_id}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching play-by-play for {game_id}: {e}")
            return self._get_mock_play_by_play(game_id)
    
    def _normalize_games(self, games):
        """Normalize game data to our schema"""
        normalized = []
        for game in games:
            normalized.append({
                'game_id': game.get('GameID'),
                'league': 'NBA',
                'status': game.get('Status'),
                'clock': game.get('Clock'),
                'score': {
                    'home': game.get('HomeTeamScore'),
                    'away': game.get('AwayTeamScore')
                },
                'teams': {
                    'home': {
                        'id': game.get('HomeTeamID'),
                        'name': game.get('HomeTeam'),
                        'abbreviation': game.get('HomeTeamAbbreviation')
                    },
                    'away': {
                        'id': game.get('AwayTeamID'),
                        'name': game.get('AwayTeam'),
                        'abbreviation': game.get('AwayTeamAbbreviation')
                    }
                },
                'updated_at': datetime.now()
            })
        return normalized
    
    def _get_mock_games(self):
        """Return mock games for demo"""
        return [
            {
                'game_id': 'mock_001',
                'league': 'NBA',
                'status': 'InProgress',
                'clock': '2:34',
                'score': {'home': 98, 'away': 95},
                'teams': {
                    'home': {'id': 'BOS', 'name': 'Boston Celtics', 'abbreviation': 'BOS'},
                    'away': {'id': 'LAL', 'name': 'Los Angeles Lakers', 'abbreviation': 'LAL'}
                },
                'updated_at': datetime.now()
            },
            {
                'game_id': 'mock_002',
                'league': 'NBA',
                'status': 'InProgress',
                'clock': '4:12',
                'score': {'home': 87, 'away': 92},
                'teams': {
                    'home': {'id': 'GSW', 'name': 'Golden State Warriors', 'abbreviation': 'GSW'},
                    'away': {'id': 'DEN', 'name': 'Denver Nuggets', 'abbreviation': 'DEN'}
                },
                'updated_at': datetime.now()
            }
        ]
    
    def _get_mock_game_details(self, game_id):
        """Return mock game details"""
        return {
            'GameID': game_id,
            'Status': 'InProgress',
            'Clock': '2:34',
            'HomeTeamScore': 98,
            'AwayTeamScore': 95
        }
    
    def _get_mock_box_score(self, game_id):
        """Return mock box score"""
        return {
            'GameID': game_id,
            'Players': [
                {
                    'PlayerID': 1,
                    'Name': 'LeBron James',
                    'Team': 'LAL',
                    'Points': 28,
                    'Rebounds': 8,
                    'Assists': 6,
                    'Steals': 2,
                    'Blocks': 1,
                    'Turnovers': 3
                },
                {
                    'PlayerID': 2,
                    'Name': 'Jayson Tatum',
                    'Team': 'BOS',
                    'Points': 32,
                    'Rebounds': 7,
                    'Assists': 4,
                    'Steals': 1,
                    'Blocks': 0,
                    'Turnovers': 2
                }
            ]
        }
    
    def _get_mock_play_by_play(self, game_id):
        """Return mock play-by-play"""
        return [
            {
                'PlayID': 1,
                'Period': 4,
                'Clock': '2:34',
                'Description': 'LeBron James makes 3-pt shot',
                'PlayerID': 1,
                'Team': 'LAL'
            },
            {
                'PlayID': 2,
                'Period': 4,
                'Clock': '2:12',
                'Description': 'Jayson Tatum makes 2-pt shot',
                'PlayerID': 2,
                'Team': 'BOS'
            }
        ]
