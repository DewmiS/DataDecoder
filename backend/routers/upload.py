from fastapi import APIRouter, UploadFile, File, HTTPException
import io
import pandas as pd
from backend.state import session_store
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile=File(...)):
  session_id = str(uuid.uuid4())
  if not file.filename.endswith(".csv"): # type: ignore
    raise HTTPException(status_code=400, detail="Only CSV files are accepted")
  
  content = await file.read()

  if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")
  
  try:
      df = pd.read_csv(io.BytesIO(content), na_values=['?', 'NA', 'N/A', 'na', 'n/a', ''])
  except Exception:
      raise HTTPException(status_code=400, detail="Could not parse CSV. Check the file format")

  rows, cols = df.shape
  session_store[session_id] = {
      "df": df,
      "summary": None,
      "explanation": None
  }

  return {
      "filename": file.filename,
      "rows": rows,
      "columns": cols,
      "column_names": df.columns.tolist(),
      "session_id": session_id
  }



