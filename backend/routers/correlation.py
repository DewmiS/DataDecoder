from fastapi import APIRouter, HTTPException
import pandas as pd
from pydantic import BaseModel
from backend.state import session_store
from sklearn.preprocessing import LabelEncoder


router = APIRouter()
le = LabelEncoder()

class SessionRequest(BaseModel):
  session_id: str

@router.post("/correlation")
async def get_correlation(request: SessionRequest):
  session_id = request.session_id

  if session_id not in session_store:
      raise HTTPException(status_code=400, detail="session code not found")

  df = session_store[session_id]
  df_processed = df.copy()

  import pandas as pd

  for col in df_processed.columns:
      if pd.api.types.is_numeric_dtype(df_processed[col]):
          df_processed[col] = df_processed[col].fillna(df_processed[col].mean())
      else:
          df_processed[col] = df_processed[col].fillna(df_processed[col].mode()[0])

  encoded_columns = []
  for col in df_processed.select_dtypes(include="object").columns:
      df_processed[col] = le.fit_transform(df_processed[col])
      encoded_columns.append(col)

  df_numeric = df_processed.select_dtypes(include="number")

  if df_numeric.shape[1] < 2:
      raise HTTPException(
          status_code=400,
          detail="Not enough valid columns for correlation"
      )

  pearson_corr = df_numeric.corr().to_dict()
  spearman_corr = df_numeric.corr(method="spearman").to_dict()

  return {
      "rows": df.shape[0],
      "columns": df.shape[1],
      "column_names": df.columns.to_list(),
      "encoded_columns": encoded_columns,
      "final_column_count": df_numeric.shape[1],
      "pearson": pearson_corr,
      "spearman": spearman_corr
  }

   