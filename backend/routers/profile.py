from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.state import session_store
from backend.services.profileService import run_profile

router = APIRouter()

class SessionRequest(BaseModel):
    session_id: str

@router.post("/profile")
async def profile(request: SessionRequest):
    session_id = request.session_id

    if session_id not in session_store:
        raise HTTPException(status_code=400, detail="session code not found")

    df = session_store[session_id]["df"]
    return run_profile(df)