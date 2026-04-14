import { useState, useRef } from "react";
import "./VoiceDetector.css";

function VoiceDetector() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-US");

  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported. Use Chrome.");
      return;
    }

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
    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
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
      </div>

      {/* RESULT */}
      {result && (
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
      )}
    </div>
  );
}

export default VoiceDetector;