import { useState } from "react";
import { API_BASE } from "./constants";
import { IconBrain, IconCheck, IconX } from "./Icons";

export default function ApprovalModal({ plan, sessionId, onDecision }) {
  const [modifications, setModifications] = useState("");
  const [showModify, setShowModify] = useState(false);

  const handleApprove = async () => {
    await fetch(`${API_BASE}/api/research/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, approved: true }),
    });
    onDecision(true);
  };

  const handleReject = async () => {
    await fetch(`${API_BASE}/api/research/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        approved: false,
        modifications,
      }),
    });
    onDecision(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "white" }}
      >
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#0EA5E9" }}
            >
              <IconBrain />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Research Plan Ready</h2>
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                Review and approve before research begins
              </p>
            </div>
          </div>
        </div>

        {/* Plan Body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {/* Objective */}
          <div
            className="mb-4 p-4 rounded-xl"
            style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}
          >
            <h3 className="font-semibold text-sm mb-1" style={{ color: "#0369A1" }}>
              RESEARCH OBJECTIVE
            </h3>
            <p className="text-sm" style={{ color: "#1E293B" }}>{plan.objective}</p>
          </div>

          {/* Sections */}
          <h3 className="font-semibold text-sm mb-3" style={{ color: "#475569" }}>
            PLANNED SECTIONS ({plan.sections?.length})
          </h3>
          <div className="space-y-2">
            {plan.sections?.map((s, i) => (
              <div
                key={i}
                className="p-3 rounded-xl"
                style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ background: "#0D1B2A", color: "white" }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1E293B" }}>
                      {s.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{s.focus}</p>
                    {s.questions?.map((q, qi) => (
                      <p key={qi} className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                        • {q}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modification box */}
          {showModify && (
            <div className="mt-4">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#334155" }}
              >
                Modifications / Additional Instructions
              </label>
              <textarea
                value={modifications}
                onChange={(e) => setModifications(e.target.value)}
                placeholder="Describe any changes you'd like to the research scope..."
                className="w-full p-3 rounded-xl text-sm resize-none"
                rows={3}
                style={{
                  border: "2px solid #E2E8F0",
                  outline: "none",
                  color: "#1E293B",
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="px-6 py-4 flex items-center justify-between gap-3"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          <button
            onClick={() => setShowModify(!showModify)}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
            style={{
              color: "#64748B",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            {showModify ? "Hide Modifications" : "Request Modifications"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleReject}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                color: "#EF4444",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
              }}
            >
              <IconX /> Cancel
            </button>
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }}
            >
              <IconCheck /> Approve & Start Research
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}