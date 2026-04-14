import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TextScamDetector from "./components/TextScamDetector/TextScamDetector";
import UrlChecker from "./components/UrlChecker/UrlChecker";
import VoiceDetector from "./components/VoiceDetector/VoiceDetector";
import { Shield, Lock, Eye, Zap, Sun, Moon } from "lucide-react";
import "./App.css";

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );
  const [activeTab, setActiveTab] = useState("text");

  useEffect(() => {
    document.body.className = theme === "light" ? "light-theme" : "";
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // 🔥 Render active component
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "text":
        return <TextScamDetector />;
      case "url":
        return <UrlChecker />;
      case "voice":
        return <VoiceDetector />;
      default:
        return <TextScamDetector />;
    }
  };

  // 🔥 Dynamic title
  const getTitle = () => {
    switch (activeTab) {
      case "text":
        return "📩 Message Analysis";
      case "url":
        return "🔗 URL Analysis";
      case "voice":
        return "🎤 Voice Scam Detection";
      default:
        return "";
    }
  };

  return (
    <div className="app-shell">
      
      {/* HEADER */}
      <header className="main-header">
        <div className="container header-content">

          {/* LOGO */}
          <div className="logo">
            <Shield className="logo-icon" size={32} />
            <h1>
              Scam<span className="gradient-text">Shield</span>
            </h1>
          </div>

          {/* NAV */}
          <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <ul className="nav-links">
              <li
                className={activeTab === "text" ? "active" : ""}
                onClick={() => setActiveTab("text")}
              >
                📩 Text
              </li>

              <li
                className={activeTab === "url" ? "active" : ""}
                onClick={() => setActiveTab("url")}
              >
                🔗 URL
              </li>

              <li
                className={activeTab === "voice" ? "active" : ""}
                onClick={() => setActiveTab("voice")}
              >
                🎤 Voice
              </li>
            </ul>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle Theme"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                padding: "8px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-color)",
                cursor: "pointer",
              }}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="container">

        {/* HERO */}
        <section className="hero">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-title"
          >
            Real-Time <span className="gradient-text">Fraud Detection</span>
          </motion.h2>

          <p className="hero-subtitle">
            Protect yourself from phishing, SMiShing, and social engineering.
            Our AI analyzes patterns and behaviors to keep you safe.
          </p>
        </section>

        {/* FEATURE TITLE */}
        <h3 style={{ marginTop: "30px", textAlign: "center" }}>
          {getTitle()}
        </h3>

        {/* ACTIVE COMPONENT */}
        {renderActiveComponent()}

        {/* FEATURES */}
        <section className="features-grid">
          <div className="feature-card glass-card">
            <Lock className="feature-icon" color="var(--accent-primary)" />
            <h3>Privacy First</h3>
            <p>Your data is processed locally and never stored.</p>
          </div>

          <div className="feature-card glass-card">
            <Zap className="feature-icon" color="var(--accent-secondary)" />
            <h3>Instant Analysis</h3>
            <p>Real-time detection with AI-powered scoring.</p>
          </div>

          <div className="feature-card glass-card">
            <Eye className="feature-icon" color="var(--status-safe)" />
            <h3>Pattern Recognition</h3>
            <p>Detects hidden scam patterns and manipulative tactics.</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 ScamShield AI. Stay Safe Online.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;