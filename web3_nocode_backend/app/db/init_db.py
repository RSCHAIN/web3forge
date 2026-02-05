import motor.motor_asyncio
from beanie import init_beanie
from app.db.models.user import User
from app.db.models.template import Template
from app.db.models.build import Build
from app.db.models.deployment import Deployment, DeploymentRecord
from app.db.models.event import Event
from app.core.config import settings

async def init_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGO_DB_NAME]
    await init_beanie(database=db, document_models=[User, Template, Build, Deployment, Event])
