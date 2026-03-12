import { API_BASE } from "./constants";
import { IconDownload } from "./Icons";

export default function ReportView({ report, sessionId }) {
  const handleDownload = async () => {
    const response = await fetch(`${API_BASE}/api/research/pdf/${sessionId}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `research_report_${sessionId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Report Header */}
      <div
        className="p-5 rounded-2xl"
        style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "#10B981", color: "white" }}
              >
                ✓ COMPLETE
              </span>
              <span className="text-xs" style={{ color: "#94A3B8" }}>
                {report.generated_at
                  ? new Date(report.generated_at).toLocaleString()
                  : ""}
              </span>
            </div>
            <h2 className="text-white font-bold text-lg leading-snug">
              {report.topic}
            </h2>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              {report.sections?.length} sections · {report.citations?.length} citations
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }}
          >
            <IconDownload /> PDF
          </button>
        </div>

        {/* Quality Score */}
        {report.evaluation && (
          <div
            className="mt-3 flex items-center gap-4 px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <span
              className="text-2xl font-black"
              style={{
                color: report.evaluation.quality_score >= 7 ? "#34D399" : "#FBBF24",
              }}
            >
              {report.evaluation.quality_score}/10
            </span>
            <div>
              <p className="text-xs font-medium text-white">Quality Score</p>
              <p className="text-xs" style={{ color: "#94A3B8" }}>
                Hallucination Risk: {report.evaluation.hallucination_risk}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {report.sections?.map((section, i) => (
          <details
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid #E2E8F0" }}
            open={i === 0}
          >
            <summary
              className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
              style={{ background: i === 0 ? "#F0F9FF" : "#F8FAFC" }}
            >
              <span
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: "#0D1B2A", color: "white" }}
              >
                {i + 1}
              </span>
              <span className="font-semibold text-sm flex-1" style={{ color: "#1E293B" }}>
                {section.title}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#E2E8F0", color: "#64748B" }}
              >
                {section.type === "summary"
                  ? "Executive"
                  : section.type === "conclusion"
                  ? "Final"
                  : "Section"}
              </span>
            </summary>

            <div className="px-4 py-4" style={{ background: "white" }}>
              {section.content
                .split("\n")
                .filter((p) => p.trim())
                .map((p, pi) => (
                  <p
                    key={pi}
                    className="mb-3 text-sm leading-relaxed"
                    style={{ color: "#334155" }}
                  >
                    {p}
                  </p>
                ))}
            </div>
          </details>
        ))}
      </div>

      {/* Citations */}
      {report.citations?.length > 0 && (
        <details
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid #E2E8F0" }}
        >
          <summary
            className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
            style={{ background: "#F8FAFC" }}
          >
            <span className="font-semibold text-sm" style={{ color: "#1E293B" }}>
              References & Citations ({report.citations.length})
            </span>
          </summary>
          <div className="px-4 py-3 space-y-2" style={{ background: "white" }}>
            {report.citations.map((c, i) => (
              <div
                key={i}
                className="text-xs p-2 rounded-lg"
                style={{ background: "#F8FAFC" }}
              >
                <span className="font-bold mr-1" style={{ color: "#0EA5E9" }}>
                  [{c.id}]
                </span>
                <span style={{ color: "#334155" }}>{c.title}</span>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block mt-0.5 truncate"
                    style={{ color: "#94A3B8" }}
                  >
                    {c.url}
                  </a>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}