import requests
import logging
import os
from config import Config
from datetime import datetime, date, timedelta

logger = logging.getLogger(__name__)

class SportsDataService:
    def __init__(self):
        self.api_key = Config.SPORTSDATA_API_KEY
        self.base_url = Config.SPORTSDATA_BASE_URL
        self.headers = {
            'Ocp-Apim-Subscription-Key': self.api_key
        }
        self.use_mock = os.getenv('SPORTSDATA_USE_MOCK', 'true').lower() == 'true'
        self._mock_game_id = 'lakers_trailblazers_20250413'
        self._mock_home = 'POR'
        self._mock_away = 'LAL'
        self._mock_game_start = datetime.now()
        self._q1_play_script = self._build_q1_mock_script()
    
    def get_todays_games(self):
        """Get today's NBA games"""
        try:
            if self.use_mock:
                return self._get_mock_games()
            today = date.today().strftime('%Y-%m-%d')
            url = f"{self.base_url}/scores/json/GamesByDate/{today}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            games = response.json()
            normalized_games = self._normalize_games(games)
            if not normalized_games:
                logger.info("No games today, using mock Lakers vs Trail Blazers data")
                return self._get_mock_games()
            return normalized_games
        except Exception as e:
            logger.error(f"Error fetching today's games: {e}")
            # Return mock data for demo
            return self._get_mock_games()
    
    def get_game_details(self, game_id):
        """Get detailed game information"""
        try:
            if self.use_mock:
                return self._get_mock_game_details(game_id)
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
            if self.use_mock:
                return self._get_mock_box_score(game_id)
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
            if self.use_mock:
                return self._get_mock_play_by_play(game_id)
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
        current = self._compute_mock_q1_state()
        clock_str = f"{current['TimeRemainingMinutes']:02d}:{current['TimeRemainingSeconds']:02d}"
        logger.info(f"Mock games: clock={clock_str} score={current['HomeTeamScore']}-{current['AwayTeamScore']}")
        return [
            {
                'game_id': self._mock_game_id,
                'league': 'NBA',
                'status': 'InProgress' if current['TimeRemainingMinutes'] > 0 or current['TimeRemainingSeconds'] > 0 else 'EndOfPeriod',
                'clock': clock_str,
                'score': {'home': current['HomeTeamScore'], 'away': current['AwayTeamScore']},
                'teams': {
                    'home': {'id': self._mock_home, 'name': 'Portland Trail Blazers', 'abbreviation': self._mock_home},
                    'away': {'id': self._mock_away, 'name': 'Los Angeles Lakers', 'abbreviation': self._mock_away}
                },
                'updated_at': datetime.now()
            }
        ]
    
    def _get_mock_game_details(self, game_id):
        current = self._compute_mock_q1_state()
        return {
            'GameID': self._mock_game_id,
            'Status': 'InProgress' if current['TimeRemainingMinutes'] > 0 or current['TimeRemainingSeconds'] > 0 else 'EndOfPeriod',
            'Day': date.today().strftime('%Y-%m-%d'),
            'DateTime': datetime.now().isoformat(),
            'Quarter': '1',
            'TimeRemainingMinutes': current['TimeRemainingMinutes'],
            'TimeRemainingSeconds': current['TimeRemainingSeconds'],
            'AwayTeam': self._mock_away,
            'HomeTeam': self._mock_home,
            'AwayTeamID': 1610612747,
            'HomeTeamID': 1610612757,
            'AwayTeamScore': current['AwayTeamScore'],
            'HomeTeamScore': current['HomeTeamScore'],
            'HomeTeamAbbreviation': self._mock_home,
            'AwayTeamAbbreviation': self._mock_away,
            'IsClosed': False
        }
    
    def _get_mock_box_score(self, game_id):
        """Return a progressive box score aligned with SportsDataIO.
        Players start at 0 and accumulate points as plays occur.
        """
        # Seed a roster with all players referenced in Q1 script (stable IDs)
        base_roster = [
            # Lakers (LAL)
            {'PlayerID': 1, 'Name': 'Dalton Knecht', 'Team': 'LAL'},
            {'PlayerID': 2, 'Name': 'Jordan Goodwin', 'Team': 'LAL'},
            {'PlayerID': 3, 'Name': 'LeBron James', 'Team': 'LAL'},
            {'PlayerID': 4, 'Name': 'Anthony Davis', 'Team': 'LAL'},
            {'PlayerID': 5, 'Name': 'Austin Reaves', 'Team': 'LAL'},
            {'PlayerID': 11, 'Name': 'Alex Len', 'Team': 'LAL'},
            {'PlayerID': 12, 'Name': 'Christian Koloko', 'Team': 'LAL'},
            {'PlayerID': 13, 'Name': 'Markieff Morris', 'Team': 'LAL'},
            {'PlayerID': 14, 'Name': 'Shake Milton', 'Team': 'LAL'},
            {'PlayerID': 15, 'Name': 'Zach Jemison III', 'Team': 'LAL'},
            # Trail Blazers (POR)
            {'PlayerID': 6, 'Name': 'Dalano Banton', 'Team': 'POR'},
            {'PlayerID': 7, 'Name': 'Donovan Clingan', 'Team': 'POR'},
            {'PlayerID': 16, 'Name': 'Toumani Camara', 'Team': 'POR'},
            {'PlayerID': 17, 'Name': 'Matisse Thybulle', 'Team': 'POR'},
            {'PlayerID': 18, 'Name': 'Jamal Murray', 'Team': 'POR'},
            {'PlayerID': 19, 'Name': 'Rayan Rupert', 'Team': 'POR'},
            {'PlayerID': 20, 'Name': 'Sidney Cissoko', 'Team': 'POR'},
            {'PlayerID': 21, 'Name': 'Justin Minaya', 'Team': 'POR'},
            {'PlayerID': 22, 'Name': 'Walker Kessler', 'Team': 'POR'},
        ]

        # Initialize statline with zeros
        # Build robust name index: full name and last name
        name_to_id = {}
        for p in base_roster:
            full = p['Name']
            parts = full.split()
            last = parts[-1] if parts else full
            name_to_id[full.lower()] = p['PlayerID']
            name_to_id[last.lower()] = p['PlayerID']
        statlines = {
            p['PlayerID']: {
                'PlayerID': p['PlayerID'], 'Name': p['Name'], 'Team': p['Team'],
                'Points': 0, 'Rebounds': 0, 'Assists': 0, 'Steals': 0, 'Blocks': 0, 'Turnovers': 0
            } for p in base_roster
        }

        # Helper to extract player name from description
        def extract_player(desc: str) -> str | None:
            if not desc:
                return None
            # Patterns for makes/misses
            patterns = [
                r"^MISS\s+([A-Za-z]+(?:\s+[A-Za-z\.]+)?)\s+\d+['\"]?\s+.*",
                r"^([A-Za-z]+(?:\s+[A-Za-z\.]+)?)\s+\d+['\"]?\s+.*",
                r"^([A-Za-z]+(?:\s+[A-Za-z\.]+)?)\s+REBOUND",
                r"^([A-Za-z]+(?:\s+[A-Za-z\.]+)?)\s+Free Throw",
                r"^([A-Za-z]+(?:\s+[A-Za-z\.]+)?)\s+(?:STEAL|BLOCK|S\.FOUL|P\.FOUL|L\.B\.FOUL)",
                r"^([A-Za-z]+(?:\s+[A-Za-z\.]+)?)\s+(?:Bad Pass|Traveling|Out of Bounds).*Turnover",
            ]
            for pat in patterns:
                import re
                m = re.match(pat, desc)
                if m and m.group(1):
                    nm = m.group(1).strip()
                    if 3 <= len(nm) <= 30 and 'MISS' not in nm:
                        return nm
            return None

        def resolve_player_id(name: str | None) -> int | None:
            if not name:
                return None
            key = name.lower()
            if key in name_to_id:
                return name_to_id[key]
            # Try last token
            parts = key.split()
            if parts:
                last = parts[-1]
                return name_to_id.get(last)
            return None

        def extract_assist_player(desc: str) -> int | None:
            # Examples: "(Clingan 1 AST)", "(Camara 1 AST)"
            import re
            m = re.search(r"\(([^\)]+)\)", desc)
            if not m:
                return None
            inside = m.group(1)
            if 'AST' not in inside:
                return None
            # Take the first token before digits and AST
            nm = inside.split('AST')[0].strip()
            # remove trailing digits
            nm = re.sub(r"\d+\s*$", "", nm).strip()
            return resolve_player_id(nm)

        # Accumulate stats from plays that have already occurred
        current = self._compute_mock_q1_state()
        current_remaining = current['TimeRemainingMinutes'] * 60 + current['TimeRemainingSeconds']
        for p in self._q1_play_script:
            if p['seconds_remaining'] < current_remaining:
                # Play has already occurred when remaining time decreased below this play's time
                pass
            else:
                # Future play; skip accumulation
                continue
            pts = p['points']
            if pts > 0:
                nm = extract_player(p['description'])
                pid = resolve_player_id(nm)
                if pid and pid in statlines:
                    statlines[pid]['Points'] += pts
                # credit assist if present
                apid = extract_assist_player(p['description'])
                if apid and apid in statlines:
                    statlines[apid]['Assists'] += 1
            # Simple parsing for turnovers/steals/blocks/rebounds (optional minimal)
            desc = p['description']
            if 'Turnover' in desc:
                nm = extract_player(desc)
                pid = resolve_player_id(nm)
                if pid and pid in statlines:
                    statlines[pid]['Turnovers'] += 1
            if 'STEAL' in desc:
                nm = extract_player(desc)
                pid = resolve_player_id(nm)
                if pid and pid in statlines:
                    statlines[pid]['Steals'] += 1
            if 'BLOCK' in desc and 'BLOCK (' in desc:
                nm = extract_player(desc)
                pid = resolve_player_id(nm)
                if pid and pid in statlines:
                    statlines[pid]['Blocks'] += 1
            if 'REBOUND' in desc:
                nm = extract_player(desc)
                pid = resolve_player_id(nm)
                if pid and pid in statlines:
                    statlines[pid]['Rebounds'] += 1

        return {
            'GameID': self._mock_game_id,
            'Players': list(statlines.values())
        }
    
    def _get_mock_play_by_play(self, game_id):
        script = self._q1_play_script
        current = self._compute_mock_q1_state()
        current_remaining = current['TimeRemainingMinutes'] * 60 + current['TimeRemainingSeconds']
        emitted = []
        home_score = 0
        away_score = 0
        for idx, p in enumerate(script, start=1):
            pts = p['points']
            if p['team'] == self._mock_home:
                home_score += pts
            elif p['team'] == self._mock_away:
                away_score += pts
            emitted.append({
                'PlayID': idx,
                'Period': 1,
                'Clock': p['clock'],
                'Description': p['description'],
                'Team': p['team'],
                'Category': 'Shot' if pts > 0 else ('Turnover' if 'Turnover' in p['description'] else 'Rebound' if 'REBOUND' in p['description'] else 'Period'),
                'Type': 'FieldGoalMade' if pts in (2, 3) else ('FreeThrowMade' if pts == 1 else ('FieldGoalMissed' if 'MISS' in p['description'] else 'None')),
                'Points': pts,
                'ShotMade': pts > 0,
                'HomeTeamScore': home_score,
                'AwayTeamScore': away_score,
            })
        logger.info(f"Mock PBP: emitted={len(emitted)} first_clock={emitted[0]['Clock'] if emitted else 'n/a'} last_clock={emitted[-1]['Clock'] if emitted else 'n/a'}")
        return emitted

    def _compute_mock_q1_state(self):
        elapsed = max(0, int((datetime.now() - self._mock_game_start).total_seconds()))
        total_q_seconds = 12 * 60
        if elapsed >= total_q_seconds:
            remaining = 0
        else:
            remaining = total_q_seconds - elapsed
        rem_m = remaining // 60
        rem_s = remaining % 60
        home = 0
        away = 0
        for p in self._q1_play_script:
            # Score plays that have already happened (time elapsed past their clock time)
            if p['seconds_remaining'] > remaining and p['points'] > 0:
                if p['team'] == self._mock_home:
                    home += p['points']
                elif p['team'] == self._mock_away:
                    away += p['points']
        return {
            'TimeRemainingMinutes': rem_m,
            'TimeRemainingSeconds': rem_s,
            'HomeTeamScore': home,
            'AwayTeamScore': away
        }

    def reset_mock_timer(self):
        """Reset the mock game's internal clock to start from Q1 12:00 now."""
        self._mock_game_start = datetime.now()
        return {
            'reset_at': self._mock_game_start.isoformat()
        }

    def _build_q1_mock_script(self):
        # Player name to team mapping for inference in Q1
        por_players = {
            'Thybulle', 'Camara', 'Banton', 'Clingan', 'Murray', 'Rupert', 'Walker', 'Cissoko', 'Minaya'
        }
        lal_players = {
            'James', 'Milton', 'Morris', 'Knecht', 'Len', 'Goodwin', 'Koloko', 'Jemison'
        }

        def infer_team(desc: str) -> str:
            up = desc.upper()
            if 'TRAIL BLAZERS' in up or ' POR' in up or '(POR' in desc:
                return self._mock_home
            if 'LAKERS' in up or ' LAL' in up or '(LAL' in desc:
                return self._mock_away
            # Name-based inference
            for name in por_players:
                if name in desc:
                    return self._mock_home
            for name in lal_players:
                if name in desc:
                    return self._mock_away
            return self._mock_home  # default neutral events to home for non-scoring

        def infer_points(desc: str) -> int:
            text = desc.lower()
            if 'miss' in text:
                return 0
            if 'free throw' in text:
                return 1 if 'miss' not in text else 0
            # Only treat explicit 3PT mentions as three-pointers (avoid matching distances like 3')
            if '3pt' in text or ' 3-pt' in text or ' 3 pt' in text:
                return 3
            if 'dunk' in text or 'layup' in text or 'jump shot' in text or 'hook' in text:
                return 2
            return 0

        # Full Q1 events (clock, description). Non-scoring events included with 0 points by inference.
        q1_events = [
            ('12:00', 'Q1 start'),
            ('11:45', 'Jump Ball Clingan vs. Len: Tip to Camara'),
            ('11:43', "MISS Thybulle 6' Driving Layup"),
            ('11:25', 'Lakers Rebound'),
            ('11:23', "MISS Knecht 27' 3PT Jump Shot"),
            ('11:05', 'Clingan REBOUND (Off:0 Def:1)'),
            ('10:40', "Camara 27' 3PT Pullup Jump Shot (3 PTS) (Clingan 1 AST)"),
            ('10:40', 'James Bad Pass Turnover (P1.T1)'),
            ('10:34', 'Banton STEAL (1 STL)'),
            ('10:13', "Banton 7' Running Layup (2 PTS)"),
            ('10:11', "MISS Milton 10' Driving Floating Jump Shot"),
            ('10:11', 'Milton REBOUND (Off:1 Def:0)'),
            ('10:11', "MISS Milton 4' Tip Layup Shot"),
            ('10:10', 'Murray BLOCK (1 BLK)'),
            ('10:02', 'Camara REBOUND (Off:0 Def:1)'),
            ('09:48', 'Thybulle Out of Bounds Lost Ball Turnover (P1.T1)'),
            ('09:38', 'Knecht Traveling Turnover (P1.T2)'),
            ('09:38', "MISS Murray 6' Driving Layup"),
            ('09:36', 'Knecht BLOCK (1 BLK)'),
            ('09:36', 'Knecht REBOUND (Off:0 Def:1)'),
            ('09:25', "MISS James 13' Pullup Jump Shot"),
            ('09:23', 'Banton REBOUND (Off:0 Def:1)'),
            ('09:16', "Clingan 2' Running Layup (2 PTS) (Banton 1 AST)"),
            ('09:16', 'Morris S.FOUL (P1.T1) (E.Scott)'),
            ('09:16', 'MISS Clingan Free Throw 1 of 1'),
            ('09:14', 'TRAIL BLAZERS Rebound'),
            ('09:14', 'TRAIL BLAZERS Timeout: Regular (Full 1 Short 0)'),
            ('09:11', "Murray 4' Driving Dunk (2 PTS)"),
            ('08:50', "Morris 18' Jump Shot (2 PTS) (James 1 AST)"),
            ('08:41', "MISS Thybulle 6' Driving Layup"),
            ('08:39', 'Thybulle REBOUND (Off:1 Def:0)'),
            ('08:37', "Thybulle 5' Hook Shot (2 PTS)"),
            ('08:37', 'Len S.FOUL (P1.T2) (N.Buchert)'),
            ('08:36', 'MISS Thybulle Free Throw 1 of 1'),
            ('08:19', "MISS Len 27' 3PT Jump Bank Shot"),
            ('08:17', 'Murray REBOUND (Off:0 Def:1)'),
            ('07:55', "MISS Murray 6' Driving Bank Hook Shot"),
            ('07:53', 'TRAIL BLAZERS Rebound'),
            ('07:53', 'Morris L.B.FOUL (P2.T3) (E.Scott)'),
            ('07:44', 'Len S.FOUL (P2.T4) (D.Guthrie)'),
            ('07:44', 'MISS Thybulle Free Throw 1 of 2'),
            ('07:44', 'TRAIL BLAZERS Rebound'),
            ('07:44', 'MISS Thybulle Free Throw 2 of 2'),
            ('07:43', 'Knecht REBOUND (Off:0 Def:2)'),
            ('07:29', "MISS James 29' 3PT Pullup Jump Shot"),
            ('07:27', 'Murray REBOUND (Off:0 Def:2)'),
            ('07:22', "Murray 6' Running Layup (4 PTS)"),
            ('07:12', 'Banton P.FOUL (P1.T1) (D.Guthrie)'),
            ('07:06', "Morris 12' Pullup Jump Shot (4 PTS)"),
            ('06:45', "MISS Thybulle 27' 3PT Jump Shot"),
            ('06:38', 'James REBOUND (Off:0 Def:1)'),
            ('06:33', 'Clingan S.FOUL (P1.T2) (N.Buchert)'),
            ('06:33', 'Knecht Free Throw 1 of 2 (1 PTS)'),
            ('06:33', 'Knecht Free Throw 2 of 2 (2 PTS)'),
            ('06:33', 'SUB: Rupert FOR Thybulle'),
            ('06:33', 'SUB: Goodwin FOR James'),
            ('06:21', "MISS Banton 6' Driving Layup"),
            ('06:18', 'Banton REBOUND (Off:1 Def:1)'),
            ('06:16', 'Banton Bad Pass Turnover (P1.T2)'),
            ('06:16', 'Goodwin STEAL (1 STL)'),
            ('06:08', "Milton 27' 3PT Running Jump Shot (3 PTS) (Morris 1 AST)"),
            ('05:52', "MISS Banton 27' 3PT Pullup Jump Shot"),
            ('05:49', 'Clingan REBOUND (Off:1 Def:1)'),
            ('05:47', "MISS Clingan 6' Putback Layup"),
            ('05:47', 'Murray REBOUND (Off:1 Def:2)'),
            ('05:46', "MISS Murray 2' Tip Layup Shot"),
            ('05:46', 'Murray REBOUND (Off:2 Def:2)'),
            ('05:46', "MISS Murray 2' Tip Layup Shot"),
            ('05:44', 'Murray REBOUND (Off:3 Def:2)'),
            ('05:41', 'Len S.FOUL (P3.PN) (N.Buchert)'),
            ('05:41', 'MISS Clingan Free Throw 1 of 2'),
            ('05:41', 'TRAIL BLAZERS Rebound'),
            ('05:41', 'SUB: Koloko FOR Len'),
            ('05:40', 'MISS Clingan Free Throw 2 of 2'),
            ('05:27', "Knecht 28' 3PT Jump Shot (5 PTS) (Milton 1 AST)"),
            ('05:05', "Banton 27' 3PT Jump Shot (5 PTS) (Camara 1 AST)"),
            ('05:01', 'Foul : Double Personal - Clingan (2 PF), Koloko (1 PF) (D.Guthrie)'),
            ('04:55', "MISS Milton 31' 3PT Pullup Jump Shot"),
            ('04:53', 'Rupert REBOUND (Off:0 Def:1)'),
            ('04:44', "Murray 27' 3PT Running Jump Shot (7 PTS) (Rupert 1 AST)"),
            ('04:23', "MISS Goodwin 19' Pullup Jump Shot"),
            ('04:20', 'Knecht REBOUND (Off:1 Def:3)'),
            ('04:11', 'Camara P.FOUL (P1.T3) (D.Guthrie)'),
            ('04:02', 'Rupert S.FOUL (P1.T4) (N.Buchert)'),
            ('04:02', 'Milton Free Throw 1 of 2 (4 PTS)'),
            ('04:02', 'Milton Free Throw 2 of 2 (5 PTS)'),
            ('03:54', 'Banton Out of Bounds - Bad Pass Turnover Turnover (P2.T3)'),
            ('03:54', 'SUB: Cissoko FOR Camara'),
            ('03:35', "MISS Knecht 12' Pullup Jump Shot"),
            ('03:32', 'Lakers Rebound'),
            ('03:32', 'Rupert L.B.FOUL (P2.PN) (D.Guthrie)'),
            ('03:32', 'MISS Koloko Free Throw 1 of 2'),
            ('03:32', 'Lakers Rebound'),
            ('03:32', 'MISS Koloko Free Throw 2 of 2'),
            ('03:31', 'Clingan REBOUND (Off:1 Def:2)'),
            ('03:14', "Banton 6' Driving Layup (7 PTS)"),
            ('02:48', "Goodwin 31' 3PT Jump Shot (3 PTS) (Jemison III 1 AST)"),
            ('02:36', "MISS Banton 27' 3PT Pullup Jump Shot"),
            ('02:33', 'Koloko REBOUND (Off:0 Def:1)'),
            ('02:27', "MISS Knecht 27' 3PT Running Jump Shot"),
            ('02:24', 'Koloko REBOUND (Off:1 Def:1)'),
            ('02:23', "MISS Koloko 3' Putback Layup"),
            ('02:21', 'Rupert REBOUND (Off:0 Def:2)'),
            ('02:14', "MISS Murray 26' 3PT Pullup Jump Shot"),
            ('02:12', 'Goodwin REBOUND (Off:0 Def:1)'),
            ('02:04', "MISS Knecht 27' 3PT Jump Shot"),
            ('02:01', 'Clingan REBOUND (Off:1 Def:3)'),
            ('01:49', 'MISS Banton 3PT Jump Shot'),
            ('01:47', 'Clingan REBOUND (Off:2 Def:3)'),
            ('01:46', "Clingan 3' Putback Layup (4 PTS)"),
            ('01:45', 'Lakers Timeout: Regular (Reg.1 Short 0)'),
            ('01:45', 'SUB: Minaya FOR Banton'),
            ('01:45', 'SUB: Walker FOR Clingan'),
            ('01:45', 'SUB: James FOR Milton'),
            ('01:43', 'Goodwin Bad Pass Turnover (P1.T3)'),
            ('01:40', 'Goodwin Violation:Kicked Ball (N.Buchert)'),
            ('01:33', 'Minaya Bad Pass Turnover (P1.T4)'),
            ('01:33', 'Koloko STEAL (1 STL)'),
            ('01:18', 'Knecht 3PT Jump Shot (8 PTS) (James 2 AST)'),
            ('01:05', 'Koloko S.FOUL (P2.PN) (N.Buchert)'),
            ('01:05', 'MISS Murray Free Throw 1 of 2'),
            ('01:05', 'TRAIL BLAZERS Rebound'),
            ('01:05', 'Murray Free Throw 2 of 2 (8 PTS)'),
            ('00:53', "Koloko 4' Cutting Dunk Shot (2 PTS) (James 3 AST)"),
            ('00:40', "Rupert 26' 3PT Jump Shot (3 PTS) (Cissoko 1 AST)"),
            ('00:24', "Goodwin 24' 3PT Jump Shot (6 PTS) (James 4 AST)"),
            ('00:00', 'Koloko S.FOUL (P3.PN) (D.Guthrie)'),
            ('00:00', 'Walker Free Throw 1 of 2 (1 PTS)'),
            ('00:00', 'Walker Free Throw 2 of 2 (2 PTS)'),
        ]

        script = []
        for clock, desc in q1_events:
            m, s = clock.split(':')
            seconds_remaining = int(m) * 60 + int(s)
            team = infer_team(desc)
            pts = infer_points(desc)
            script.append({
                'clock': clock,
                'seconds_remaining': seconds_remaining,
                'description': desc,
                'team': team,
                'points': pts,
            })
        return script
