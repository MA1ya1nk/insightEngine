from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from datetime import datetime
import os

# Colors
NAVY      = HexColor("#0D1B2A")
TEAL      = HexColor("#0EA5E9")
LIGHT_BG  = HexColor("#F0F9FF")
GRAY      = HexColor("#64748B")
DARK      = HexColor("#1E293B")
WHITE     = HexColor("#FFFFFF")
GREEN     = HexColor("#10B981")

def clean_text(text: str) -> str:
    """Remove characters that break ReportLab on Windows."""
    if not text:
        return ""
    # Replace smart quotes and special chars
    replacements = {
        "\u2018": "'", "\u2019": "'",
        "\u201c": '"', "\u201d": '"',
        "\u2013": "-", "\u2014": "--",
        "\u2022": "*", "\u2026": "...",
        "\u00a0": " ",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Remove any remaining non-latin characters that reportlab cant handle
    return text.encode("latin-1", errors="replace").decode("latin-1")

def add_page_decorations(canvas_obj, doc):
    """Add header line and footer to every page."""
    canvas_obj.saveState()
    # Top teal line
    canvas_obj.setStrokeColor(TEAL)
    canvas_obj.setLineWidth(2)
    canvas_obj.line(0.75*inch, A4[1]-0.45*inch, A4[0]-0.75*inch, A4[1]-0.45*inch)
    # Footer text
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.setFillColor(GRAY)
    canvas_obj.drawCentredString(
        A4[0]/2, 0.4*inch,
        f"InsightEngine Research Report  |  Page {canvas_obj.getPageNumber()}"
    )
    canvas_obj.restoreState()

def generate_pdf(report_data: dict, output_path: str):
    """Generate a professional PDF report."""

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=1.0*inch,
        bottomMargin=0.85*inch,
    )

    styles = getSampleStyleSheet()

    # ── Custom Styles ──────────────────────────────────────
    body = ParagraphStyle(
        "Body", parent=styles["Normal"],
        fontSize=10, leading=16,
        textColor=DARK, alignment=TA_JUSTIFY,
        spaceAfter=8, fontName="Helvetica",
    )
    section_header = ParagraphStyle(
        "SectionHeader", parent=styles["Normal"],
        fontSize=12, leading=18,
        textColor=WHITE, fontName="Helvetica-Bold",
        leftIndent=0,
    )
    cite_style = ParagraphStyle(
        "Cite", parent=styles["Normal"],
        fontSize=8, leading=12,
        textColor=GRAY, fontName="Helvetica",
        spaceAfter=4, leftIndent=12,
    )
    meta_style = ParagraphStyle(
        "Meta", parent=styles["Normal"],
        fontSize=9, textColor=HexColor("#94A3B8"),
        alignment=TA_CENTER, fontName="Helvetica",
    )

    story = []

    # ── COVER BLOCK ────────────────────────────────────────
    topic = clean_text(report_data.get("topic", "Research Report"))
    date_str = datetime.utcnow().strftime("%B %d, %Y")

    cover_content = [
        [Paragraph("InsightEngine", ParagraphStyle("Brand", parent=styles["Normal"],
            fontSize=11, textColor=TEAL, fontName="Helvetica-Bold", alignment=TA_CENTER))],
        [Paragraph("AUTONOMOUS RESEARCH REPORT", ParagraphStyle("Sub", parent=styles["Normal"],
            fontSize=8, textColor=GRAY, fontName="Helvetica", alignment=TA_CENTER))],
        [Spacer(1, 24)],
        [Paragraph(topic, ParagraphStyle("CoverTitle", parent=styles["Normal"],
            fontSize=20, textColor=WHITE, fontName="Helvetica-Bold",
            alignment=TA_CENTER, leading=26))],
        [Spacer(1, 20)],
        [HRFlowable(width="50%", thickness=1, color=TEAL, hAlign="CENTER")],
        [Spacer(1, 16)],
        [Paragraph(f"Generated on {date_str}", meta_style)],
        [Paragraph("Powered by Multi-Agent AI  |  Groq LLaMA 3.3", meta_style)],
    ]

    cover_table = Table(cover_content, colWidths=[6.5*inch])
    cover_table.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), NAVY),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 20),
        ("RIGHTPADDING",  (0,0), (-1,-1), 20),
    ]))

    # Wrap in fixed-height container
    wrapper = Table([[cover_table]], colWidths=[6.5*inch], rowHeights=[320])
    wrapper.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), NAVY),
        ("VALIGN",     (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(wrapper)
    story.append(Spacer(1, 24))

    # ── TABLE OF CONTENTS ──────────────────────────────────
    plan = report_data.get("plan", {})
    if plan.get("sections"):
        toc_rows = [[
            Paragraph("TABLE OF CONTENTS", ParagraphStyle("TOCH", parent=styles["Normal"],
                fontSize=9, textColor=TEAL, fontName="Helvetica-Bold"))
        ]]
        for i, s in enumerate(plan["sections"], 1):
            toc_rows.append([
                Paragraph(f"  {i}.  {clean_text(s.get('title',''))}", ParagraphStyle("TOCI",
                    parent=styles["Normal"], fontSize=9, textColor=DARK, fontName="Helvetica"))
            ])
        toc = Table(toc_rows, colWidths=[6.3*inch])
        toc.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),  (0,0),  HexColor("#E0F2FE")),
            ("BACKGROUND",    (0,1),  (-1,-1), HexColor("#F8FAFC")),
            ("TOPPADDING",    (0,0),  (-1,-1), 5),
            ("BOTTOMPADDING", (0,0),  (-1,-1), 5),
            ("LEFTPADDING",   (0,0),  (-1,-1), 10),
            ("BOX",           (0,0),  (-1,-1), 0.5, HexColor("#CBD5E1")),
            ("LINEBELOW",     (0,0),  (0,0),   1,   TEAL),
        ]))
        story.append(toc)

    story.append(PageBreak())

    # ── REPORT SECTIONS ────────────────────────────────────
    for section in report_data.get("sections", []):
        title   = clean_text(section.get("title", ""))
        content = clean_text(section.get("content", ""))
        stype   = section.get("type", "main_section")

        bg_color = TEAL if stype == "summary" else (HexColor("#6366F1") if stype == "conclusion" else NAVY)

        # Section header bar
        hdr = Table(
            [[Paragraph(f"  {title.upper()}  ", section_header)]],
            colWidths=[6.5*inch]
        )
        hdr.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,-1), bg_color),
            ("TOPPADDING",    (0,0), (-1,-1), 8),
            ("BOTTOMPADDING", (0,0), (-1,-1), 8),
            ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ]))
        story.append(hdr)
        story.append(Spacer(1, 10))

        # Content paragraphs
        for line in content.split("\n"):
            line = line.strip()
            if not line:
                continue
            if line.startswith("* ") or line.startswith("- ") or line.startswith("• "):
                story.append(Paragraph(
                    f"&bull;&nbsp;&nbsp;{line[2:]}",
                    ParagraphStyle("Bullet", parent=body, leftIndent=16, spaceAfter=4)
                ))
            elif line.startswith("**") and line.endswith("**"):
                story.append(Paragraph(
                    line.strip("*"),
                    ParagraphStyle("Bold", parent=body, fontName="Helvetica-Bold", spaceAfter=6)
                ))
            else:
                story.append(Paragraph(line, body))

        story.append(Spacer(1, 18))

    # ── REFERENCES ─────────────────────────────────────────
    story.append(PageBreak())

    ref_hdr = Table(
        [[Paragraph("  REFERENCES & CITATIONS  ", section_header)]],
        colWidths=[6.5*inch]
    )
    ref_hdr.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), NAVY),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
    ]))
    story.append(ref_hdr)
    story.append(Spacer(1, 12))

    citations = report_data.get("citations", [])
    if citations:
        for c in citations:
            title_text = clean_text(c.get("title", "Unknown Source"))
            url_text   = clean_text(c.get("url", ""))
            num        = c.get("id", "?")
            text = f"[{num}]  <b>{title_text}</b>"
            if url_text:
                text += f"<br/><font color='#0EA5E9'>{url_text[:80]}</font>"
            story.append(Paragraph(text, cite_style))
            story.append(Spacer(1, 3))
    else:
        story.append(Paragraph("Sources gathered via real-time web research.", cite_style))

    # ── FOOTER NOTE ────────────────────────────────────────
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#CBD5E1")))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "This report was autonomously generated by InsightEngine. "
        "All findings are based on real-time web research. "
        "Please verify critical information independently.",
        ParagraphStyle("Footer", parent=styles["Normal"],
            fontSize=7, textColor=GRAY,
            alignment=TA_CENTER, fontName="Helvetica-Oblique")
    ))

    doc.build(story, onFirstPage=add_page_decorations, onLaterPages=add_page_decorations)
    return output_path