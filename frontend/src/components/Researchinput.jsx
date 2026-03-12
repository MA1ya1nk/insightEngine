import { IconArrow } from "./Icons";
import { EXAMPLES } from "./constants";

export default function ResearchInput({ topic, setTopic, onStart }) {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg"
      style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)" }}
    >
      <div className="p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
          Autonomous AI Research Platform
        </h1>
        <p
          className="text-sm md:text-base mb-6"
          style={{ color: "#94A3B8" }}
        >
          Submit any complex topic. Our multi-agent AI team will research,
          analyze, and deliver a professional report.
        </p>

        {/* Input Row */}
        <div className="flex gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onStart()}
            placeholder="Enter your research topic..."
            className="flex-1 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              color: "white",
              outline: "none",
            }}
          />
          <button
            onClick={onStart}
            disabled={!topic.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
              whiteSpace: "nowrap",
            }}
          >
            Research <IconArrow />
          </button>
        </div>

        {/* Example Topics */}
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setTopic(ex)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#94A3B8",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {ex.length > 50 ? ex.slice(0, 50) + "..." : ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}