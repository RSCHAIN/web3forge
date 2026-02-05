from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.init_db import init_db
from app.api import routes_auth, routes_templates, routes_deployment, routes_dashboard
from app.config.networks_init import init_networks
from app.config.networks import NETWORKS




app = FastAPI(title="NoCode Web3 Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ton frontend
    allow_credentials=True,
    allow_methods=["*"],  # autorise POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    init_networks()
    print("NETWORKS:", list(NETWORKS.keys()))
    await init_db()

app.include_router(routes_auth.router, prefix="/auth", tags=["Auth"])
app.include_router(routes_templates.router, prefix="/templates", tags=["Templates"])
app.include_router(routes_deployment.router, prefix="/deploy", tags=["deployment"])
app.include_router(routes_dashboard.router, prefix="/dashboard", tags=["Dashboard"])

@app.get("/")
async def root():
    return {"message": "🚀 Web3 No-Code Backend running locally"}
