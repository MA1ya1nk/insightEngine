import { useRef, useEffect } from "react";
import { AGENTS } from "./constants";

const PulsingDot = ({ color }) => (
  <span className="relative flex h-3 w-3">
    <span
      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
      style={{ backgroundColor: color }}
    />
    <span
      className="relative inline-flex rounded-full h-3 w-3"
      style={{ backgroundColor: color }}
    />
  </span>
);

const TYPE_LABELS = {
  agent_status:      "Agent Update",
  search_query:      "Searching",
  search_update:     "Research",
  findings_update:   "Findings",
  writing_update:    "Writing",
  section_draft:     "Draft Ready",
  critique_result:   "Critique",
  awaiting_approval: "Approval Needed",
  pipeline_start:    "Started",
  pipeline_complete: "Complete",
  iteration_update:  "Iteration",
  revision_requested:"Revision",
  quality_approved:  "Approved",
  error:             "Error",
};

const StreamItem = ({ item }) => {
  const cfg = AGENTS[item.agent] || AGENTS.System;
  const Icon = cfg.icon;
  const label = TYPE_LABELS[item.type] || item.type;

  return (
    <div className="flex gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        <span className="w-4 h-4">
          <Icon />
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold" style={{ color: cfg.color }}>
            {label}
          </span>
          <span className="text-xs" style={{ color: "#94A3B8" }}>
            {item.agent}
          </span>
        </div>

        <p className="text-sm" style={{ color: "#334155" }}>{item.message}</p>

        {/* Search query pill */}
        {item.type === "search_query" && (
          <p
            className="text-xs mt-1 px-2 py-1 rounded font-mono"
            style={{ background: "#F1F5F9", color: "#475569" }}
          >
            🔍 {item.query}
          </p>
        )}

        {/* Citations */}
        {item.citations?.length > 0 && (
          <div className="mt-1 space-y-1">
            {item.citations.slice(0, 2).map((c, i) => (
              <div
                key={i}
                className="text-xs px-2 py-1 rounded"
                style={{ background: "#F0F9FF", color: "#0369A1" }}
              >
                [{c.id}] {c.title?.substring(0, 60)}
                {c.title?.length > 60 ? "..." : ""}
              </div>
            ))}
          </div>
        )}

        {/* Critique score */}
        {item.evaluation && (
          <div className="mt-2 p-2 rounded-lg" style={{ background: "#F8FAFC" }}>
            <div className="flex items-center gap-3">
              <span
                className="text-2xl font-bold"
                style={{
                  color: item.evaluation.quality_score >= 7 ? "#10B981" : "#F59E0B",
                }}
              >
                {item.evaluation.quality_score}/10
              </span>
              <div>
                <p className="text-xs font-medium" style={{ color: "#334155" }}>
                  Quality Score
                </p>
                <p className="text-xs" style={{ color: "#64748B" }}>
                  Risk: {item.evaluation.hallucination_risk}
                </p>
              </div>
            </div>
            {item.evaluation.strengths?.length > 0 && (
              <p className="text-xs mt-1" style={{ color: "#10B981" }}>
                ✓ {item.evaluation.strengths[0]}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function LiveStream({ streamItems }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamItems]);

  return (
    <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: "white" }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid #F1F5F9" }}
      >
        <PulsingDot color="#0EA5E9" />
        <span className="text-sm font-semibold" style={{ color: "#1E293B" }}>
          Live Research Stream
        </span>
        {streamItems.length > 0 && (
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: "#0EA5E9", color: "white" }}
          >
            {streamItems.length}
          </span>
        )}
      </div>

      {/* Stream Items */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: "500px" }}>
        {streamItems.length === 0 ? (
          <div className="text-center py-12">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse"
              style={{ background: "#F0F9FF" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" className="w-6 h-6">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Waiting for research to begin...
            </p>
          </div>
        ) : (
          streamItems.map((item, i) => <StreamItem key={i} item={item} />)
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}