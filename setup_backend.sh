#!/bin/bash
# -------------------------------------------
# 🧩 Setup script for Web3 No-Code Backend
# -------------------------------------------

PROJECT_NAME="web3_nocode_backend"

echo "🚀 Creating project structure for $PROJECT_NAME..."

# Create root folder
mkdir -p $PROJECT_NAME/app/{core,db/models,api,services}
cd $PROJECT_NAME

# -----------------------------
# Create core configuration files
# -----------------------------
cat > app/core/config.py << 'EOF'
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "web3_nocode")
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

settings = Settings()
EOF

cat > app/core/redis_client.py << 'EOF'
import redis
from app.core.config import settings

redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)
EOF

# -----------------------------
# MongoDB Initialization
# -----------------------------
cat > app/db/init_db.py << 'EOF'
import motor.motor_asyncio
from beanie import init_beanie
from app.db.models.user import User
from app.db.models.template import Template
from app.db.models.build import Build
from app.db.models.deployment import Deployment
from app.db.models.event import Event
from app.core.config import settings

async def init_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGO_DB_NAME]
    await init_beanie(database=db, document_models=[User, Template, Build, Deployment, Event])
EOF

# -----------------------------
# Sample Models
# -----------------------------
cat > app/db/models/user.py << 'EOF'
from beanie import Document
from datetime import datetime

class User(Document):
    email: str | None
    siwe_address: str | None
    plan: str = "free"
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"
EOF

cat > app/db/models/template.py << 'EOF'
from beanie import Document
from datetime import datetime
from typing import Dict

class Template(Document):
    name: str
    category: str
    version: str
    schema: Dict
    audited: bool = False
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "templates"
EOF

cat > app/db/models/build.py << 'EOF'
from beanie import Document
from datetime import datetime
from typing import Dict

class Build(Document):
    template_id: str
    user_id: str
    params: Dict
    status: str = "pending"
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "builds"
EOF

cat > app/db/models/deployment.py << 'EOF'
from beanie import Document
from datetime import datetime

class Deployment(Document):
    project_id: str
    user_id: str
    build_id: str
    chain: str
    tx_hash: str | None = None
    contract_address: str | None = None
    status: str = "created"
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "deployments"
EOF

cat > app/db/models/event.py << 'EOF'
from beanie import Document
from datetime import datetime
from typing import Dict

class Event(Document):
    deployment_id: str
    event_name: str
    args: Dict
    block_number: int
    tx_hash: str
    timestamp: datetime = datetime.utcnow()

    class Settings:
        name = "events"
EOF

# -----------------------------
# Sample API routes
# -----------------------------
cat > app/api/routes_auth.py << 'EOF'
from fastapi import APIRouter

router = APIRouter()

@router.get("/ping")
async def ping():
    return {"status": "Auth API active"}
EOF

cat > app/api/routes_templates.py << 'EOF'
from fastapi import APIRouter
from app.db.models.template import Template

router = APIRouter()

@router.get("/")
async def get_templates():
    templates = await Template.find_all().to_list()
    return templates
EOF

# -----------------------------
# Main entry point
# -----------------------------
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from app.db.init_db import init_db
from app.api import routes_auth, routes_templates

app = FastAPI(title="NoCode Web3 Backend", version="0.1.0")

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(routes_auth.router, prefix="/auth", tags=["Auth"])
app.include_router(routes_templates.router, prefix="/templates", tags=["Templates"])

@app.get("/")
async def root():
    return {"message": "🚀 Web3 No-Code Backend running locally"}
EOF

# -----------------------------
# Env file
# -----------------------------
cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017
MONGO_DB_NAME=web3_nocode
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
EOF

# -----------------------------
# Requirements file
# -----------------------------
cat > requirements.txt << 'EOF'
fastapi
uvicorn
motor
beanie
redis
python-dotenv
web3
pydantic[email]
EOF

# -----------------------------
# Run script
# -----------------------------
cat > run.sh << 'EOF'
#!/bin/bash
uvicorn app.main:app --reload
EOF
chmod +x run.sh

echo "✅ Project structure created successfully!"
echo "👉 Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. python3 -m venv venv && source venv/bin/activate"
echo "3. pip install -r requirements.txt"
echo "4. ./run.sh"
