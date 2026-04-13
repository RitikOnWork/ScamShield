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

export const analyzeText = (text) => {
  if (!text || text.trim().length < 5) {
    return { probability: 0, label: "Safe", riskyWords: [] };
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

  // Normalize probability (basic sigmoid or clamp)
  // Max score could be around 5-10 for a very obvious scam
  const probability = Math.min(Math.round((score / 5) * 100), 100);

  let label = "Safe";
  if (probability > 75) label = "Scam";
  else if (probability > 40) label = "Suspicious";

  return {
    probability,
    label,
    riskyWords: foundKeywords
  };
};
