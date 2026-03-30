from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.explainService import run_explain
from backend.services.reportService import generate_report_file

router = APIRouter()

class SessionRequest(BaseModel):
    session_id: str
    target: str | None = None


@router.post("/explain")
async def explain(request: SessionRequest):
    try:
        return run_explain(request.session_id, request.target)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report")
async def report(request: SessionRequest):
    try:
        return generate_report_file(request.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))