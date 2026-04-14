from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import pickle
import re
import sqlite3
from urllib import error as urllib_error
from urllib import parse as urllib_parse
from urllib import request as urllib_request

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and vectorizer
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODELS_DIR, 'spam_model.pkl')
VECTORIZER_PATH = os.path.join(MODELS_DIR, 'vectorizer.pkl')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
KNOWN_PHISHING_DOMAINS_PATH = os.path.join(DATA_DIR, 'known_phishing_domains.txt')
DB_PATH = os.path.join(DATA_DIR, 'scamshield.db')
SAFE_BROWSING_API_KEY = os.getenv("SAFE_BROWSING_API_KEY")
URL_REGEX = re.compile(r"(?i)\b((?:https?://|www\.)[^\s<>'\"]+)")
SHORTENER_DOMAINS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "cutt.ly",
    "rb.gy",
    "is.gd",
    "ow.ly",
    "shorturl.at",
    "rebrand.ly",
}
SUSPICIOUS_TLDS = {
    "zip",
    "click",
    "top",
    "gq",
    "work",
    "country",
    "kim",
    "tk",
    "ml",
    "ru",
}

if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
    raise RuntimeError("Model files not found. Run train_model.py first.")

with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

with open(VECTORIZER_PATH, 'rb') as f:
    cv = pickle.load(f)


def load_known_phishing_domains():
    if not os.path.exists(KNOWN_PHISHING_DOMAINS_PATH):
        return set()

    with open(KNOWN_PHISHING_DOMAINS_PATH, 'r', encoding='utf-8') as file:
        return {
            line.strip().lower()
            for line in file
            if line.strip() and not line.strip().startswith("#")
        }


KNOWN_PHISHING_DOMAINS = load_known_phishing_domains()


def get_db_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_database():
    os.makedirs(DATA_DIR, exist_ok=True)

    with get_db_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                input_text TEXT NOT NULL,
                probability REAL NOT NULL,
                label TEXT NOT NULL,
                risky_words TEXT NOT NULL,
                insights TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS scan_urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_id INTEGER NOT NULL,
                url TEXT NOT NULL,
                domain TEXT NOT NULL,
                status TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                reason TEXT NOT NULL,
                source TEXT NOT NULL,
                FOREIGN KEY (scan_id) REFERENCES scans (id) ON DELETE CASCADE
            );
            """
        )


def serialize_scan(row, urls):
    return {
        "id": row["id"],
        "inputText": row["input_text"],
        "createdAt": row["created_at"],
        "results": {
            "probability": int(round(row["probability"])),
            "label": row["label"],
            "riskyWords": json.loads(row["risky_words"]),
            "insights": json.loads(row["insights"]),
            "urls": urls,
        },
    }


def save_scan(input_text, probability, label, risky_words, insights, urls):
    with get_db_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO scans (input_text, probability, label, risky_words, insights)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                input_text,
                probability,
                label,
                json.dumps(risky_words),
                json.dumps(insights),
            ),
        )
        scan_id = cursor.lastrowid

        if urls:
            connection.executemany(
                """
                INSERT INTO scan_urls (scan_id, url, domain, status, risk_score, reason, source)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        scan_id,
                        item["url"],
                        item["domain"],
                        item["status"],
                        item["riskScore"],
                        item["reason"],
                        item["source"],
                    )
                    for item in urls
                ],
            )

    return scan_id


def fetch_scan_history(limit=10):
    with get_db_connection() as connection:
        scan_rows = connection.execute(
            """
            SELECT id, input_text, probability, label, risky_words, insights, created_at
            FROM scans
            ORDER BY datetime(created_at) DESC, id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

        if not scan_rows:
            return []

        scan_ids = [row["id"] for row in scan_rows]
        placeholders = ",".join("?" for _ in scan_ids)
        url_rows = connection.execute(
            f"""
            SELECT scan_id, url, domain, status, risk_score, reason, source
            FROM scan_urls
            WHERE scan_id IN ({placeholders})
            ORDER BY id ASC
            """,
            scan_ids,
        ).fetchall()

    urls_by_scan = {}
    for row in url_rows:
        urls_by_scan.setdefault(row["scan_id"], []).append(
            {
                "url": row["url"],
                "domain": row["domain"],
                "status": row["status"],
                "riskScore": row["risk_score"],
                "reason": row["reason"],
                "source": row["source"],
            }
        )

    return [serialize_scan(row, urls_by_scan.get(row["id"], [])) for row in scan_rows]


init_database()

class TextData(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "ScamShield API is running"}


@app.get("/api/history")
def get_history(limit: int = 10):
    safe_limit = max(1, min(limit, 50))
    return {"items": fetch_scan_history(safe_limit)}

def normalize_text(text: str) -> str:
    """Removes common scammer obfuscation (e.g., f.r.e.e, pr1ze)."""
    normalized = text.lower()
    # Remove common separators used to bypass filters
    for char in ['.', '-', '_', '*', ' ']:
        normalized = normalized.replace(char, '')
    # Basic leet-speak conversion
    leets = {'1': 'i', '0': 'o', '3': 'e', '4': 'a', '5': 's', '7': 't'}
    for k, v in leets.items():
        normalized = normalized.replace(k, v)
    return normalized


def extract_urls(text: str):
    urls = []
    seen = set()

    for match in URL_REGEX.findall(text):
        candidate = match.rstrip('.,);!?"\'')
        normalized = candidate if candidate.lower().startswith(('http://', 'https://')) else f"https://{candidate}"
        if normalized not in seen:
            seen.add(normalized)
            urls.append(normalized)

    return urls


def get_domain(url: str):
    parsed = urllib_parse.urlparse(url)
    return parsed.netloc.lower().lstrip("www.")


def check_google_safe_browsing(urls):
    if not SAFE_BROWSING_API_KEY or not urls:
        return {}

    endpoint = (
        "https://safebrowsing.googleapis.com/v4/threatMatches:find"
        f"?key={SAFE_BROWSING_API_KEY}"
    )
    payload = {
        "client": {
            "clientId": "scamshield",
            "clientVersion": "1.0.0",
        },
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url} for url in urls],
        },
    }

    request = urllib_request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib_request.urlopen(request, timeout=4) as response:
            body = json.loads(response.read().decode("utf-8"))
    except (urllib_error.URLError, TimeoutError, json.JSONDecodeError):
        return {}

    matches_by_url = {}
    for match in body.get("matches", []):
        matched_url = match.get("threat", {}).get("url")
        if matched_url:
            matches_by_url.setdefault(matched_url, []).append(match.get("threatType", "UNKNOWN"))
    return matches_by_url


def analyze_urls(text: str):
    extracted_urls = extract_urls(text)
    safe_browsing_matches = check_google_safe_browsing(extracted_urls)
    results = []
    insights = []

    for url in extracted_urls:
        parsed = urllib_parse.urlparse(url)
        domain = get_domain(url)
        reasons = []
        risk_score = 0

        if domain in KNOWN_PHISHING_DOMAINS:
            reasons.append("Domain matches local phishing blacklist")
            risk_score += 85

        if domain in SHORTENER_DOMAINS:
            reasons.append("Shortened URL hides the final destination")
            risk_score += 25

        if re.fullmatch(r"\d{1,3}(?:\.\d{1,3}){3}", domain):
            reasons.append("Direct IP-based URL instead of a normal domain")
            risk_score += 30

        hostname = parsed.hostname or ""
        if "xn--" in hostname:
            reasons.append("Punycode domain can imitate trusted brands")
            risk_score += 35

        tld = domain.rsplit(".", 1)[-1] if "." in domain else ""
        if tld in SUSPICIOUS_TLDS:
            reasons.append(f"High-risk top-level domain .{tld}")
            risk_score += 20

        if safe_browsing_matches.get(url):
            threat_types = ", ".join(safe_browsing_matches[url])
            reasons.append(f"Google Safe Browsing flagged this URL: {threat_types}")
            risk_score += 100

        if not reasons:
            status = "clean"
            reason = "No phishing indicators found"
        else:
            status = "danger" if risk_score >= 70 else "warning"
            reason = "; ".join(reasons)

        results.append({
            "url": url,
            "domain": domain,
            "status": status,
            "riskScore": min(risk_score, 100),
            "reason": reason,
            "source": "google-safe-browsing" if safe_browsing_matches.get(url) else "local-heuristics",
        })

    if any(item["status"] == "danger" for item in results):
        insights.append("Detected link matches phishing indicators")
    elif results:
        insights.append("Detected links need extra caution before opening")

    return results, insights

@app.post("/api/analyze")
def analyze_text(data: TextData):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    original_text = data.text
    clean_text = original_text.lower()
    normalized = normalize_text(original_text)
    url_results, url_insights = analyze_urls(original_text)
    
    # 1. ML Prediction
    vect_text = cv.transform([original_text])
    probabilities = model.predict_proba(vect_text)[0]
    spam_prob = probabilities[1] * 100
    
    # 2. Heuristic Analysis & Insights
    insights = []
    heuristic_score = 0
    
    # Check for Urgency
    urgency_words = ["urgent", "immediate", "action required", "expiring", "last chance", "limited time"]
    if any(word in clean_text for word in urgency_words):
        insights.append("High-pressure urgency tactics detected")
        heuristic_score += 20
        
    # Check for Authority Impersonation
    authorities = ["bank", "irs", "hmrc", "police", "amazon", "netflix", "fedex", "ups", "dhl", "microsoft", "apple"]
    if any(auth in clean_text for auth in authorities):
        insights.append("Potential impersonation of a trusted authority")
        heuristic_score += 15
        
    # Check for Obfuscation
    if normalized != clean_text.replace(' ', ''):
        # Only flag if there's a significant difference that looks like obfuscation
        insights.append("Character obfuscation detected (bypassing filters)")
        heuristic_score += 25

    # Check for Financial Bait
    financial_bait = ["cash", "prize", "reward", "win", "dollars", "pounds", "unclaimed", "refund", "tax"]
    if any(word in clean_text for word in financial_bait):
        insights.append("Financial bait/incentive detected")
        heuristic_score += 20

    if url_results:
        heuristic_score += min(max(item["riskScore"] for item in url_results), 35)
        insights.extend(url_insights)

    # 3. Combine Scores (Weighted average of ML and Heuristics)
    final_prob = (spam_prob * 0.7) + (min(heuristic_score, 100) * 0.3)
    final_prob = min(max(final_prob, 0), 100)
    
    # Determine risk level
    risk_level = "Safe"
    if final_prob > 35:
        risk_level = "Suspicious"
    if final_prob > 70:
        risk_level = "Scam"
        
    # Risky keywords for highlighting
    risky_keywords = ["win", "prize", "claim", "urgent", "call", "text", "free", "reward", "txt", "mobile", "stop", "cash", "now", "reply", "bank", "account", "verify", "link"]
    found_keywords = [word for word in risky_keywords if word in original_text.lower()]
    
    insights_payload = insights if insights else ["No significant threats patterns detected"]

    response_payload = {
        "text": original_text,
        "probability": round(final_prob, 2),
        "label": risk_level,
        "riskyWords": found_keywords,
        "insights": insights_payload,
        "urls": url_results,
    }

    scan_id = save_scan(
        input_text=original_text,
        probability=round(final_prob, 2),
        label=risk_level,
        risky_words=found_keywords,
        insights=insights_payload,
        urls=url_results,
    )
    response_payload["scanId"] = scan_id

    return response_payload

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
