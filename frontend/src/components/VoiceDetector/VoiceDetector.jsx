import { useState, useRef } from "react";
import "./VoiceDetector.css";

function VoiceDetector() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    setError("");
    setFeedbackMessage("");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const text =
        event.results[event.results.length - 1][0].transcript;
      setTranscript(text);
      analyzeText(text);
    };

    recognition.onerror = (err) => {
      console.error(err);
      setError("Voice capture failed. Check microphone access and try again.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const analyzeText = async (text) => {
    setIsAnalyzing(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Voice transcript analysis failed.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult(null);
      setError(err.message || "Unable to analyze this recording.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitFeedback = async (userLabel) => {
    if (!result || !transcript) return;

    setFeedbackMessage("");
    try {
      const res = await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_data: transcript,
          original_label: result.label,
          user_label: userLabel,
          type: "voice",
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to save your feedback.");
      }

      setFeedbackMessage("Thanks. Your voice-analysis feedback was saved.");
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

  return (
    <div style={{ marginTop: "30px" }}>
      
      {/* INPUT CARD */}
      <div className="glass-card" style={{ padding: "20px" }}>
        <h3>🎤 Voice Scam Detector</h3>
        <p style={{ marginTop: "8px", color: "var(--text-secondary)" }}>
          Record a live call or spoken message and ScamShield will transcribe and analyze it.
        </p>

        {/* LANGUAGE SELECT */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            marginTop: "10px",
            padding: "10px",
            borderRadius: "8px",
            width: "100%",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)"
          }}
        >
          <option value="en-US">English 🇺🇸</option>
          <option value="hi-IN">Hindi 🇮🇳</option>
        </select>

        {/* BUTTON */}
        {!listening ? (
          <button
            onClick={startListening}
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
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={stopListening}
            style={{
              marginTop: "15px",
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "#ef4444",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            ⛔ Stop Recording
          </button>
        )}

        {/* WAVEFORM */}
        {listening && (
          <div className="waveform">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {/* TRANSCRIPT */}
        {transcript && (
          <p style={{ marginTop: "15px" }}>
            <strong>Transcript:</strong> {transcript}
          </p>
        )}

        {isAnalyzing && (
          <p style={{ marginTop: "15px", color: "var(--text-secondary)" }}>
            Analyzing transcript...
          </p>
        )}

        {error && (
          <p style={{ marginTop: "15px", color: "var(--status-danger)" }}>
            {error}
          </p>
        )}
      </div>

      {/* RESULT */}
      {result && (
        <>
          <div
            className="glass-card"
            style={{ padding: "20px", marginTop: "20px" }}
          >
            <h4>Result</h4>

            <h2 style={{ color: getColor() }}>
              {result.label}
            </h2>

            <p>Scam Probability: {result.probability}%</p>

            <ul style={{ marginTop: "10px" }}>
              {result.insights.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>

          <div
            className="glass-card"
            style={{ padding: "20px", marginTop: "20px" }}
          >
            <h4>Was this voice verdict accurate?</h4>
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
                onClick={() => submitFeedback("Scam")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)"
                }}
              >
                Mark Scam
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

export default VoiceDetector;
