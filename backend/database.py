from pymongo import MongoClient
from config import Config
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.client = MongoClient(Config.MONGO_URI)
        self.db = self.client.sports_commentator
        
        # Collections
        self.users = self.db.users
        self.games = self.db.games
        self.events = self.db.events
        self.statlines = self.db.statlines
        self.commentary = self.db.commentary
        self.user_contexts = self.db.user_contexts
        
        self._create_indexes()
    
    def _create_indexes(self):
        """Create database indexes for performance"""
        try:
            # Games indexes
            self.games.create_index("game_id", unique=True)
            self.games.create_index("league")
            self.games.create_index("status")
            
            # Events indexes
            self.events.create_index([("game_id", 1), ("timestamp", 1)])
            self.events.create_index("type")
            
            # Statlines indexes
            self.statlines.create_index([("game_id", 1), ("player_id", 1)], unique=True)
            
            # Commentary indexes
            self.commentary.create_index([("game_id", 1), ("timestamp", 1)])
            self.commentary.create_index("persona")

            # User contexts indexes
            self.user_contexts.create_index("updated_at")
            
            # TTL indexes for automatic cleanup (drop existing first to avoid conflicts)
            try:
                self.games.drop_index("updated_at_1")
            except:
                pass  # Index doesn't exist, that's fine
            
            try:
                self.statlines.drop_index("updated_at_1")
            except:
                pass  # Index doesn't exist, that's fine
            
            self.games.create_index("updated_at", expireAfterSeconds=86400)  # 24 hours
            self.statlines.create_index("updated_at", expireAfterSeconds=86400)  # 24 hours
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")

# Global database instance
db = Database()
