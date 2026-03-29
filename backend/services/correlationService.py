import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier

def get_correlation(df, target):
  le = LabelEncoder()

  df_processed = df.copy()
  id_columns = [col for col in df_processed.columns if col.lower() == "id"]
  df_processed = df_processed.drop(columns=id_columns)

  if target not in df.columns:
    raise ValueError(f"Target column '{target}' not found")

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
      raise ValueError("Not enough valid columns for correlation")
  
  # keep only numeric
  df_numeric = df_processed.select_dtypes(include="number")

  # remove constant columns
  df_numeric = df_numeric.loc[:, df_numeric.nunique() > 1]

  import math

  def clean_nan(data):
      if isinstance(data, dict):
          return {k: clean_nan(v) for k, v in data.items()}
      elif isinstance(data, list):
          return [clean_nan(v) for v in data]
      elif isinstance(data, float) and math.isnan(data):
          return None
      return data

  pearson_corr = clean_nan(df_numeric.corr().to_dict())
  spearman_corr = clean_nan(df_numeric.corr(method="spearman").to_dict())

  # Prepare X and y
  if not pd.api.types.is_numeric_dtype(df_processed[target]):
      df_processed[target] = LabelEncoder().fit_transform(df_processed[target])

  X = df_processed.drop(columns=[target])
  X = X.select_dtypes(include="number")

  y = df_processed[target]

  # Train model
  model = RandomForestClassifier(n_estimators=100, random_state=42)
  model.fit(X, y)

  # Feature importance
  importances = model.feature_importances_
  feature_importance = dict(zip(X.columns, importances))

  feature_importance = {
    col: round(float(imp), 4)
    for col, imp in zip(X.columns, importances)
  }

  feature_importance = dict(
      sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
  )

  top_5_features = dict(list(feature_importance.items())[:5])

  return {
      "rows": df.shape[0],
      "columns": df.shape[1],
      "column_names": df.columns.to_list(),
      "encoded_columns": encoded_columns,
      "final_column_count": df_numeric.shape[1],
      "pearson": pearson_corr,
      "spearman": spearman_corr,
      "feature_importance": top_5_features
  }


   