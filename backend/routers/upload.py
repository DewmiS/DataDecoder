from fastapi import APIRouter, UploadFile, File, HTTPException
import io
import pandas as pd
from backend.state import session_store
import uuid
import math

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile=File(...)):
  session_id = str(uuid.uuid4())
  if not file.filename.endswith(".csv"): # type: ignore
    raise HTTPException(status_code=400, detail="Only CSV files are accepted")
  
  content = await file.read()

  if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")
  
  try:
      df = pd.read_csv(io.BytesIO(content), na_values=['?', 'NA', 'N/A', 'na', 'n/a', ''])
  except Exception:
      raise HTTPException(status_code=400, detail="Could not parse CSV. Check the file format")
  
  def clean_nan(data):
    if isinstance(data, dict):
        return {k: clean_nan(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_nan(v) for v in data]
    elif isinstance(data, float) and math.isnan(data):
        return None
    return data

  rows, cols = df.shape
  preview = clean_nan(df.head(5).to_dict(orient="records"))
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
      "session_id": session_id,
      "preview": preview
  }



