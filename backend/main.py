from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import pickle
import re
from urllib.parse import urlparse

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

class FeedbackData(BaseModel):
    input_data: str
    original_label: str
    user_label: str
    type: str  # 'text', 'url', or 'voice'


FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), "feedback.json")

@app.get("/")
def read_root():
    return {"message": "ScamShield API is running"}

# 🔗 ADVANCED URL ANALYZER
def analyze_url(url: str):
    normalized_url = url.strip()
    parsed_url = urlparse(normalized_url if "://" in normalized_url else f"https://{normalized_url}")
    domain = parsed_url.netloc.lower()
    if not domain:
        domain = parsed_url.path.lower()

    url_lower = normalized_url.lower()
    risk = 0
    reasons = []

    # 1. TLD Reputation Check
    sketchy_tlds = [".xyz", ".top", ".pw", ".tk", ".ml", ".ga", ".cf", ".gq", ".biz", ".info", ".live", ".click", ".win", ".icu"]
    for tld in sketchy_tlds:
        if domain.endswith(tld):
            risk += 2
            reasons.append(f"Low-reputation TLD detected ({tld})")
            break

    # 2. Brand Impersonation Check (Homograph/Spoofing)
    trusted_brands = ["amazon", "paypal", "google", "microsoft", "netflix", "apple", "facebook", "instagram", "linkedin", "bank", "wallet", "binance", "coinbase"]
    # Check if a brand name is in the domain but it's not the primary domain
    # Example: amazon-login.xyz or verify-paypal.com
    for brand in trusted_brands:
        if brand in domain:
            # If it contains the brand but isn't the primary trusted one (simplified check)
            # This is a heuristic that flags things like 'amazon-security.com'
            if not (domain.endswith(f"{brand}.com") or domain.endswith(f"{brand}.org") or domain.endswith(f"{brand}.net")):
                 risk += 2
                 reasons.append(f"Possible brand impersonation detected ({brand})")

    # 3. URL Length and Complexity
    if len(normalized_url) > 65:
        risk += 1
        reasons.append("URL is unusually long (common in phishing)")

    if normalized_url.count("-") > 3 or normalized_url.count("@") > 0:
        risk += 1
        reasons.append("Contains excessive hyphens or special symbols")

    # 4. Keyword Discovery
    keywords = ["login", "verify", "secure", "bank", "update", "account", "signin", "password", "gift", "prize", "claim", "limited-time"]
    found_keywords = [word for word in keywords if word in url_lower]
    if found_keywords:
        risk += 1
        reasons.append(f"Deceptive keywords found: {', '.join(found_keywords)}")

    # 5. Technical Red Flags
    if domain.count(".") > 3:
        risk += 1
        reasons.append("Abnormal number of subdomains")

    # IP as Host Check
    ip_pattern = r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
    if re.match(ip_pattern, domain):
        risk += 3
        reasons.append("Raw IP address used as host (highly suspicious)")

    # HTTPS check
    if not normalized_url.lower().startswith("https://"):
        risk += 1
        reasons.append("Not using secure HTTPS encryption")

    # URL Shorteners
    shorteners = ["bit.ly", "goo.gl", "t.co", "tinyurl.com", "buff.ly", "is.gd", "ow.ly"]
    for s in shorteners:
        if s in domain:
            risk += 1
            reasons.append("Redirected through a URL shortener (hides destination)")

    # Final Classification
    if risk == 0:
        label = "Safe"
    elif risk <= 2:
        label = "Suspicious"
    else:
        label = "Dangerous"

    return {
        "url": normalized_url,
        "label": label,
        "risk_score": min(risk * 10, 100),  # Normalize score to 0-100 for visual meter
        "reasons": reasons if reasons else ["No known threats detected"]
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

# 🔄 FEEDBACK LOOP
@app.post("/api/feedback")
def save_feedback(data: FeedbackData):
    feedbacks = []
    if os.path.exists(FEEDBACK_FILE):
        try:
            with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                feedbacks = json.load(f)
        except (json.JSONDecodeError, OSError):
            feedbacks = []

    feedbacks.append(data.model_dump())

    with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
        json.dump(feedbacks, f, indent=2)

    return {"message": "Feedback received! This will help improve the model."}

# RUN SERVER
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
