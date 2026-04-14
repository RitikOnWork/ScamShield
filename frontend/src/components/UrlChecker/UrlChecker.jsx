import { useState } from "react";

function UrlChecker() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkUrl = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/check-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getColor = () => {
    if (!result) return "#ccc";
    if (result.label === "Safe") return "#22c55e";
    if (result.label === "Suspicious") return "#f59e0b";
    return "#ef4444";
  };

  const getProgress = () => {
    if (!result) return 0;
    return Math.min(result.risk_score * 20, 100);
  };

  return (
    <div style={{ marginTop: "30px" }}>

      {/* INPUT CARD */}
      <div className="glass-card" style={{ padding: "20px", marginBottom: "20px" }}>
        <h3>🔗 URL Scanner</h3>

        <input
          type="text"
          placeholder="Paste suspicious link here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            borderRadius: "10px",
            border: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)"
          }}
        />

        <button
          onClick={checkUrl}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(90deg, #4facfe, #6366f1)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {loading ? "Analyzing..." : "Check URL"}
        </button>
      </div>

      {/* RESULT SECTION */}
      {result && (
        <>
          {/* PROBABILITY CARD */}
          <div className="glass-card" style={{ padding: "20px", marginBottom: "20px" }}>
            <h4>Risk Level</h4>

            <h2 style={{ color: getColor() }}>
              {result.label}
            </h2>

            {/* PROGRESS BAR */}
            <div
              style={{
                height: "8px",
                background: "#333",
                borderRadius: "10px",
                overflow: "hidden",
                marginTop: "10px"
              }}
            >
              <div
                style={{
                  width: `${getProgress()}%`,
                  height: "100%",
                  background: getColor(),
                  transition: "0.4s ease"
                }}
              ></div>
            </div>
          </div>

          {/* INSIGHTS CARD */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <h4>⚠️ Detection Insights</h4>

            <ul style={{ marginTop: "10px" }}>
              {result.reasons.map((r, i) => (
                <li key={i} style={{ marginBottom: "8px" }}>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default UrlChecker;