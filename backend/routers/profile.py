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
    try:
        return run_profile(df)
    except Exception as e:
        print(f"Profile error: {e}")
        return {
            "rows": len(df),
            "columns": len(df.columns),
            "numeric_column_count": len(df.select_dtypes(include='number').columns),
            "column_name": list(df.columns),
            "column_details": [{"error": f"Profiling failed: {str(e)}"}],
            "status": "error"
        }