import { useState, useEffect } from "react";
import { API_BASE, STATUS_COLORS } from "./Constants";
import { IconHistory } from "./Icons";

export default function HistoryView({ onSelect }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/research/sessions`)
      .then((r) => r.json())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-sm" style={{ color: "#94A3B8" }}>
        Loading history...
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="text-center py-16">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "#F1F5F9", color: "#94A3B8" }}
        >
          <IconHistory />
        </div>
        <p className="font-medium" style={{ color: "#64748B" }}>
          No research sessions yet
        </p>
        <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
          Start your first research above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => {
        const color = STATUS_COLORS[s.status] || "#94A3B8";
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="w-full text-left p-4 rounded-xl transition-all hover:shadow-md"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-sm truncate"
                  style={{ color: "#1E293B" }}
                >
                  {s.topic}
                </p>
                <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                  {new Date(s.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                style={{ background: `${color}15`, color }}
              >
                {s.status}
              </span>
            </div>
            {s.summary && (
              <p
                className="text-xs mt-2 line-clamp-2"
                style={{ color: "#64748B" }}
              >
                {s.summary}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}