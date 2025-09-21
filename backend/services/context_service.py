import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from database import db
from services.sportsdata_service import SportsDataService


logger = logging.getLogger(__name__)


class ContextService:
    """Stores and composes user context and game context for Gemini prompts.

    - Persists per-user settings, interests, and preferences
    - Builds live game context (score, clock, leaders, last plays)
    - Optionally includes lightweight player info based on current box score
    """

    def __init__(self) -> None:
        self.db = db
        self.sports = SportsDataService()

    # ------------- User Context Persistence -------------
    def get_user_context(self, user_id: str) -> Dict[str, Any]:
        doc = self.db.user_contexts.find_one({'_id': user_id}) or {}
        ctx = {
            'interests': doc.get('interests', []),
            'preferences': doc.get('preferences', {}),
            'fantasy_info': doc.get('fantasy_info'),
            'persona': doc.get('persona'),
            'updated_at': doc.get('updated_at')
        }
        return ctx

    def upsert_user_context(self, user_id: str, updates: Dict[str, Any]) -> None:
        updates = updates or {}
        update_doc = {
            '_id': user_id,
            'updated_at': datetime.utcnow()
        }
        for key in ['interests', 'preferences', 'fantasy_info', 'persona']:
            if key in updates and updates[key] is not None:
                update_doc[key] = updates[key]
        self.db.user_contexts.update_one({'_id': user_id}, {'$set': update_doc}, upsert=True)

    # ------------- Game Context Composition -------------
    def get_game_context(self, game_id: Optional[str]) -> Dict[str, Any]:
        if not game_id:
            return {}
        try:
            game = self.sports.get_game_details(game_id)
            box = self.sports.get_box_score(game_id)
            pbp = self.sports.get_play_by_play(game_id)

            # Extract basic scoreboard
            home_abbr = game.get('HomeTeamAbbreviation') or game.get('HomeTeam')
            away_abbr = game.get('AwayTeamAbbreviation') or game.get('AwayTeam')
            home_score = game.get('HomeTeamScore', 0)
            away_score = game.get('AwayTeamScore', 0)
            quarter = game.get('Quarter') or game.get('Status')
            trm = game.get('TimeRemainingMinutes', 0)
            trs = game.get('TimeRemainingSeconds', 0)

            # Leaders from current box (simple: top points per team)
            leaders = self._compute_leaders(box)

            # Recent plays (last 5)
            recent = self._simplify_recent_plays(pbp, limit=5)

            return {
                'scoreboard': {
                    'home': home_abbr,
                    'away': away_abbr,
                    'home_score': home_score,
                    'away_score': away_score,
                    'quarter': str(quarter),
                    'clock': f"{int(trm):02d}:{int(trs):02d}",
                },
                'leaders': leaders,
                'recent_plays': recent,
            }
        except Exception as e:
            logger.error(f"Error composing game context for {game_id}: {e}")
            return {}

    def _compute_leaders(self, box: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        players: List[Dict[str, Any]] = box.get('Players') or box.get('players') or []
        home_leader: Tuple[int, Dict[str, Any]] = (-1, {})
        away_leader: Tuple[int, Dict[str, Any]] = (-1, {})
        for p in players:
            pts = int(p.get('Points') or p.get('points') or 0)
            team = p.get('Team') or p.get('team') or ''
            if not team:
                continue
            if team == self.sports._mock_home or team == (self.sports._mock_home):
                if pts > home_leader[0]:
                    home_leader = (pts, p)
            else:
                if pts > away_leader[0]:
                    away_leader = (pts, p)
        return {
            'home': {'name': (home_leader[1].get('Name') or ''), 'points': max(home_leader[0], 0)},
            'away': {'name': (away_leader[1].get('Name') or ''), 'points': max(away_leader[0], 0)},
        }

    def _simplify_recent_plays(self, pbp: List[Dict[str, Any]], limit: int = 5) -> List[Dict[str, Any]]:
        if not isinstance(pbp, list):
            return []
        recent = pbp[-limit:]
        out: List[Dict[str, Any]] = []
        for p in recent:
            out.append({
                'clock': p.get('Clock'),
                'team': p.get('Team'),
                'description': p.get('Description'),
                'points': p.get('Points', 0),
            })
        return out


