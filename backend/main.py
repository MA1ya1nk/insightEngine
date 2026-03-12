from dotenv import load_dotenv
load_dotenv()
import asyncio
import json
import uuid
import sqlite3
import os
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn

from agents import run_research_pipeline
from database import init_db, save_session, get_sessions, get_session
from pdf_generator import generate_pdf

app = FastAPI(title="InsightEngine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# Store active websocket connections
active_connections: dict[str, WebSocket] = {}

class ResearchRequest(BaseModel):
    topic: str
    session_id: Optional[str] = None

class ApprovalRequest(BaseModel):
    session_id: str
    approved: bool
    modifications: Optional[str] = None

# Store pending approvals
pending_approvals: dict[str, asyncio.Event] = {}
approval_decisions: dict[str, dict] = {}

@app.get("/")
def home():
    return {"message": "InsightEngine API is running"}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    active_connections[session_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.pop(session_id, None)

async def send_update(session_id: str, data: dict):
    ws = active_connections.get(session_id)
    if ws:
        try:
            await ws.send_text(json.dumps(data))
        except:
            active_connections.pop(session_id, None)

@app.post("/api/research/start")
async def start_research(request: ResearchRequest):
    session_id = request.session_id or str(uuid.uuid4())
    save_session(session_id, request.topic, "started")
    
    async def run_with_streaming():
        async for update in run_research_pipeline(
            session_id=session_id,
            topic=request.topic,
            send_update=send_update,
            pending_approvals=pending_approvals,
            approval_decisions=approval_decisions
        ):
            pass
    
    asyncio.create_task(run_with_streaming())
    return {"session_id": session_id, "status": "started"}

@app.post("/api/research/approve")
async def approve_research(request: ApprovalRequest):
    session_id = request.session_id
    if session_id in pending_approvals:
        approval_decisions[session_id] = {
            "approved": request.approved,
            "modifications": request.modifications
        }
        pending_approvals[session_id].set()
        return {"status": "approval_recorded"}
    raise HTTPException(status_code=404, detail="No pending approval for this session")

@app.get("/api/research/sessions")
async def get_all_sessions():
    return get_sessions()

@app.get("/api/research/session/{session_id}")
async def get_single_session(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.get("/api/research/pdf/{session_id}")
async def download_pdf(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    report_data = json.loads(session["report_data"]) if session.get("report_data") else None
    if not report_data:
        raise HTTPException(status_code=400, detail="Report not yet generated")
    
    import tempfile; pdf_path = os.path.join(tempfile.gettempdir(), f"insightengine_{session_id}.pdf")
    generate_pdf(report_data, pdf_path)
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"research_report_{session_id[:8]}.pdf")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)