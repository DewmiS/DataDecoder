from backend.state import session_store
from backend.services.profileService import run_profile
from backend.services.correlationService import get_correlation
from backend.services.clusterService import get_clusters
from backend.services.aiService import call_ai
from backend.services.promptService import build_prompt


def run_explain(session_id, target):

    if session_id not in session_store:
        raise Exception("session not found")

    df = session_store[session_id]["df"]

    if target and target in df.columns:
        mode = "ml"
    else:
        mode = "eda"
        target = None

    try:
        profile = run_profile(df)
    except Exception as e:
        print(f"Profiling failed: {e}")
        profile = {
            "rows": len(df),
            "columns": len(df.columns),
            "numeric_column_count": len(df.select_dtypes(include='number').columns),
            "column_name": list(df.columns),
            "column_details": [{"error": f"Profiling failed"}],
            "status": "error"
        }

    try:
        if mode == "ml":
            correlation = get_correlation(df, target)
            top_features = correlation.get("feature_importance", {})
            pearson = correlation.get("pearson", {}) 
            spearman = correlation.get("spearman", {}) 
        else:
            correlation = get_correlation(df, None)  
            top_features = {}
            pearson = correlation.get("pearson", {})
            spearman = correlation.get("spearman", {})
    except Exception as e:
        print(f"Correlation failed: {e}")
        top_features = {}
        pearson = {}
        spearman = {}

    try:
        clusters = get_clusters(df)
    except Exception as e:
        print(f"Clustering failed: {e}")
        clusters = {
            "status": "skipped",
            "reason": "Clustering failed"
        }

    summary = {
        "rows": profile["rows"],
        "columns": profile["columns"],
        "numeric_columns": profile["numeric_column_count"],
        "mode": mode,
        "target": target,
        "top_features": top_features,
        "clusters": clusters,
        "pearson": pearson,
        "spearman": spearman
    }

    try:
        prompt = build_prompt(summary, profile)
        ai_text = call_ai(prompt)
    except Exception as e:
        print(f"AI generation failed: {e}")
        ai_text = f"We encountered an issue while generating the AI explanation: {e}. However, the core data analysis was partially completed. Please review the summary statistics and visualizations in the other tabs."

    session_store[session_id]["summary"] = summary
    session_store[session_id]["explanation"] = ai_text

    return {
        "summary": summary,
        "explanation": ai_text
    }