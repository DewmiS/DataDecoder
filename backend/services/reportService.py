from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from fastapi.responses import FileResponse
from backend.state import session_store
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf(text, file_path):

    from reportlab.lib.enums import TA_CENTER

    doc = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        name="Title",
        parent=styles["Heading1"],
        alignment=TA_CENTER,
        spaceAfter=20
    )

    section_style = ParagraphStyle(
        name="Section",
        parent=styles["Heading2"],
        spaceBefore=15,
        spaceAfter=10
    )

    bullet_style = ParagraphStyle(
        name="Bullet",
        parent=styles["Normal"],
        leftIndent=15,
        spaceAfter=5
    )

    normal_style = styles["Normal"]

    content = []

    lines = text.split("\n")

    for line in lines:
        line = line.strip()

        line = line.replace("**", "")

        if not line:
            content.append(Spacer(1, 10))
            continue

        if "data analysis report" in line.lower():
            content.append(Paragraph(line, title_style))

        elif line[0].isdigit() and "." in line:
            content.append(Paragraph(line, section_style))

        elif line.startswith("*") or line.startswith("-"):
            bullet = line.lstrip("*- ").strip()
            content.append(Paragraph(f"• {bullet}", bullet_style))

        else:
            content.append(Paragraph(line, normal_style))

    doc.build(content)

def generate_report_file(session_id):

    if session_id not in session_store:
        raise Exception("session not found")

    ai_text = session_store[session_id].get("explanation")

    if not ai_text:
        raise Exception("Run /explain first")

    file_path = f"report_{session_id}.pdf"

    generate_pdf(ai_text, file_path)

    return FileResponse(
        path=file_path,
        filename="report.pdf",
        media_type="application/pdf"
    )