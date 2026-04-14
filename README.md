# 🛡️ ScamShield – AI-Powered Fraud & Scam Detection

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Machine_Learning-FF6F00?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="ML" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</div>

---

## 🌟 Overview
**ScamShield** is a cutting-edge, real-time security platform designed to protect users from the increasing wave of digital fraud. By leveraging **Hybrid AI** (Machine Learning + Rule-based Heuristics), ScamShield analyzes text, URLs, and even live voice conversations to identify potential scams before they cause harm.

Our mission is to provide **Explainable AI**—not just telling you something is a scam, but explaining *why* it was flagged, empowering users with knowledge and safety.

---

## ✨ Why ScamShield Stands Out
> **AI that not only detects scams — but explains them.**

### 🛠️ Unique Capabilities
- **Behavior-Based Detection**: Identifies urgency language, repeated manipulation patterns, and pressure tactics in real time.
- **Scam Type Classification**: Categorizes threats as Phishing, Job Scam, or Banking Fraud for targeted user guidance.
- **Explainable AI**: Surfaces the exact trigger words and risk factors behind every detection decision.

### 🌍 Real-World Impact
- **Prevent Financial Fraud**: Stop scams before users act on them to prevent monetary loss.
- **Increase Awareness**: Educate users during the detection process so they recognize scams independently over time.
- **Accessible for Everyone**: Designed with a clean, intuitive interface for non-technical users of all backgrounds.

---

### 📩 1. Text Scam Detector
Harnesses the power of NLP to dissect messages for deceptive patterns.
- **AI Classification**: Real-time prediction using a trained Scikit-Learn model.
- **Probability Scoring**: Get a precise risk percentage (0-100%).
- **Smart Labels**: Dynamic classification as **Safe**, **Suspicious**, or **Scam**.
- **Contextual Insights**: Detects urgency, authority impersonation, and financial bait.
- **Keyword Highlighting**: Automatically identifies and flags high-risk words within the text.

### 🔗 2. URL Scam Analyzer
Deep-dives into link structures to prevent phishing attacks.
- **Heuristic Engine**: Checks protocol security (HTTPS), subdomain counts, and domain length.
- **Phishing Detection**: Identifies suspicious keywords like *login, bank, verify, secure*.
- **Visual Risk Meter**: A sleek progress bar visualizing the threat level.
- **Explainable Results**: Detailed breakdown of every risk factor found in the URL.

### 🎤 3. Voice Scam Detector (New!)
Live analysis for voice calls and conversations.
- **Speech-to-Text**: Real-time transcription using the browser's Speech Recognition API.
- **Multi-Language Support**: Choose between **English 🇺🇸** and **Hindi 🇮🇳**.
- **Real-time Pipeline**: Streamed transcription is instantly sent to the ML backend for analysis.
- **Visual Feedback**: Animated voice waveform during active listening.

---

## 🧠 The "Hybrid AI" Engine

ScamShield doesn't just rely on one method. It uses a **multi-layered approach**:

1.  **Machine Learning Layer**: A `CountVectorizer` + `Naive Bayes` model trained on a massive spam dataset (`spam.csv`).
2.  **Heuristic Layer**: A custom Python engine that evaluates sentiment, urgency, and specific fraud indicators.
3.  **Pattern Recognition**: Detects URL obfuscation and character-swapping tricks used by scammers.
4.  **Ensemble Score**: Combines ML probability with heuristic risk scores for a high-precision final result.

---

## 🛠️ Tech Stack

### **Frontend (The Experience)**
- **React (Vite)**: For a blazing-fast, modern development experience.
- **Framer Motion**: Smooth, high-end micro-animations and transitions.
- **Lucide Icons**: Beautiful, consistent iconography.
- **CSS3 (Custom)**: Glassmorphic UI design with a focus on accessibility and dark mode.

### **Backend (The Brains)**
- **FastAPI**: High-performance Python framework for building APIs.
- **Scikit-Learn**: Powering the machine learning predictions.
- **Pandas/NumPy**: Efficient data handling and processing.
- **Uvicorn**: Lightning-fast ASGI server.

---

## ⚙️ Quick Start

Experience ScamShield locally in just a few steps:

### 1. Clone & Setup
```bash
git clone https://github.com/RitikOnWork/ScamShield.git
cd ScamShield
```

### 2. Launch Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*API will be live at: [http://localhost:8000](http://localhost:8000)*

### 3. Launch Frontend
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```
*App will be live at: [http://localhost:5173](http://localhost:5173)*

---

## 📁 Project Architecture
```text
ScamShield/
├── backend/                # FastAPI & ML Core
│   ├── models/            # Trained ML models (.pkl)
│   ├── main.py            # API Endpoints & Logic
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/    # Feature-specific components
│   │   ├── utils/         # Helper functions
│   │   └── App.jsx        # Main application layout
└── spam.csv                # Training dataset
```

---

## 🔮 Roadmap
- [ ] **Phishing DB**: Integration with Google Safe Browsing API.
- [ ] **Email Analysis**: Direct `.eml` file upload and header analysis.
- [ ] **Browser Extension**: Real-time protection while browsing.
- [ ] **History & Logs**: Save scan results for future reference.

---

## 👨‍💻 Contributors
- **Ritik Raj** ([@RitikOnWork](https://github.com/RitikOnWork))
- **Shivangi Joshi** ([@Shivangi-121](https://github.com/Shivangi-121))
- **Rupesh Kumar** ([@Rupesh576](https://github.com/Rupesh576))

---
<div align="center">
  Built with ❤️ for a safer internet.
</div>
