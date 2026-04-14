# 🛡️ ScamShield – Real-Time Fraud & Scam Detection System

ScamShield is an AI-powered security platform designed to detect and prevent scams across text messages and URLs using machine learning and intelligent pattern analysis. It provides real-time detection along with explainable insights to help users understand why something is flagged as risky.

---

## 🚀 Features

### 📩 Text Scam Detector
- 🤖 AI-based classification using a trained machine learning model  
- 📊 Scam probability score (in percentage)  
- 🏷️ Labels: **Safe / Suspicious / Scam**  
- 🔍 Detects:
  - Urgency tactics  
  - Authority impersonation  
  - Financial bait  
  - Obfuscation tricks  
- ✨ Highlights risky keywords  
- 💡 Provides explainable insights  

---

### 🔗 URL Scam Analyzer
- 🌐 Detects phishing and malicious links  
- ⚠️ Identifies:
  - Fake domains  
  - Suspicious keywords (*login, verify, bank*)  
  - Insecure protocols (HTTP)  
  - Too many subdomains  
- 🎯 Risk classification: **Safe / Suspicious / Dangerous**  
- 📊 Visual risk meter (progress bar)  
- 🔍 Highlights risky keywords inside URL  
- 💡 Explains why the URL is flagged  

---

## 🧠 How It Works

### 1️⃣ Machine Learning Layer
Text is processed using NLP techniques and passed through a trained model to predict scam probability.

### 2️⃣ Heuristic Layer
Rule-based checks detect patterns like urgency, impersonation, and financial bait.

### 3️⃣ URL Analysis Engine
Analyzes URL structure, keywords, protocol security, and domain patterns.

### 4️⃣ Explainable AI
Shows *why* a message or URL is classified as risky.

---

## 🖥️ Tech Stack

### Frontend
- ⚛️ React (Vite)
- 🎨 Glassmorphism UI + Dark Mode
- ⚡ Framer Motion

### Backend
- ⚡ FastAPI (Python)
- 🤖 Scikit-learn
- 📦 NumPy
- 💾 Pickle

---

## 📁 Project Structure
ScamShield/
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── TextScamDetector/
│ │ │ └── UrlChecker/
│ │ ├── App.jsx
│
├── backend/
│ ├── main.py
│ ├── models/
│
└── README.md


---

## ⚙️ How to Run

### 🔹 Backend

```bash
cd backend
pip install fastapi uvicorn scikit-learn numpy
python -m uvicorn main:app --reload
Backend runs on:
👉 http://localhost:8000

🔹 Frontend
Bash
cd frontend
npm install
npm run dev

Frontend runs on:
👉 http://localhost:5173

🧪 Sample Test Cases
🔴 Dangerous URL

http://secure-bank-login.xyz/verify-account
🟡 Suspicious URL

http://amazon-offers-deal.com
🟢 Safe URL

https://www.google.com


🏆 Key Highlights
🔥 Real-time scam detection
🧠 Hybrid AI (ML + rule-based)
💡 Explainable AI outputs
📊 Visual risk indicators
🎨 Clean modern UI

🔮 Future Scope
🎙️ Voice scam detection
📧 Email header analysis
🌍 Phishing database integration
🧩 Browser extension

👨‍💻 Contributors
Ritik
Shivangi
Rupesh







