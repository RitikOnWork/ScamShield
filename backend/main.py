from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODELS_DIR, 'spam_model.pkl')
VECTORIZER_PATH = os.path.join(MODELS_DIR, 'vectorizer.pkl')

with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

with open(VECTORIZER_PATH, 'rb') as f:
    cv = pickle.load(f)

# Models
class TextData(BaseModel):
    text: str

class URLData(BaseModel):
    url: str

@app.get("/")
def read_root():
    return {"message": "ScamShield API is running"}

# 🔗 URL ANALYZER
def analyze_url(url: str):
    url_lower = url.lower()
    risk = 0
    reasons = []

    if len(url) > 50:
        risk += 1
        reasons.append("URL is unusually long")

    if "@" in url or "-" in url:
        risk += 1
        reasons.append("Contains suspicious characters")

    keywords = ["login", "verify", "secure", "bank", "update"]
    for word in keywords:
        if word in url_lower:
            risk += 1
            reasons.append(f"Suspicious keyword: {word}")

    if url.count(".") > 3:
        risk += 1
        reasons.append("Too many subdomains")

    if not url.startswith("https"):
        risk += 1
        reasons.append("Not using HTTPS")

    if risk == 0:
        label = "Safe"
    elif risk <= 2:
        label = "Suspicious"
    else:
        label = "Dangerous"

    return {
        "url": url,
        "label": label,
        "risk_score": risk,
        "reasons": reasons if reasons else ["No major issues detected"]
    }

# 🧠 TEXT ANALYSIS
@app.post("/api/analyze")
def analyze_text(data: TextData):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    text = data.text.lower()

    vect_text = cv.transform([data.text])
    prob = model.predict_proba(vect_text)[0][1] * 100

    insights = []
    score = 0

    if "urgent" in text:
        insights.append("Urgency detected")
        score += 20

    if "bank" in text:
        insights.append("Bank impersonation")
        score += 15

    if "win" in text or "prize" in text:
        insights.append("Financial bait detected")
        score += 20

    if "http" in text:
        insights.append("Contains suspicious link")
        score += 25

    final_prob = (prob * 0.7) + (score * 0.3)

    label = "Safe"
    if final_prob > 35:
        label = "Suspicious"
    if final_prob > 70:
        label = "Scam"

    return {
        "text": data.text,
        "probability": round(final_prob, 2),
        "label": label,
        "insights": insights if insights else ["No major threats detected"]
    }

# 🔗 URL API
@app.post("/api/check-url")
def check_url(data: URLData):
    if not data.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    return analyze_url(data.url)

# RUN SERVER
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
