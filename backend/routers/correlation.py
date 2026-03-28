from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.state import session_store
from backend.services.correlationService import get_correlation
router = APIRouter()

class SessionRequest(BaseModel):
    session_id: str
    target: str | None = None

@router.post("/correlation")
async def correlation(request: SessionRequest):
    session_id = request.session_id
    target = request.target

    if session_id not in session_store:
        raise HTTPException(status_code=400, detail="session code not found")

    df = session_store[session_id]["df"]

    if not target or target not in df.columns:
      return {
          "message": "No target column selected. Showing general correlations.",
          "correlation_matrix": df.select_dtypes(include="number").corr().to_dict()
      }
    
    try:
        return get_correlation(df, target)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))