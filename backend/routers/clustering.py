from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.state import session_store
from backend.services.clusterService import get_clusters

router = APIRouter()

class SessionRequest(BaseModel):
  session_id: str

@router.post("/clustering")
async def clusters(request: SessionRequest):
  session_id = request.session_id

  if session_id not in session_store:
    raise HTTPException(status_code=400, detail="session code not found")
  
  df = session_store[session_id]["df"]
  
  try:
      return get_clusters(df)
  except ValueError as e:
      raise HTTPException(status_code=400, detail=str(e))
