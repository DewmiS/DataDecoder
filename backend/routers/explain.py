from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.state import session_store
from backend.services.profileService import run_profile
from backend.services.correlationService import get_correlation
from backend.services.clusterService import get_clusters
import requests
import os
from dotenv import load_dotenv
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from fastapi.responses import FileResponse

load_dotenv()

router = APIRouter()

class SessionRequest(BaseModel):
  session_id: str
  target: str

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
    line = line.replace("**", "")
    line = line.replace("##", "")

    if not line:
        content.append(Spacer(1, 10))
        continue

    if "data analysis report" in line.lower():
        content.append(Paragraph(line, title_style))

    elif line.startswith("#"):
        clean = line.replace("#", "").strip()
        content.append(Paragraph(clean, heading_style))

    elif line[0].isdigit() and "." in line:
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
  profile = run_profile(df)
  correlation = get_correlation(df, target)
  try:
      clusters = get_clusters(df)
  except:
      clusters = None

  summary = {
    "rows": profile["rows"],
    "columns": profile["columns"],
    "numeric_columns": profile["numeric_column_count"],
    "top_features": correlation["feature_importance"],
    "clusters": clusters
  }

  cluster_text = ""

  if clusters:
      cluster_text = f"""
        Cluster Analysis:
        {clusters}
        """
  else:
      cluster_text = "Cluster analysis was not applicable for this dataset."

  features_text = "\n".join(
      [f"- {k}: {v}" for k, v in summary["top_features"].items()]
  )

  prompt = f"""
  You are a professional data analyst.

  Generate a structured data analysis report (not a conversation).

  Use clear sections with headings.

  Format:

  1. Dataset Overview
  2. Key Features
  3. Cluster Analysis
  4. Key Insights
  5. Conclusion

  Dataset:
  - Rows: {summary['rows']}
  - Columns: {summary['columns']}
  - Numeric columns: {summary['numeric_columns']}

  Top Features:
  {features_text}

  Cluster Summary:
  {cluster_text}

  Instructions:
  - Do NOT write conversational phrases
  - Do NOT say "here is" or "let's"
  - Write in formal report style
  - Use headings and bullet points where appropriate
  - Keep it professional and concise
  - If clustering is not available, skip cluster analysis and focus on other insights.
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
              "model": "google/gemma-3-4b-it:free",
              "messages": [
                  {
                      "role": "user",
                      "content": prompt
                  }
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

  print(result)
    
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