import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans


def get_clusters(df):

  df_processed = df.copy()
  id_columns = [col for col in df_processed.columns if col.lower() == "id"]
  df_processed = df_processed.drop(columns=id_columns)

  for col in df_processed.columns:
    if pd.api.types.is_numeric_dtype(df_processed[col]):
      df_processed[col] = df_processed[col].fillna(df_processed[col].mean())

  df_numeric = df_processed.select_dtypes(include="number")

  if df_numeric.shape[1] < 2:
    raise ValueError("Not enough valid columns for clustering")
  
  scaler = StandardScaler()
  scaled = scaler.fit_transform(df_numeric)

  inertia_scores = []
  for k in range(2,11):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(scaled)
    inertia_scores.append(km.inertia_)

  drops = []
  for i in range(len(inertia_scores)-1):
    drops.append(inertia_scores[i] - inertia_scores[i+1])
    
  best_k = drops.index(max(drops)) + 2

  km = KMeans(n_clusters=best_k, random_state=42)
  km.fit(scaled)
  df_numeric["cluster"] = km.labels_
  cluster_summary = df_numeric.groupby("cluster").mean()
  cluster_sizes = {
    int(k): int(v)
    for k, v in df_numeric["cluster"].value_counts().items()
  }
  
  return{
    "best k" : best_k,
    "cluster_summary" : cluster_summary.to_dict(),
    "cluster_sizes": cluster_sizes
  }
