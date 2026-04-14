import { useState } from "react";

function UrlChecker() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const checkUrl = async () => {
    if (!url.trim()) {
      setError("Enter a URL to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    setFeedbackMessage("");
    try {
      const res = await fetch("http://localhost:8000/api/check-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "URL analysis failed.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult(null);
      setError(err.message || "Unable to analyze this URL right now.");
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (userLabel) => {
    if (!result) return;

    setFeedbackMessage("");
    try {
      const res = await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_data: url,
          original_label: result.label,
          user_label: userLabel,
          type: "url",
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to save your feedback.");
      }

      setFeedbackMessage("Thanks. Your URL review feedback was saved.");
    } catch (err) {
      console.error(err);
      setFeedbackMessage("Feedback could not be saved right now.");
    }
  };

  const getColor = () => {
    if (!result) return "#ccc";
    if (result.label === "Safe") return "#22c55e";
    if (result.label === "Suspicious") return "#f59e0b";
    return "#ef4444";
  };

  const getProgress = () => {
    if (!result) return 0;
    return result.risk_score;
  };

  return (
    <div style={{ marginTop: "30px" }}>

      {/* INPUT CARD */}
      <div className="glass-card" style={{ padding: "20px", marginBottom: "20px" }}>
        <h3>🔗 URL Scanner</h3>
        <p style={{ marginTop: "8px", color: "var(--text-secondary)" }}>
          Check a suspicious link for phishing patterns, impersonation, and risky redirects.
        </p>

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

        {error && (
          <p style={{ marginTop: "12px", color: "var(--status-danger)" }}>{error}</p>
        )}

        <button
          onClick={checkUrl}
          disabled={loading}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            opacity: loading ? 0.7 : 1,
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

          <div className="glass-card" style={{ padding: "20px", marginTop: "20px" }}>
            <h4>Was this URL verdict accurate?</h4>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
              <button
                onClick={() => submitFeedback(result.label)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "var(--status-safe)",
                  border: "1px solid var(--status-safe)"
                }}
              >
                Yes, correct
              </button>
              <button
                onClick={() => submitFeedback("Safe")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)"
                }}
              >
                Mark Safe
              </button>
              <button
                onClick={() => submitFeedback("Suspicious")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)"
                }}
              >
                Mark Suspicious
              </button>
              <button
                onClick={() => submitFeedback("Dangerous")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)"
                }}
              >
                Mark Dangerous
              </button>
            </div>
            {feedbackMessage && (
              <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>
                {feedbackMessage}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UrlChecker;
