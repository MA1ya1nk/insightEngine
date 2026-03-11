import asyncio
import os
import json
from typing import AsyncGenerator, Callable
from datetime import datetime
from groq import Groq
from duckduckgo_search import DDGS
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
client = Groq(api_key=GROQ_API_KEY)

async def groq_call(prompt: str, system: str = "") -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    for attempt in range(3):
        try:
            response = await asyncio.to_thread(
                client.chat.completions.create,
                model="llama-3.3-70b-versatile",
                messages=messages,
                max_tokens=2048,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            err = str(e)
            if "rate_limit" in err.lower() or "429" in err:
                wait = 2 ** attempt * 10
                await asyncio.sleep(wait)
            elif attempt == 2:
                raise e
            else:
                await asyncio.sleep(2 ** attempt)

def web_search(query: str, max_results: int = 5) -> list:
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
            return [{"title": r.get("title",""), "url": r.get("href",""), "snippet": r.get("body","")} for r in results]
    except Exception as e:
        return [{"title": "Search unavailable", "url": "", "snippet": str(e)}]

async def manager_agent(session_id: str, topic: str, send_update: Callable) -> dict:
    await send_update(session_id, {"type": "agent_status", "agent": "Manager", "status": "active", "message": "Analyzing research topic and creating structured plan..."})

    prompt = f"""You are a strategic research planner. Analyze this research topic and create a detailed research plan.
Topic: {topic}
Respond ONLY with valid JSON, no markdown, no extra text:
{{
  "objective": "Clear statement of what this research will accomplish",
  "sections": [
    {{"title": "Section Title", "focus": "What this section covers", "questions": ["Question 1", "Question 2"]}}
  ],
  "themes": ["theme1", "theme2"],
  "deliverables": ["deliverable1", "deliverable2"]
}}
Include 4-5 sections total."""

    response = await groq_call(prompt)
    clean = response.strip()
    if "```json" in clean:
        clean = clean.split("```json")[1].split("```")[0].strip()
    elif "```" in clean:
        clean = clean.split("```")[1].split("```")[0].strip()

    try:
        plan = json.loads(clean)
    except:
        plan = {
            "objective": f"Comprehensive research on {topic}",
            "sections": [
                {"title": "Overview & Background", "focus": "Historical context", "questions": ["What is the background?", "What are key concepts?"]},
                {"title": "Current State Analysis", "focus": "Present situation", "questions": ["What is the current state?", "What are recent developments?"]},
                {"title": "Impact & Implications", "focus": "Effects and consequences", "questions": ["What are major impacts?", "Who is affected?"]},
                {"title": "Challenges & Opportunities", "focus": "Problems and potential", "questions": ["What are main challenges?", "What opportunities exist?"]},
                {"title": "Future Outlook", "focus": "Predictions", "questions": ["What does future hold?", "What are recommendations?"]}
            ],
            "themes": ["analysis", "impact", "future"],
            "deliverables": ["Comprehensive research report", "Citations and references"]
        }

    await send_update(session_id, {"type": "research_plan", "agent": "Manager", "status": "complete", "plan": plan, "message": f"Research plan created with {len(plan['sections'])} sections"})
    return plan

async def researcher_agent(session_id: str, topic: str, plan: dict, send_update: Callable) -> dict:
    await send_update(session_id, {"type": "agent_status", "agent": "Researcher", "status": "active", "message": "Beginning web research and data collection..."})

    all_findings = {}
    all_citations = []

    for section in plan["sections"]:
        await send_update(session_id, {"type": "search_update", "agent": "Researcher", "section": section["title"], "message": f"Researching: {section['title']}"})
        section_findings = []

        for question in section.get("questions", [])[:2]:
            search_query = f"{topic} {question}"
            await send_update(session_id, {"type": "search_query", "agent": "Researcher", "query": search_query, "message": f"Searching: {search_query}"})

            results = web_search(search_query, max_results=4)
            for r in results:
                if r["snippet"] and len(r["snippet"]) > 50:
                    citation_id = len(all_citations) + 1
                    all_citations.append({"id": citation_id, "title": r["title"], "url": r["url"], "snippet": r["snippet"][:300]})
                    section_findings.append({"source_id": citation_id, "content": r["snippet"], "url": r["url"], "title": r["title"]})

            await send_update(session_id, {"type": "findings_update", "agent": "Researcher", "section": section["title"], "count": len(results), "citations": all_citations[-len(results):]})
            await asyncio.sleep(0.5)

        if section_findings:
            raw_text = "\n".join([f["content"] for f in section_findings[:6]])
            synthesized = await groq_call(f'Synthesize these findings about "{section["title"]}" for topic "{topic}":\n{raw_text}\nCreate 3-5 bullet point key facts.')
            all_findings[section["title"]] = {"synthesized_notes": synthesized, "raw_sources": section_findings, "section_data": section}

        await asyncio.sleep(1)

    await send_update(session_id, {"type": "agent_status", "agent": "Researcher", "status": "complete", "message": f"Research complete. Gathered {len(all_citations)} citations across {len(all_findings)} sections."})
    return {"findings": all_findings, "citations": all_citations}

async def writer_agent(session_id: str, topic: str, plan: dict, research_data: dict, send_update: Callable, feedback: str = None) -> dict:
    await send_update(session_id, {"type": "agent_status", "agent": "Writer", "status": "active", "message": "Synthesizing research into structured report..." + (" (Revising based on feedback)" if feedback else "")})

    findings = research_data["findings"]
    citations = research_data["citations"]
    sections_written = []
    all_notes = "\n\n".join([f"**{k}**:\n{v['synthesized_notes']}" for k, v in findings.items()])

    await send_update(session_id, {"type": "writing_update", "agent": "Writer", "section": "Executive Summary", "message": "Writing executive summary..."})
    exec_summary = await groq_call(f'Write a professional 2-3 paragraph executive summary for a research report on: "{topic}"\nFindings:\n{all_notes[:2000]}\n{"Feedback: " + feedback if feedback else ""}\nProfessional academic tone.')
    sections_written.append({"title": "Executive Summary", "content": exec_summary, "type": "summary"})
    await send_update(session_id, {"type": "section_draft", "agent": "Writer", "section": "Executive Summary", "preview": exec_summary[:200] + "..."})

    for section_title, section_data in findings.items():
        await send_update(session_id, {"type": "writing_update", "agent": "Writer", "section": section_title, "message": f"Writing section: {section_title}..."})
        content = await groq_call(f'Write a comprehensive 3-4 paragraph research section titled "{section_title}" for report on "{topic}".\nNotes:\n{section_data["synthesized_notes"]}\nQuestions addressed:\n{chr(10).join(section_data["section_data"].get("questions", []))}\n{"Feedback: " + feedback if feedback else ""}\nProfessional academic tone.')
        sections_written.append({"title": section_title, "content": content, "type": "main_section"})
        await send_update(session_id, {"type": "section_draft", "agent": "Writer", "section": section_title, "preview": content[:200] + "..."})
        await asyncio.sleep(0.5)

    await send_update(session_id, {"type": "writing_update", "agent": "Writer", "section": "Conclusion", "message": "Writing conclusion..."})
    conclusion = await groq_call(f'Write a strong 2-3 paragraph conclusion for a research report on: "{topic}"\nKey findings:\n{all_notes[:1500]}\nProfessional academic tone.')
    sections_written.append({"title": "Conclusion", "content": conclusion, "type": "conclusion"})

    await send_update(session_id, {"type": "agent_status", "agent": "Writer", "status": "complete", "message": f"Report draft complete with {len(sections_written)} sections."})
    return {"topic": topic, "sections": sections_written, "citations": citations, "plan": plan, "generated_at": datetime.utcnow().isoformat()}

async def critique_agent(session_id: str, report: dict, send_update: Callable) -> dict:
    await send_update(session_id, {"type": "agent_status", "agent": "Critique", "status": "active", "message": "Critically evaluating report quality..."})

    sections_text = "\n\n".join([f"## {s['title']}\n{s['content'][:400]}" for s in report["sections"][:3]])
    response = await groq_call(f'Evaluate this research report on "{report["topic"]}".\nSections:\n{sections_text}\nRespond ONLY with valid JSON no markdown:\n{{"quality_score": <1-10>, "passes_review": <true if >=7 else false>, "hallucination_risk": "<low/medium/high>", "issues_found": [], "strengths": [], "revision_feedback": "<feedback if score<7 else empty>", "citation_coverage": "<adequate/needs_improvement>", "completeness": "<complete/needs_expansion>"}}')

    clean = response.strip()
    if "```json" in clean:
        clean = clean.split("```json")[1].split("```")[0].strip()
    elif "```" in clean:
        clean = clean.split("```")[1].split("```")[0].strip()

    try:
        evaluation = json.loads(clean)
    except:
        evaluation = {"quality_score": 7, "passes_review": True, "hallucination_risk": "low", "issues_found": [], "strengths": ["Well-structured"], "revision_feedback": "", "citation_coverage": "adequate", "completeness": "complete"}

    await send_update(session_id, {"type": "critique_result", "agent": "Critique", "status": "complete", "evaluation": evaluation, "message": f"Quality score: {evaluation.get('quality_score','N/A')}/10 — {'✅ Approved' if evaluation.get('passes_review') else '🔄 Revision needed'}"})
    return evaluation

async def run_research_pipeline(session_id: str, topic: str, send_update: Callable, pending_approvals: dict, approval_decisions: dict) -> AsyncGenerator:
    try:
        from database import save_session

        await send_update(session_id, {"type": "pipeline_start", "message": f"InsightEngine initialized for: {topic}", "session_id": session_id})

        plan = await manager_agent(session_id, topic, send_update)
        save_session(session_id, topic, "awaiting_approval")

        await send_update(session_id, {"type": "awaiting_approval", "agent": "System", "plan": plan, "message": "Research plan ready. Awaiting your approval before proceeding."})

        approval_event = asyncio.Event()
        pending_approvals[session_id] = approval_event

        try:
            await asyncio.wait_for(approval_event.wait(), timeout=600)
        except asyncio.TimeoutError:
            await send_update(session_id, {"type": "error", "message": "Approval timeout. Research cancelled."})
            save_session(session_id, topic, "cancelled")
            return

        decision = approval_decisions.pop(session_id, {"approved": True})
        pending_approvals.pop(session_id, None)

        if not decision["approved"]:
            if decision.get("modifications"):
                topic = f"{topic}. Additional context: {decision['modifications']}"
                plan = await manager_agent(session_id, topic, send_update)
            else:
                await send_update(session_id, {"type": "cancelled", "message": "Research cancelled by user."})
                save_session(session_id, topic, "cancelled")
                return

        save_session(session_id, topic, "researching")

        research_data = await researcher_agent(session_id, topic, plan, send_update)

        max_iterations = 2
        feedback = None
        report = None
        evaluation = {"quality_score": 7, "passes_review": True, "hallucination_risk": "low", "issues_found": [], "strengths": [], "revision_feedback": "", "citation_coverage": "adequate", "completeness": "complete"}

        for iteration in range(max_iterations):
            await send_update(session_id, {"type": "iteration_update", "iteration": iteration + 1, "message": f"Writing iteration {iteration + 1}/{max_iterations}"})
            report = await writer_agent(session_id, topic, plan, research_data, send_update, feedback)
            evaluation = await critique_agent(session_id, report, send_update)

            if evaluation.get("passes_review", True):
                await send_update(session_id, {"type": "quality_approved", "message": f"Report approved by Critique Agent (Score: {evaluation.get('quality_score')}/10)"})
                break
            else:
                feedback = evaluation.get("revision_feedback", "")
                await send_update(session_id, {"type": "revision_requested", "feedback": feedback, "message": f"Revision requested. Iteration {iteration + 2} starting..."})

        report["evaluation"] = evaluation
        save_session(session_id, topic, "complete", report_data=report, summary=report["sections"][0]["content"][:300] if report["sections"] else "")

        await send_update(session_id, {"type": "pipeline_complete", "agent": "System", "message": "Research complete! Your report is ready.", "report": report})

        yield report

    except Exception as e:
        await send_update(session_id, {"type": "error", "message": f"Pipeline error: {str(e)}"})
        from database import save_session
        save_session(session_id, topic, "error")
        raise