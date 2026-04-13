import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, ShieldAlert, Search, Trash2 } from 'lucide-react';
import { analyzeText, SCAM_KEYWORDS } from '../../utils/scamDetector';
import './TextScamDetector.css';

const TextScamDetector = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate AI processing time
    setTimeout(() => {
      const analysis = analyzeText(inputText);
      setResults(analysis);
      setIsAnalyzing(false);
    }, 800);
  };

  const reset = () => {
    setInputText('');
    setResults(null);
  };

  const highlightedText = useMemo(() => {
    if (!results || !inputText) return inputText;

    let segments = [inputText];
    
    // Simple word-by-word highlight for demonstration
    // In a production app, this would use a more robust regex-based splitting
    const words = inputText.split(/(\s+)/);
    
    return words.map((word, idx) => {
      const cleanWord = word.toLowerCase().trim().replace(/[.,!?;:]/g, '');
      const isRisky = SCAM_KEYWORDS.some(k => k.word === cleanWord);
      
      if (isRisky) {
        return (
          <motion.span 
            key={idx} 
            className="risky-word"
            initial={{ backgroundColor: "rgba(239, 68, 68, 0)" }}
            animate={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          >
            {word}
          </motion.span>
        );
      }
      return word;
    });
  }, [results, inputText]);

  return (
    <div className="detector-container">
      <div className="input-section glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>Message Content</label>
          {inputText && (
            <button onClick={reset} style={{ background: 'none', color: 'var(--text-secondary)' }}>
              <Trash2 size={18} />
            </button>
          )}
        </div>
        
        <div className="text-area-wrapper">
          <textarea
            className="scam-textarea"
            placeholder="Paste the SMS, email, or message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <button 
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !inputText.trim()}
        >
          {isAnalyzing ? "Scanning System..." : "Analyze for Fraud"}
        </button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="results-section"
          >
            <div className="results-grid">
              <div className="result-card">
                <span className="result-label">Scam Probability</span>
                <span className="result-value" style={{ 
                  color: results.probability > 70 ? 'var(--status-danger)' : 
                         results.probability > 40 ? 'var(--status-warning)' : 
                         'var(--status-safe)' 
                }}>
                  {results.probability}%
                </span>
                <div className="progress-bar-bg" style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '10px' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${results.probability}%` }}
                    style={{ 
                      height: '100%', 
                      borderRadius: '4px',
                      background: results.probability > 70 ? 'var(--status-danger)' : 
                                  results.probability > 40 ? 'var(--status-warning)' : 
                                  'var(--status-safe)' 
                    }} 
                  />
                </div>
              </div>

              <div className="result-card">
                <span className="result-label">Security Label</span>
                <div style={{ marginTop: '0.5rem' }}>
                  {results.label === 'Scam' && <ShieldAlert size={48} color="var(--status-danger)" />}
                  {results.label === 'Suspicious' && <AlertTriangle size={48} color="var(--status-warning)" />}
                  {results.label === 'Safe' && <ShieldCheck size={48} color="var(--status-safe)" />}
                </div>
                <span className={`status-badge status-${results.label.toLowerCase()}`}>
                  {results.label}
                </span>
              </div>
            </div>

            <div className="glass-card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                Highlighted Risky Elements
              </h3>
              <div className="highlighted-text">
                {highlightedText}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TextScamDetector;
