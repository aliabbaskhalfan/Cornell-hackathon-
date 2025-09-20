from celery import Celery
from config import Config
import logging

logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery('sports_commentator')

# Configure Celery
celery_app.conf.update(
    broker_url=Config.REDIS_URL,
    result_backend=Config.REDIS_URL,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Import tasks
from tasks import data_ingestion_tasks, commentary_tasks

# Register tasks
celery_app.register_task(data_ingestion_tasks.poll_scoreboard)
celery_app.register_task(data_ingestion_tasks.poll_game_updates)
celery_app.register_task(commentary_tasks.generate_commentary_task)
