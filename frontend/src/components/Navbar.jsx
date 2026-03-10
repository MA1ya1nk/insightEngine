import { IconSparkle, IconHistory } from "./Icons";

export default function Navbar({ phase, onHistoryToggle }) {
  return (
    <nav
      className="sticky top-0 z-40"
      style={{ background: "rgba(13,27,42,0.97)", backdropFilter: "blur(8px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }}
          >
            <IconSparkle />
          </div>
          <div>
            <span className="text-white font-black text-lg tracking-tight">
              InsightEngine
            </span>
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#1E3A5F", color: "#7DD3FC" }}
            >
              Beta
            </span>
          </div>
        </div>

        {/* History Button */}
        <button
          onClick={onHistoryToggle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
          style={{
            color: phase === "history" ? "#0EA5E9" : "#94A3B8",
            background: phase === "history" ? "#1E3A5F" : "transparent",
          }}
        >
          <IconHistory /> History
        </button>
      </div>
    </nav>
  );
}