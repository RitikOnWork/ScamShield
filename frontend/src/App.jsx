import React from 'react';
import TextScamDetector from './components/TextScamDetector/TextScamDetector';
import { Shield, Lock, Eye, Zap } from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <header className="main-header">
        <div className="container header-content">
          <div className="logo">
            <Shield className="logo-icon" size={32} />
            <h1>Scam<span className="gradient-text">Shield</span></h1>
          </div>
          <nav>
            <ul className="nav-links">
              <li className="active">Text Detector</li>
              <li className="disabled">Link Scan</li>
              <li className="disabled">Voice AI</li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <motion_h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-title"
          >
            Real-Time <span className="gradient-text">Fraud Detection</span>
          </motion_h2>
          <p className="hero-subtitle">
            Protect yourself from phishing, SMiShing, and social engineering. 
            Our AI analyzes patterns and keywords to keep you safe.
          </p>
        </section>

        <TextScamDetector />

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

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 ScamShield AI. Stay Safe Online.</p>
        </div>
      </footer>
    </div>
  );
}

// Simple wrapper for motion to avoid import issues if not using motion directly in App
const motion_h2 = ({children, className, ...props}) => (
  <h2 className={className} {...props}>{children}</h2>
);

export default App;
