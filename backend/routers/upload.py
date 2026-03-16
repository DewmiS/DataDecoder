from fastapi import APIRouter, UploadFile, File, HTTPException
import io
import pandas as pd

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile=File(...)):
  if not file.filename.endswith(".csv"): # type: ignore
    raise HTTPException(status_code=400, detail="Only CSV files are accepted")
  
  content = await file.read()

  if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")
  
  try:
      df = pd.read_csv(io.BytesIO(content))
  except Exception:
      raise HTTPException(status_code=400, detail="Could not parse CSV. Check the file format")

  rows, cols = df.shape

  return {
      "filename": file.filename,
      "rows": rows,
      "columns": cols,
      "column_names": df.columns.tolist()
  }



