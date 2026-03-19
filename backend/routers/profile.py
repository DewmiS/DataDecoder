from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter()

@router.post("/profile")
async def profile(file: UploadFile=File(...)):
  if not file.filename.endswith(".csv"): #type:ignore
    raise HTTPException(status_code=400, detail="Only csv files are accepted.")
  content =await file.read()

  try:
    df = pd.read_csv(io.BytesIO(content))
  except Exception:
    raise HTTPException(status_code=400, detail="Could not parse CSV. Check the file format")
  
  rows, cols = df.shape
  columns = df.columns.to_list()
  column_details = []

  for col in columns:
    null_count = int((df[col].isnull().sum()))
    column = {
      col: str(df[col].dtype),
      "null_count": null_count,
      "null_percentage": round(((null_count)/rows)*100,2)
    }
    column_details.append(column)
    
  return{
    "fileName": file.filename,
    "rows": rows,
    "columns": cols,
    "column_name": df.columns.to_list(),
    "column_details": column_details
  }