# ScamShield – Real-Time Fraud & Scam Detection System

ScamShield is a multi-layered security platform designed to detect and flag fraudulent activities across various communication channels.

## Project Structure

- `frontend/`: React + Vite application containing the user interface.
  - `src/components/TextScamDetector/`: Core component for analyzing text messages, emails, and SMS.
  - `src/utils/scamDetector.js`: Probabilistic analysis engine for text scoring.
- `backend/`: (Planned) Node.js/Python microservices for advanced AI analysis and threat databases.
  - `api/`: REST/WebSocket endpoints.
  - `models/`: Machine learning model definitions.
  - `services/`: Business logic for different detection types.

## Currently Implemented: Text Scam Detector

### Features
- **Scam Probability Score**: Calculates the likelihood of fraud using weighted keyword analysis and pattern matching.
- **Security Labeling**: Categorizes messages as **Safe**, **Suspicious**, or **Scam**.
- **Risky Word Highlighting**: Visually flags dangerous keywords and urgent phrases.
- **Modern Aesthetic**: Dark mode, glassmorphism design with fluid animations.

## How to Run

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Future Roadmap
- [ ] **URL Scanner**: Check links against global phishing databases.
- [ ] **Email Header Analysis**: Detect spoofing and impersonation.
- [ ] **Voice AI Detector**: Real-time analysis of call transcripts for social engineering patterns.
