from fastapi import APIRouter, HTTPException
import pandas as pd
from pydantic import BaseModel
from backend.state import session_store

class sessionRequest(BaseModel):
  session_id : str

router = APIRouter()

@router.post("/profile")
async def profile(request: sessionRequest):
  session_id  = request.session_id    
  if session_id not in session_store:
    raise HTTPException(status_code=400, detail="session code not found")
  
  df = session_store[session_id]
  rows, cols = df.shape
  rows = int(rows)
  cols = int(cols)
  columns = df.columns.to_list()
  column_details = []
  numeric_count = 0

  for col in columns:
    null_count = int((df[col].isnull().sum()))
    null_percentage = round(((null_count)/rows)*100,2)

    column = {
        col: str(df[col].dtype),
        "null_count": null_count,
        "null_percentage": null_percentage,
        "high_null_warning": null_percentage>50
      }

    if pd.api.types.is_numeric_dtype(df[col]):
      numeric_count=numeric_count+1
      column["mean"] = round(float(df[col].mean()), 2)
      column["median"] = round(float(df[col].median()),2)
      column["min"] = round(float(df[col].min()),2)
      column["max"] = round(float(df[col].max()),2)

    column_details.append(column)

  return{
    "rows": rows,
    "columns": cols,
    "column_name": df.columns.to_list(),
    "column_details": column_details,
    "numeric_column_count": numeric_count
  }