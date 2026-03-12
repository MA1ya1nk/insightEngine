// import { IconBrain, IconSearch, IconPen, IconShield, IconSparkle } from "./Icons";

// export const API_BASE = "http://localhost:8000";

// export const AGENTS = {
//   Manager:    { color: "#6366F1", bg: "#EEF2FF", icon: IconBrain,   label: "Manager"    },
//   Researcher: { color: "#0EA5E9", bg: "#E0F2FE", icon: IconSearch,  label: "Researcher" },
//   Writer:     { color: "#10B981", bg: "#D1FAE5", icon: IconPen,     label: "Writer"     },
//   Critique:   { color: "#F59E0B", bg: "#FEF3C7", icon: IconShield,  label: "Critique"   },
//   System:     { color: "#8B5CF6", bg: "#EDE9FE", icon: IconSparkle, label: "System"     },
// };

// export const EXAMPLES = [
//   "The impact of artificial intelligence on global job markets in 2024-2025",
//   "Climate change mitigation strategies: effectiveness and economic impact",
//   "The future of quantum computing and its implications for cybersecurity",
//   "Electric vehicle adoption barriers and opportunities in developing nations",
// ];

// export const STATUS_COLORS = {
//   complete:   "#10B981",
//   error:      "#EF4444",
//   started:    "#F59E0B",
//   researching:"#0EA5E9",
//   cancelled:  "#94A3B8",
// };


import { IconBrain, IconSearch, IconPen, IconShield, IconSparkle } from "./Icons";

// ── Change this to your Render backend URL after deploying ──
const IS_PRODUCTION = import.meta.env.PROD;
export const API_BASE = IS_PRODUCTION
  ? "https://insightengine-zt7t.onrender.com"   // ← Replace with your Render URL
  : "http://localhost:8000";

export const WS_BASE = IS_PRODUCTION
  ? "wss://insightengine-zt7t.onrender.com"     // ← Same URL, just wss:// not https://
  : "ws://localhost:8000";

export const AGENTS = {
  Manager:    { color: "#6366F1", bg: "#EEF2FF", icon: IconBrain,   label: "Manager"    },
  Researcher: { color: "#0EA5E9", bg: "#E0F2FE", icon: IconSearch,  label: "Researcher" },
  Writer:     { color: "#10B981", bg: "#D1FAE5", icon: IconPen,     label: "Writer"     },
  Critique:   { color: "#F59E0B", bg: "#FEF3C7", icon: IconShield,  label: "Critique"   },
  System:     { color: "#8B5CF6", bg: "#EDE9FE", icon: IconSparkle, label: "System"     },
};

export const EXAMPLES = [
  "The impact of artificial intelligence on global job markets in 2024-2025",
  "Climate change mitigation strategies: effectiveness and economic impact",
  "The future of quantum computing and its implications for cybersecurity",
  "Electric vehicle adoption barriers and opportunities in developing nations",
];

export const STATUS_COLORS = {
  complete:    "#10B981",
  error:       "#EF4444",
  started:     "#F59E0B",
  researching: "#0EA5E9",
  cancelled:   "#94A3B8",
};