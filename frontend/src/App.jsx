import React from 'react';
import { motion } from 'framer-motion';
import TextScamDetector from './components/TextScamDetector/TextScamDetector';
import UrlChecker from "./components/UrlChecker/UrlChecker";
import { Shield, Lock, Eye, Zap, Sun, Moon } from 'lucide-react';
import './App.css';

function App() {
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');
  const [activeTab, setActiveTab] = React.useState("text");

  React.useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-shell">
      
      {/* HEADER */}
      <header className="main-header">
        <div className="container header-content">
          
          <div className="logo">
            <Shield className="logo-icon" size={32} />
            <h1>Scam<span className="gradient-text">Shield</span></h1>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            
            <ul className="nav-links">
              <li 
                className={activeTab === "text" ? "active" : ""}
                onClick={() => setActiveTab("text")}
                style={{ cursor: "pointer" }}
              >
                Text Detector
              </li>

              <li 
                className={activeTab === "url" ? "active" : ""}
                onClick={() => setActiveTab("url")}
                style={{ cursor: "pointer" }}
              >
                Link Scan
              </li>

              <li className="disabled">Voice AI</li>
            </ul>

            <button 
              onClick={toggleTheme} 
              className="theme-toggle"
              aria-label="Toggle Theme"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)'
              }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
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
            Our AI analyzes patterns and keywords to keep you safe.
          </p>
        </section>

        {/* FEATURE TITLE */}
        <h3 style={{ marginTop: "30px", textAlign: "center" }}>
          {activeTab === "text" ? "📩 Message Analysis" : "🔗 URL Analysis"}
        </h3>

        {/* DYNAMIC COMPONENT */}
        {activeTab === "text" && <TextScamDetector />}
        {activeTab === "url" && <UrlChecker />}

        {/* FEATURES */}
        <section className="features-grid">
          <div className="feature-card glass-card">
            <Lock className="feature-icon" color="var(--accent-primary)" />
            <h3>Privacy First</h3>
            <p>Your data is processed locally and never stored on our servers.</p>
          </div>

          <div className="feature-card glass-card">
            <Zap className="feature-icon" color="var(--accent-secondary)" />
            <h3>Instant Analysis</h3>
            <p>Real-time keyword mapping and probability scoring.</p>
          </div>

          <div className="feature-card glass-card">
            <Eye className="feature-icon" color="var(--status-safe)" />
            <h3>Pattern Recognition</h3>
            <p>Identifies complex linguistic manipulation tactics.</p>
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
