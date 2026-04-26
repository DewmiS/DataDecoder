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

    profile = run_profile(df)

    if mode == "ml":
        correlation = get_correlation(df, target)
        top_features = correlation["feature_importance"]
    else:
        top_features = {}

    try:
        clusters = get_clusters(df)
    except Exception:
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
        "clusters": clusters
    }

    prompt = build_prompt(summary, profile)

    ai_text = call_ai(prompt)

    session_store[session_id]["summary"] = summary
    session_store[session_id]["explanation"] = ai_text

    return {
        "summary": summary,
        "explanation": ai_text
    }