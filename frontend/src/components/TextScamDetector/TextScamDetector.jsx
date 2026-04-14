import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Search,
  Trash2,
  Sparkles,
  History,
  Download,
  RotateCcw,
  Link2,
  ShieldX,
  ShieldQuestion,
} from 'lucide-react';
import { analyzeText, SCAM_KEYWORDS } from '../../utils/scamDetector';
import './TextScamDetector.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const SAMPLE_MESSAGES = [
  {
    id: 'bank-urgent',
    label: 'Bank Alert Scam',
    text: 'URGENT: Your account has been suspended. Verify your login immediately at bit.ly/secure-bank to avoid lockout.',
  },
  {
    id: 'gift-card',
    label: 'Gift Card Scam',
    text: 'Hi this is your manager. Need immediate action: buy gift cards worth $500 and send codes right now.',
  },
  {
    id: 'safe-note',
    label: 'Safe Message',
    text: 'Hey! Running 10 minutes late for dinner. See you soon and text me if plans change.',
  },
];

const TextScamDetector = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [historyError, setHistoryError] = useState('');

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history?limit=5`);
      if (!response.ok) {
        throw new Error('Unable to load history');
      }

      const data = await response.json();
      setAnalysisHistory(data.items || []);
      setHistoryError('');
    } catch (error) {
      console.error('Error loading history:', error);
      setHistoryError('Saved scan history is unavailable while the backend is offline.');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const scoreTone = (probability) => {
    if (probability > 70) return 'danger';
    if (probability > 40) return 'warning';
    return 'safe';
  };

  const getToneColor = (probability) => {
    const tone = scoreTone(probability);
    if (tone === 'danger') return 'var(--status-danger)';
    if (tone === 'warning') return 'var(--status-warning)';
    return 'var(--status-safe)';
  };

  const getUrlStatusIcon = (status) => {
    if (status === 'danger') return <ShieldX size={16} color="var(--status-danger)" />;
    if (status === 'warning') return <ShieldQuestion size={16} color="var(--status-warning)" />;
    return <ShieldCheck size={16} color="var(--status-safe)" />;
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();

      // Map backend response to frontend structure
      const normalizedResults = {
        probability: Math.round(data.probability),
        label: data.label,
        riskyWords: data.riskyWords,
        insights: data.insights,
        urls: data.urls || [],
      };
      setResults(normalizedResults);
      await loadHistory();
    } catch (error) {
      console.error('Error analyzing text:', error);
      // Fallback to local analysis if backend fails
      const analysis = analyzeText(inputText);
      setResults(analysis);
      setHistoryError('Saved scan history is unavailable while the backend is offline.');
      setAnalysisHistory((prev) => [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          inputText,
          results: analysis,
        },
        ...prev,
      ].slice(0, 5));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setInputText('');
    setResults(null);
  };

  const highlightedText = useMemo(() => {
    if (!results || !inputText) return inputText;

    const words = inputText.split(/(\s+)/);

    return words.map((word, idx) => {
      const cleanWord = word.toLowerCase().trim().replace(/[.,!?;:]/g, '');
      const isRisky = SCAM_KEYWORDS.some((k) => k.word === cleanWord);

      if (isRisky) {
        return (
          <motion.span
            key={idx}
            className="risky-word"
            initial={{ backgroundColor: 'rgba(239, 68, 68, 0)' }}
            animate={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            {word}
          </motion.span>
        );
      }
      return word;
    });
  }, [results, inputText]);

  const exportLatestResult = () => {
    if (!results) return;

    const payload = {
      analyzedAt: new Date().toISOString(),
      inputText,
      ...results,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'scamshield-report.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="detector-container">
      <div className="input-section glass-card">
        <div className="input-header-row">
          <label>Message Content</label>
          {inputText && (
            <button onClick={reset} className="ghost-icon-btn" aria-label="Clear message">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <div className="sample-row" role="group" aria-label="Try sample messages">
          {SAMPLE_MESSAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="sample-pill"
              onClick={() => setInputText(sample.text)}
            >
              <Sparkles size={14} />
              {sample.label}
            </button>
          ))}
        </div>

        <div className="text-area-wrapper">
          <textarea
            className="scam-textarea"
            placeholder="Paste the SMS, email, or message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <div className="action-row">
          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
          >
            {isAnalyzing ? 'Scanning System...' : 'Analyze for Fraud'}
          </button>
          <button
            type="button"
            className="secondary-action-btn"
            onClick={() => setInputText('')}
            disabled={!inputText}
          >
            <RotateCcw size={16} />
            Clear Input
          </button>
        </div>
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
                <span className="result-value" style={{ color: getToneColor(results.probability) }}>
                  {results.probability}%
                </span>
                <div className="progress-bar-bg">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${results.probability}%` }}
                    style={{
                      height: '100%',
                      borderRadius: '4px',
                      background: getToneColor(results.probability),
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
                <span className={`status-badge status-${results.label.toLowerCase()}`}>{results.label}</span>
              </div>
            </div>

            {results.insights && results.insights.length > 0 && (
              <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                <h3 className="section-title-with-icon">
                  <Search size={18} />
                  Detection Insights
                </h3>
                <div className="insights-list">
                  {results.insights.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="insight-row"
                      style={{
                        borderLeft: `4px solid ${results.label === 'Scam' ? 'var(--status-danger)' : 'var(--status-warning)'}`,
                      }}
                    >
                      <AlertTriangle
                        size={14}
                        color={results.label === 'Scam' ? 'var(--status-danger)' : 'var(--status-warning)'}
                      />
                      {insight}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {results.urls && results.urls.length > 0 && (
              <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                <h3 className="section-title-with-icon">
                  <Link2 size={18} />
                  Detected Links
                </h3>
                <div className="url-list">
                  {results.urls.map((entry) => (
                    <div key={entry.url} className={`url-card url-${entry.status}`}>
                      <div className="url-card-header">
                        <div className="url-card-title">
                          {getUrlStatusIcon(entry.status)}
                          <span className="url-domain">{entry.domain}</span>
                        </div>
                        <span className={`status-badge status-${entry.status === 'clean' ? 'safe' : entry.status}`}>
                          {entry.status === 'clean' ? 'Clean' : entry.status === 'danger' ? 'Danger' : 'Warning'}
                        </span>
                      </div>
                      <a href={entry.url} target="_blank" rel="noreferrer" className="url-link">
                        {entry.url}
                      </a>
                      <p className="url-reason">{entry.reason}</p>
                      <small className="url-source">
                        Source: {entry.source} • Risk score: {entry.riskScore}%
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card" style={{ marginTop: '1.5rem' }}>
              <div className="section-heading-row">
                <h3 className="section-title-with-icon">
                  <Search size={16} />
                  Highlighted Risky Elements
                </h3>
                <button type="button" className="secondary-action-btn" onClick={exportLatestResult}>
                  <Download size={16} />
                  Export Report
                </button>
              </div>
              <div className="highlighted-text">{highlightedText}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {analysisHistory.length > 0 && (
        <div className="glass-card history-section">
          <div className="history-header">
            <h3 className="section-title-with-icon">
              <History size={18} />
              Recent Analyses
            </h3>
            <button type="button" className="secondary-action-btn" onClick={loadHistory}>
              Refresh History
            </button>
          </div>
          {historyError && <p className="history-note">{historyError}</p>}
          <div className="history-list">
            {analysisHistory.map((entry) => (
              <button
                type="button"
                key={entry.id}
                className="history-item"
                onClick={() => {
                  setInputText(entry.inputText);
                  setResults(entry.results);
                }}
              >
                <div className="history-item-meta">
                  <span className={`status-badge status-${entry.results.label.toLowerCase()}`}>
                    {entry.results.label}
                  </span>
                  <small>{new Date(entry.createdAt).toLocaleString()}</small>
                </div>
                <p>{entry.inputText.slice(0, 110)}{entry.inputText.length > 110 ? '…' : ''}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {analysisHistory.length === 0 && historyError && (
        <div className="glass-card history-section">
          <div className="history-header">
            <h3 className="section-title-with-icon">
              <History size={18} />
              Recent Analyses
            </h3>
          </div>
          <p className="history-note">{historyError}</p>
        </div>
      )}
    </div>
  );
};

export default TextScamDetector;
