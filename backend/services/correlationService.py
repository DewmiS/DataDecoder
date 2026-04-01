import pandas as pd
import math
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from typing import Any, Dict, cast

import math
import numpy as np

def clean_data(data):
    ''' 
      Make the API response JSON-safe.
      FastAPI cannot return NaN/Inf in JSON.
    '''
    if isinstance(data, dict):
        return {k: clean_data(v) for k, v in data.items()}

    elif isinstance(data, list):
        return [clean_data(v) for v in data]

    elif isinstance(data, (np.integer, np.floating)):
        value = float(data)
        if math.isnan(value) or math.isinf(value):
            return None
        return value

    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
        return data

    return data


def get_correlation(df, target)-> Dict[str, Any]:

  '''
  Says this returns a dictionary
  '''

  df_processed = df.copy()

  id_columns = [col for col in df_processed.columns if col.lower() == "id"]
  df_processed = df_processed.drop(columns=id_columns)

  for col in df_processed.columns:
      if pd.api.types.is_numeric_dtype(df_processed[col]):
          df_processed[col] = df_processed[col].fillna(df_processed[col].mean())
      else:
          df_processed[col] = df_processed[col].fillna(df_processed[col].mode()[0])

  encoded_columns = []
  le = LabelEncoder()
  for col in df_processed.select_dtypes(include="object").columns:
      df_processed[col] = le.fit_transform(df_processed[col])
      encoded_columns.append(col)

  # keep Numeric data
  df_numeric = df_processed.select_dtypes(include="number")

  # Remove constant columns
  df_numeric = df_numeric.loc[:, df_numeric.nunique() > 1]

  if df_numeric.shape[1] < 2:
      return {
          "message": "Not enough numeric columns for correlation"
      }

  # Always compute correlation
  pearson_df = df_numeric.corr()
  pearson_df = pearson_df.replace([np.inf, -np.inf], np.nan)
  pearson_df = pearson_df.fillna(0)

  pearson_corr = pearson_df.to_dict()
  
  spearman_df = df_numeric.corr(method="spearman")
  spearman_df = spearman_df.replace([np.inf, -np.inf], np.nan)
  spearman_df = spearman_df.fillna(0)

  spearman_corr = spearman_df.to_dict()

  # EDA

  if not target:
      '''
      cast(type, value) = “pretend this value is this type”
      '''
      return cast(Dict[str, Any], clean_data({
            "mode": "eda",
            "rows": df.shape[0],
            "columns": df.shape[1],
            "column_names": df.columns.to_list(),
            "encoded_columns": encoded_columns,
            "final_column_count": df_numeric.shape[1],
            "pearson": pearson_corr,
            "spearman": spearman_corr
        }))

  # ML MODE 
  
  if target not in df_processed.columns:
      raise ValueError(f"Target column '{target}' not found")

  # Encode target if needed
  if not pd.api.types.is_numeric_dtype(df_processed[target]):
      df_processed[target] = LabelEncoder().fit_transform(df_processed[target])

  X = df_processed.drop(columns=[target]).select_dtypes(include="number")
  y = df_processed[target]

  model = RandomForestClassifier(n_estimators=100, random_state=42)
  model.fit(X, y)

  feature_importance = {
      col: round(float(imp), 4)
      for col, imp in zip(X.columns, model.feature_importances_)
  }

  feature_importance = dict(
      sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
  )

  return cast(Dict[str, Any], clean_data({
        "mode": "ml",
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": df.columns.to_list(),
        "encoded_columns": encoded_columns,
        "final_column_count": df_numeric.shape[1],
        "pearson": pearson_corr,
        "spearman": spearman_corr,
        "feature_importance": dict(list(feature_importance.items())[:5]),
    }))

   