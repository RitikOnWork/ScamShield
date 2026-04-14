export const SCAM_KEYWORDS = [
  { word: "urgent", weight: 0.8 },
  { word: "immediate", weight: 0.7 },
  { word: "action required", weight: 0.9 },
  { word: "suspended", weight: 0.8 },
  { word: "locked", weight: 0.7 },
  { word: "verify", weight: 0.6 },
  { word: "login", weight: 0.5 },
  { word: "click here", weight: 0.9 },
  { word: "won", weight: 0.95 },
  { word: "prize", weight: 0.85 },
  { word: "lottery", weight: 0.95 },
  { word: "cash", weight: 0.6 },
  { word: "reward", weight: 0.7 },
  { word: "bank", weight: 0.4 },
  { word: "account", weight: 0.3 },
  { word: "password", weight: 0.5 },
  { word: "security", weight: 0.4 },
  { word: "official", weight: 0.4 },
  { word: "tax", weight: 0.7 },
  { word: "refund", weight: 0.8 },
  { word: "irs", weight: 0.9 },
  { word: "hmrc", weight: 0.9 },
  { word: "gift card", weight: 0.95 },
  { word: "bit.ly", weight: 0.8 },
  { word: "tinyurl", weight: 0.8 },
  { word: "link", weight: 0.4 },
  { word: "dear customer", weight: 0.7 },
  { word: "dear user", weight: 0.7 },
  { word: "congratulations", weight: 0.8 },
  { word: "unclaimed", weight: 0.85 },
  { word: "inherited", weight: 0.9 },
  { word: "million", weight: 0.7 },
  { word: "dollars", weight: 0.6 },
  { word: "pay", weight: 0.3 },
  { word: "transfer", weight: 0.4 }
];

const URL_REGEX = /\b((?:https?:\/\/|www\.)[^\s<>'"]+)/gi;
const SHORTENER_DOMAINS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'cutt.ly',
  'rb.gy',
  'is.gd',
  'ow.ly',
  'shorturl.at',
  'rebrand.ly',
]);

const extractUrls = (text) => {
  const matches = text.match(URL_REGEX) || [];
  const seen = new Set();

  return matches
    .map((match) => match.replace(/[.,);!?]+$/g, ''))
    .map((match) => (match.startsWith('http') ? match : `https://${match}`))
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
};

const analyzeUrls = (text) => {
  const urls = extractUrls(text);

  return urls.map((url) => {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const reasons = [];
    let riskScore = 0;

    if (SHORTENER_DOMAINS.has(domain)) {
      reasons.push('Shortened URL hides the final destination');
      riskScore += 25;
    }

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) {
      reasons.push('Direct IP-based URL instead of a domain');
      riskScore += 30;
    }

    if (domain.includes('xn--')) {
      reasons.push('Punycode domain can imitate trusted brands');
      riskScore += 35;
    }

    const status = riskScore >= 70 ? 'danger' : riskScore > 0 ? 'warning' : 'clean';

    return {
      url,
      domain,
      status,
      riskScore,
      reason: reasons.length ? reasons.join('; ') : 'No phishing indicators found',
      source: 'local-fallback',
    };
  });
};

export const analyzeText = (text) => {
  if (!text || text.trim().length < 5) {
    return { probability: 0, label: "Safe", riskyWords: [], insights: [], urls: [] };
  }

  const lowerText = text.toLowerCase();
  let score = 0;
  const foundKeywords = [];

  SCAM_KEYWORDS.forEach(({ word, weight }) => {
    // Escape special characters for regex
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, "gi");
    const matches = text.match(regex);
    
    if (matches) {
      score += weight * matches.length;
      foundKeywords.push(word);
    }
  });

  // Check for common scam punctuation patterns: excess caps, many exclamation marks
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.3) score += 0.5;
  
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 3) score += 0.4;

  const urls = analyzeUrls(text);
  if (urls.length > 0) {
    score += Math.min(Math.max(...urls.map((item) => item.riskScore), 0) / 100, 0.8);
  }

  // Normalize probability (basic sigmoid or clamp)
  // Max score could be around 5-10 for a very obvious scam
  const probability = Math.min(Math.round((score / 5) * 100), 100);

  let label = "Safe";
  if (probability > 75) label = "Scam";
  else if (probability > 40) label = "Suspicious";

  const insights = [];
  if (urls.some((item) => item.status === 'danger')) {
    insights.push('Detected link matches phishing indicators');
  } else if (urls.length > 0) {
    insights.push('Detected links need extra caution before opening');
  }

  return {
    probability,
    label,
    riskyWords: foundKeywords,
    insights,
    urls
  };
};
