import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score


def get_clusters(df):

    '''
    This function takes a DataFrame as input and returns the best number of clusters
    for the data using the K-Means algorithm.

    Steps performed:
    1. Drops ID-like columns
    2. Fills missing values
    3. Encodes categorical variables
    4. Scales numerical variables
    5. Finds the best number of clusters using the silhouette score
            Determine separation quality
            strong  ≥ 0.50  → clear, well-separated clusters
            decent  ≥ 0.25  → reasonable groupings
            soft    ≥ 0.10  → weak but usable broad patterns
            skipped <  0.10 → no structure at all, not worth reporting
    6. Returns the cluster summary and cluster sizes
    '''

    df_processed = df.copy().reset_index(drop=True)

    # Drop ID-like columns
    drop_cols = [col for col in df_processed.columns if col.lower() in ["id", "employeecount", "standardhours", "over18"]]
    df_processed.drop(columns=drop_cols, inplace=True)

    # Fill missing values
    for col in df_processed.columns:
        if pd.api.types.is_numeric_dtype(df_processed[col]):
            df_processed[col] = df_processed[col].fillna(df_processed[col].mean())
        else:
            df_processed[col] = df_processed[col].fillna(df_processed[col].mode()[0])

    # Encode categoricals
    object_cols = df_processed.select_dtypes(include="object").columns.tolist()
    encoded_columns = []

    for col in object_cols:
        if col not in df_processed.columns:
            continue

        n_unique = df_processed[col].nunique()

        if n_unique <= 10:
            dummies = pd.get_dummies(df_processed[col], prefix=col, dtype=int)
            df_processed = pd.concat([df_processed.drop(columns=[col]), dummies], axis=1).reset_index(drop=True)
            encoded_columns.append({"column": col, "method": "one-hot", "new_columns": n_unique})

        elif n_unique <= 50:
            freq_map = df_processed[col].value_counts(normalize=True)
            df_processed[col] = df_processed[col].map(freq_map).astype(float)
            encoded_columns.append({"column": col, "method": "frequency", "unique_values": n_unique})

        else:
            df_processed.drop(columns=[col], inplace=True)
            encoded_columns.append({"column": col, "method": "dropped", "reason": "too many unique values"})

    df_numeric = df_processed.select_dtypes(include="number").copy()

    if df_numeric.shape[1] < 2:
        return {"status": "skipped", "reason": "Not enough usable columns for clustering after encoding"}

    if len(df_numeric) < 3:
        return {"status": "skipped", "reason": "Not enough data points for meaningful clustering"}

    if df_numeric.var().mean() < 1e-6:
        return {"status": "skipped", "reason": "Data has near-zero variance — no structure to cluster"}

    scaler = StandardScaler()
    scaled = scaler.fit_transform(df_numeric)

    # Find best K via silhouette
    max_k = min(11, len(df_numeric))
    silhouette_scores = []

    for k in range(2, max_k):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(scaled)
        silhouette_scores.append(silhouette_score(scaled, labels))

    best_k = silhouette_scores.index(max(silhouette_scores)) + 2
    best_score = round(max(silhouette_scores), 4)

    if best_score < 0.08:
        return {
            "status": "skipped",
            "reason": "No discernible structure found in this dataset (silhouette < 0.10)"
        }

    if best_score >= 0.50:
        separation = "strong"
        caveat = None
    elif best_score >= 0.25:
        separation = "decent"
        caveat = "Clusters are reasonably separated but boundaries overlap in some areas."
    else:
        separation = "soft"
        caveat = (
            "Silhouette score is low — the data does not form tight natural clusters. "
            "Treat these groupings as broad tendencies, not hard segments."
        )

    km_final = KMeans(n_clusters=best_k, random_state=42, n_init=10)
    cluster_labels = km_final.fit_predict(scaled)
    df_numeric["cluster"] = cluster_labels

    cluster_summary = (
        df_numeric.groupby("cluster")
        .mean()
        .round(4)
        .to_dict(orient="index")
    )

    cluster_sizes = {
        int(k): int(v)
        for k, v in df_numeric["cluster"].value_counts().sort_index().items()
    }

    result = {
        "status": "success" if separation == "strong" else "soft",
        "best_k": best_k,
        "silhouette_score": best_score,
        "separation": separation,
        "encoded_columns": encoded_columns,
        "cluster_summary": cluster_summary,
        "cluster_sizes": cluster_sizes,
    }

    if caveat:
        result["caveat"] = caveat

    return result