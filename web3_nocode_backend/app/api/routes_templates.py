from fastapi import APIRouter
from app.db.models.template import Template

router = APIRouter()

@router.get("/")
async def get_templates():
    templates = await Template.find_all().to_list()
    return templates
