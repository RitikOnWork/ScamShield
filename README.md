# ScamShield – Real-Time Fraud & Scam Detection System

ScamShield is a multi-layered security platform designed to detect and flag fraudulent activities across various communication channels.

## Project Structure

- `frontend/`: React + Vite application containing the user interface.
  - `src/components/TextScamDetector/`: Core component for analyzing text messages, emails, and SMS.
  - `src/utils/scamDetector.js`: Probabilistic analysis engine for text scoring.
- `backend/`: FastAPI service that serves the text-analysis model.
  - `main.py`: API entry point.
  - `models/`: Serialized vectorizer and trained classifier.

## Currently Implemented: Text Scam Detector

### Features
- **Scam Probability Score**: Calculates the likelihood of fraud using weighted keyword analysis and pattern matching.
- **Security Labeling**: Categorizes messages as **Safe**, **Suspicious**, or **Scam**.
- **Risky Word Highlighting**: Visually flags dangerous keywords and urgent phrases.
- **URL Phishing Checks**: Extracts URLs from messages and scores them using local phishing indicators, with optional Google Safe Browsing support.
- **Persistent Scan History**: Saves recent analyses and detected links in a local SQLite database so results survive refreshes.
- **Modern Aesthetic**: Dark mode, glassmorphism design with fluid animations.

## How to Run

1. Start the backend:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open the Vite URL shown in the terminal. Frontend API requests to `/api/*` are proxied to `http://127.0.0.1:8000`.

Optional:
- Set `SAFE_BROWSING_API_KEY` before starting the backend to enable Google Safe Browsing URL lookups.

Saved history:
- The backend creates `backend/data/scamshield.db` automatically and stores scan summaries plus detected URL results there.

## Production Build

```bash
cd frontend
npm run build
```

## Future Roadmap
- [ ] **URL Scanner**: Check links against global phishing databases.
- [ ] **Email Header Analysis**: Detect spoofing and impersonation.
- [ ] **Voice AI Detector**: Real-time analysis of call transcripts for social engineering patterns.
