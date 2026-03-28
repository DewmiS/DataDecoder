from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.state import session_store
from backend.services.profileService import run_profile
from backend.services.correlationService import get_correlation
from backend.services.clusterService import get_clusters
import requests
import os
from dotenv import load_dotenv
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from fastapi.responses import FileResponse

load_dotenv()

router = APIRouter()

class SessionRequest(BaseModel):
    session_id: str
    target: str | None = None


def generate_pdf(text, file_path):
    doc = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        name="Title",
        parent=styles["Heading1"],
        alignment=TA_CENTER,
        spaceAfter=20
    )

    heading_style = ParagraphStyle(
        name="Heading",
        parent=styles["Heading2"],
        spaceBefore=20,
        spaceAfter=12
    )

    normal_style = styles["Normal"]
    content = []

    lines = text.split("\n")

    for line in lines:
        line = line.strip()
        line = line.replace("**", "").replace("##", "")

        if not line:
            content.append(Spacer(1, 10))
            continue

        if "data analysis report" in line.lower():
            content.append(Paragraph(line, title_style))

        elif line.startswith("#"):
            clean = line.replace("#", "").strip()
            content.append(Paragraph(clean, heading_style))

        elif line and line[0].isdigit() and "." in line:
            title = line.split(".", 1)[1].strip().upper()
            content.append(Paragraph(title, heading_style))

        elif line.startswith("*") or line.startswith("-") or line.startswith("•"):
            bullet = line.replace("*", "").replace("-", "").replace("•", "").strip()
            content.append(Paragraph(f"• {bullet}", normal_style))

        else:
            content.append(Paragraph(line, normal_style))

    doc.build(content)


@router.post("/explain")
async def explain(request: SessionRequest):
    session_id = request.session_id
    target = request.target

    if session_id not in session_store:
        raise HTTPException(status_code=400, detail="session code not found")

    df = session_store[session_id]["df"]

    if target and target in df.columns:
        mode = "ml"
    else:
        mode = "eda"

    profile = run_profile(df)

    if mode == "ml":
        correlation = get_correlation(df, target)
        top_features = correlation["feature_importance"]
    else:
        correlation = None
        top_features = {}

    numeric_cols = df.select_dtypes(include="number").shape[1]

    if numeric_cols >= 2:
        try:
            clusters_result = get_clusters(df)
        except:
            clusters_result = {
                "status": "skipped",
                "reason": "Clustering failed due to internal error"
            }
    else:
        clusters_result = {
            "status": "skipped",
            "reason": "Not enough numeric columns for clustering"
        }

    summary = {
        "rows": profile["rows"],
        "columns": profile["columns"],
        "numeric_columns": profile["numeric_column_count"],
        "mode": mode,
        "target": target if mode == "ml" else None,
        "top_features": top_features,
        "clusters": clusters_result   
    }

    if clusters_result.get("status") == "success":

      cluster_summary = clusters_result.get("cluster_summary")

      if isinstance(cluster_summary, dict):
          cluster_summary_text = "\n".join([
              f"Cluster {k}: {v}"
              for k, v in cluster_summary.items()
          ])
      else:
          cluster_summary_text = "No cluster summary available."

      cluster_text = f"""
Cluster Analysis:
Best k: {clusters_result.get('best_k', 'N/A')}

Cluster Sizes:
{clusters_result['cluster_sizes']}

Cluster Summary:
{cluster_summary_text}
"""
    else:
        cluster_text = f"""
Cluster Analysis:
Clustering was not applied.

Reason:
{clusters_result.get("reason")}
"""

    features_text = "\n".join(
        [f"- {k}: {v}" for k, v in summary["top_features"].items()]
    )

    column_names_text = ", ".join(profile["column_name"])

    column_details_text = "\n".join([
        f"- {list(col.keys())[0]} | type: {list(col.values())[0]}"
        for col in profile["column_details"]
    ])

    prompt = f"""
You are a professional data analyst.

Generate a structured data analysis report (not a conversation).

Format:
1. Dataset Overview
2. Key Features (only if applicable)
3. Cluster Analysis (only if applicable)
4. Key Insights
5. Conclusion

Dataset:
- Rows: {summary['rows']}
- Columns: {summary['columns']}
- Numeric columns: {summary['numeric_columns']}

Column Names:
{column_names_text}

Column Details:
{column_details_text}
"""

    if mode == "ml":
        prompt += f"""
Target Column:
{target}

Top Features:
{features_text}

Explain which features most influence the target variable.
"""
    else:
        prompt += """
No specific target column is provided.

Focus on:
- relationships between variables
- patterns
- general insights
"""

    if clusters_result.get("status") == "success":
        prompt += f"""
{cluster_text}
"""
    else:
        prompt += f"""
{cluster_text}
"""

    prompt += """
Instructions:
- Do NOT write conversational phrases
- Use professional report style with simple english 
- Explain the result like explaining to a person with no understanding of the feild
- Use bullet points where needed
- Always use exact column names
- Never say "Column 1", "Column 2"
"""

    api_key = os.getenv("OPENROUTER_API_KEY")

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "google/gemma-3-12b-it:free",
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }
        )

        result = response.json()

        if "choices" in result:
            ai_response_text = result["choices"][0]["message"]["content"]
        else:
            ai_response_text = "AI unavailable. Try again later."

        session_store[session_id]["summary"] = summary
        session_store[session_id]["explanation"] = ai_response_text

    except Exception as e:
        ai_response_text = f"AI explanation failed: {str(e)}"

    print(result if 'result' in locals() else "No response")

    return {
        "summary": summary,
        "explanation": ai_response_text
    }


@router.post("/report")
async def generate_report(request: SessionRequest):
    session_id = request.session_id

    if session_id not in session_store:
        raise HTTPException(status_code=400, detail="session not found")

    data = session_store[session_id]

    ai_text = data.get("explanation")

    if not ai_text:
        raise HTTPException(status_code=400, detail="Run /explain first")

    pdf_path = f"report_{session_id}.pdf"
    generate_pdf(ai_text, pdf_path)

    return FileResponse(
        path=pdf_path,
        filename="report.pdf",
        media_type="application/pdf"
    )