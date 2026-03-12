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

const AgentCard = ({ name, isActive, isComplete, message }) => {
  const cfg = AGENTS[name] || AGENTS.System;
  const Icon = cfg.icon;

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300"
      style={{
        background: isActive ? cfg.bg : "#F8FAFC",
        border: `1.5px solid ${isActive ? cfg.color : "#E2E8F0"}`,
      }}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{
          background: isActive || isComplete ? cfg.color : "#E2E8F0",
          color: "white",
        }}
      >
        <Icon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: "#1E293B" }}>
            {cfg.label}
          </span>
          {isActive && <PulsingDot color={cfg.color} />}
          {isComplete && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              Done
            </span>
          )}
        </div>
        {message && (
          <p className="text-xs mt-1 truncate" style={{ color: "#64748B" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

const PIPELINE_STEPS = [
  { label: "Plan",     key: "Manager"    },
  { label: "Approval", key: "approval"  },
  { label: "Research", key: "Researcher"},
  { label: "Writing",  key: "Writer"    },
  { label: "Critique", key: "Critique"  },
  { label: "Report",   key: "report"    },
];

export default function AgentDashboard({ topic, agentStates, phase }) {
  const agentList = ["Manager", "Researcher", "Writer", "Critique"];

  const isStepDone = (key) => {
    if (key === "approval") return phase !== "approval" && !!agentStates.Manager;
    if (key === "report")   return phase === "complete";
    const s = agentStates[key];
    return s?.isComplete || s?.status === "complete";
  };

  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Topic Card */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)" }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: "#7DD3FC" }}>
          RESEARCHING
        </p>
        <p className="text-white font-bold text-sm leading-snug">{topic}</p>
      </div>

      {/* Agent Cards */}
      <div className="p-4 rounded-2xl shadow-sm" style={{ background: "white" }}>
        <p className="text-xs font-bold mb-3 tracking-wider" style={{ color: "#64748B" }}>
          AI AGENTS
        </p>
        <div className="space-y-2">
          {agentList.map((agent) => {
            const state = agentStates[agent] || {};
            return (
              <AgentCard
                key={agent}
                name={agent}
                isActive={state.isActive && state.status !== "complete"}
                isComplete={state.isComplete || state.status === "complete"}
                message={state.message}
              />
            );
          })}
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="p-4 rounded-2xl shadow-sm" style={{ background: "white" }}>
        <p className="text-xs font-bold mb-3 tracking-wider" style={{ color: "#64748B" }}>
          PIPELINE STATUS
        </p>
        <div className="space-y-2">
          {PIPELINE_STEPS.map((step) => {
            const done = isStepDone(step.key);
            return (
              <div key={step.label} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: done ? "#10B981" : "#F1F5F9" }}
                >
                  {done ? (
                    <span className="text-white text-xs">✓</span>
                  ) : (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#CBD5E1", display: "block" }}
                    />
                  )}
                </div>
                <span
                  className="text-sm"
                  style={{
                    color: done ? "#1E293B" : "#94A3B8",
                    fontWeight: done ? "500" : "400",
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}