// import { useState, useRef, useCallback } from "react";
// import { API_BASE } from "./components/constants";
// import Navbar from "./components/Navbar";
// import ResearchInput from "./components/ResearchInput";
// import AgentDashboard from "./components/AgentDashboard";
// import LiveStream from "./components/LiveStream";
// import ReportView from "./components/ReportView";
// import ApprovalModal from "./components/ApprovalModal";
// import HistoryView from "./components/HistoryView";
// import { IconCheck } from "./components/Icons";

// export default function App() {
//   const [topic, setTopic]               = useState("");
//   const [sessionId, setSessionId]       = useState(null);
//   const [phase, setPhase]               = useState("idle");
//   const [streamItems, setStreamItems]   = useState([]);
//   const [agentStates, setAgentStates]   = useState({});
//   const [approvalPlan, setApprovalPlan] = useState(null);
//   const [finalReport, setFinalReport]   = useState(null);
//   const [activeTab, setActiveTab]       = useState("stream");
//   const wsRef = useRef(null);

//   const connectWebSocket = useCallback((sid) => {
//     if (wsRef.current) wsRef.current.close();
//     const ws = new WebSocket(`ws://localhost:8000/ws/${sid}`);

//     ws.onmessage = (e) => {
//       const data = JSON.parse(e.data);

//       // Update agent states
//       if (data.agent) {
//         setAgentStates((prev) => ({
//           ...prev,
//           [data.agent]: {
//             status:     data.status || "active",
//             message:    data.message,
//             isActive:   data.status !== "complete",
//             isComplete: data.status === "complete",
//           },
//         }));
//       }

//       // Handle all pipeline events
//       if (data.type === "awaiting_approval") {
//         // Works for BOTH first approval AND re-approval after modification
//         setApprovalPlan(data.plan);
//         setPhase("approval");
//       } else if (data.type === "pipeline_complete") {
//         setFinalReport(data.report);
//         setPhase("complete");
//         setActiveTab("report");
//       } else if (data.type === "cancelled") {
//         // Clean cancel with no modifications typed
//         setPhase("idle");
//         setTopic("");
//       } else if (data.type === "error") {
//         setPhase("idle");
//       }

//       // Push to live stream
//       if (data.message) {
//         setStreamItems((prev) => [...prev, { ...data, timestamp: new Date() }]);
//       }
//     };

//     ws.onerror = () => {};
//     wsRef.current = ws;
//   }, []);

//   const startResearch = async () => {
//     if (!topic.trim()) return;
//     setStreamItems([]);
//     setAgentStates({});
//     setFinalReport(null);
//     setApprovalPlan(null);
//     setPhase("running");
//     setActiveTab("stream");

//     const res = await fetch(`${API_BASE}/api/research/start`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ topic }),
//     });
//     const { session_id } = await res.json();
//     setSessionId(session_id);
//     connectWebSocket(session_id);
//   };

//   const handleApprovalDecision = (approved, hasModifications) => {
//     setApprovalPlan(null);
//     if (approved) {
//       // Normal approve → go to running
//       setPhase("running");
//     } else if (hasModifications) {
//       // Has modifications → stay in running, wait for new awaiting_approval from WebSocket
//       setPhase("running");
//     }
//     // If clean cancel (no modifications) → WebSocket "cancelled" event handles phase reset
//   };

//   const handleHistorySelect = async (sid) => {
//     const res = await fetch(`${API_BASE}/api/research/session/${sid}`);
//     const session = await res.json();
//     if (session.report_data) {
//       setFinalReport(JSON.parse(session.report_data));
//       setSessionId(sid);
//       setPhase("complete");
//       setActiveTab("report");
//     }
//   };

//   const isResearchActive = ["running", "complete", "approval"].includes(phase);

//   return (
//     <div className="min-h-screen" style={{ background: "#F0F4F8", fontFamily: "'Inter', system-ui, sans-serif" }}>
//       {/* Nav */}
//       <Navbar
//         phase={phase}
//         onHistoryToggle={() => setPhase(phase === "history" ? "idle" : "history")}
//       />

//       <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

//         {/* Input — show when idle or history */}
//         {(phase === "idle" || phase === "history") && (
//           <ResearchInput topic={topic} setTopic={setTopic} onStart={startResearch} />
//         )}

//         {/* History panel */}
//         {phase === "history" && (
//           <div className="rounded-2xl p-5 shadow" style={{ background: "white" }}>
//             <h2 className="font-bold text-base mb-4" style={{ color: "#1E293B" }}>
//               Research History
//             </h2>
//             <HistoryView onSelect={handleHistorySelect} />
//           </div>
//         )}

//         {/* Research Dashboard */}
//         {isResearchActive && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

//             {/* Left: Agent Dashboard */}
//             <AgentDashboard topic={topic} agentStates={agentStates} phase={phase} />

//             {/* Right: Tabs + Content */}
//             <div className="lg:col-span-2">
//               {/* Tab Bar */}
//               <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "#E2E8F0" }}>
//                 {[
//                   { id: "stream", label: "Live Stream" },
//                   { id: "report", label: "Report", disabled: !finalReport },
//                 ].map((tab) => (
//                   <button
//                     key={tab.id}
//                     disabled={tab.disabled}
//                     onClick={() => setActiveTab(tab.id)}
//                     className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
//                     style={{
//                       background: activeTab === tab.id ? "white" : "transparent",
//                       color:      activeTab === tab.id ? "#1E293B" : "#64748B",
//                       boxShadow:  activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
//                     }}
//                   >
//                     {tab.label}
//                     {tab.id === "stream" && streamItems.length > 0 && (
//                       <span
//                         className="ml-2 px-1.5 py-0.5 rounded-full text-xs"
//                         style={{ background: "#0EA5E9", color: "white" }}
//                       >
//                         {streamItems.length}
//                       </span>
//                     )}
//                   </button>
//                 ))}
//               </div>

//               {/* Stream Tab */}
//               {activeTab === "stream" && <LiveStream streamItems={streamItems} />}

//               {/* Report Tab */}
//               {activeTab === "report" && finalReport && (
//                 <div className="rounded-2xl shadow-sm overflow-hidden p-4" style={{ background: "white" }}>
//                   <ReportView report={finalReport} sessionId={sessionId} />
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Completion Banner */}
//         {phase === "complete" && (
//           <div
//             className="flex items-center justify-between p-4 rounded-2xl"
//             style={{ background: "linear-gradient(135deg, #D1FAE5, #A7F3D0)", border: "1px solid #6EE7B7" }}
//           >
//             <div className="flex items-center gap-3">
//               <div
//                 className="w-10 h-10 rounded-xl flex items-center justify-center"
//                 style={{ background: "#10B981", color: "white" }}
//               >
//                 <IconCheck />
//               </div>
//               <div>
//                 <p className="font-bold" style={{ color: "#065F46" }}>Research Complete!</p>
//                 <p className="text-sm" style={{ color: "#047857" }}>
//                   Your professional report is ready to view and download
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => { setPhase("idle"); setTopic(""); }}
//               className="px-4 py-2 rounded-xl text-sm font-bold text-white"
//               style={{ background: "#10B981" }}
//             >
//               New Research
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Approval Modal */}
//       {phase === "approval" && approvalPlan && (
//         <ApprovalModal
//           plan={approvalPlan}
//           sessionId={sessionId}
//           onDecision={handleApprovalDecision}
//         />
//       )}
//     </div>
//   );
// }



import { useState, useRef, useCallback } from "react";
import { API_BASE, WS_BASE } from "./components/Constants";
import Navbar from "./components/Navbar";
import ResearchInput from "./components/Researchinput";
import AgentDashboard from "./components/Agentdashboard";
import LiveStream from "./components/Livestream";
import ReportView from "./components/Reportview";
import ApprovalModal from "./components/Approvalmodal";
import HistoryView from "./components/Historyview";
import { IconCheck } from "./components/Icons";

export default function App() {
  const [topic, setTopic]               = useState("");
  const [sessionId, setSessionId]       = useState(null);
  const [phase, setPhase]               = useState("idle");
  const [streamItems, setStreamItems]   = useState([]);
  const [agentStates, setAgentStates]   = useState({});
  const [approvalPlan, setApprovalPlan] = useState(null);
  const [finalReport, setFinalReport]   = useState(null);
  const [activeTab, setActiveTab]       = useState("stream");
  const wsRef = useRef(null);

  const connectWebSocket = useCallback((sid) => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(`${WS_BASE}/ws/${sid}`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.agent) {
        setAgentStates((prev) => ({
          ...prev,
          [data.agent]: {
            status:     data.status || "active",
            message:    data.message,
            isActive:   data.status !== "complete",
            isComplete: data.status === "complete",
          },
        }));
      }
      if (data.type === "awaiting_approval") {
        setApprovalPlan(data.plan);
        setPhase("approval");
      } else if (data.type === "pipeline_complete") {
        setFinalReport(data.report);
        setPhase("complete");
        setActiveTab("report");
      } else if (data.type === "cancelled") {
        setPhase("idle");
        setTopic("");
      } else if (data.type === "error") {
        setPhase("idle");
      }
      if (data.message) {
        setStreamItems((prev) => [...prev, { ...data, timestamp: new Date() }]);
      }
    };
    ws.onerror = () => {};
    wsRef.current = ws;
  }, []);

  const startResearch = async () => {
    if (!topic.trim()) return;
    setStreamItems([]);
    setAgentStates({});
    setFinalReport(null);
    setApprovalPlan(null);
    setPhase("running");
    setActiveTab("stream");
    const res = await fetch(`${API_BASE}/api/research/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const { session_id } = await res.json();
    setSessionId(session_id);
    connectWebSocket(session_id);
  };

  const handleApprovalDecision = (approved, hasModifications) => {
    setApprovalPlan(null);
    if (approved || hasModifications) setPhase("running");
  };

  const handleHistorySelect = async (sid) => {
    const res = await fetch(`${API_BASE}/api/research/session/${sid}`);
    const session = await res.json();
    if (session.report_data) {
      setFinalReport(JSON.parse(session.report_data));
      setSessionId(sid);
      setPhase("complete");
      setActiveTab("report");
    }
  };

  const isResearchActive = ["running", "complete", "approval"].includes(phase);

  return (
    <div className="min-h-screen" style={{ background: "#F0F4F8", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar phase={phase} onHistoryToggle={() => setPhase(phase === "history" ? "idle" : "history")} />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {(phase === "idle" || phase === "history") && (
          <ResearchInput topic={topic} setTopic={setTopic} onStart={startResearch} />
        )}
        {phase === "history" && (
          <div className="rounded-2xl p-5 shadow" style={{ background: "white" }}>
            <h2 className="font-bold text-base mb-4" style={{ color: "#1E293B" }}>Research History</h2>
            <HistoryView onSelect={handleHistorySelect} />
          </div>
        )}
        {isResearchActive && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <AgentDashboard topic={topic} agentStates={agentStates} phase={phase} />
            <div className="lg:col-span-2">
              <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "#E2E8F0" }}>
                {[{ id: "stream", label: "Live Stream" }, { id: "report", label: "Report", disabled: !finalReport }].map((tab) => (
                  <button key={tab.id} disabled={tab.disabled} onClick={() => setActiveTab(tab.id)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                    style={{ background: activeTab === tab.id ? "white" : "transparent", color: activeTab === tab.id ? "#1E293B" : "#64748B", boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                    {tab.label}
                    {tab.id === "stream" && streamItems.length > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs" style={{ background: "#0EA5E9", color: "white" }}>{streamItems.length}</span>
                    )}
                  </button>
                ))}
              </div>
              {activeTab === "stream" && <LiveStream streamItems={streamItems} />}
              {activeTab === "report" && finalReport && (
                <div className="rounded-2xl shadow-sm overflow-hidden p-4" style={{ background: "white" }}>
                  <ReportView report={finalReport} sessionId={sessionId} />
                </div>
              )}
            </div>
          </div>
        )}
        {phase === "complete" && (
          <div className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: "linear-gradient(135deg, #D1FAE5, #A7F3D0)", border: "1px solid #6EE7B7" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#10B981", color: "white" }}><IconCheck /></div>
              <div>
                <p className="font-bold" style={{ color: "#065F46" }}>Research Complete!</p>
                <p className="text-sm" style={{ color: "#047857" }}>Your professional report is ready to view and download</p>
              </div>
            </div>
            <button onClick={() => { setPhase("idle"); setTopic(""); }} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "#10B981" }}>New Research</button>
          </div>
        )}
      </div>
      {phase === "approval" && approvalPlan && (
        <ApprovalModal plan={approvalPlan} sessionId={sessionId} onDecision={handleApprovalDecision} />
      )}
    </div>
  );
}