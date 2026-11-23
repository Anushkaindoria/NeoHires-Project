const bank = require("../data/questionBank.json");

// Role ke naam se question category decide karna
function pickCategory(role) {
  const r = (role || "").toLowerCase();
  if (/data|analyst|analytics|bi\b|business intelligence/.test(r)) return "data";
  if (/software|developer|engineer|sde|backend|frontend|full ?stack|web|app/.test(r)) return "software";
  return "hr";
}

// 6 questions ki list banana: pehle 2 HR, baaki role-wise
function buildQuestionSet(role) {
  const category = pickCategory(role);
  const hr = bank.hr.slice(0, 2);
  const roleQs = category === "hr" ? bank.hr.slice(2) : bank[category];
  return [...hr, ...roleQs].slice(0, 6);
}

// Ek answer ko score karna (0 se 10)
function scoreAnswer(answer, keywords) {
  const text = (answer || "").toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  const matched = keywords.filter((k) => text.includes(k.toLowerCase()));
  const keywordScore = Math.min(matched.length / Math.max(3, keywords.length * 0.5), 1);

  // Length: bahut chhota ya bahut lamba answer achha nahi
  let lengthScore = 1;
  if (words.length < 10) lengthScore = 0.3;
  else if (words.length < 25) lengthScore = 0.7;
  else if (words.length > 200) lengthScore = 0.8;

  const score = Math.round((keywordScore * 0.7 + lengthScore * 0.3) * 10);
  return { score: Math.max(1, Math.min(10, score)), matched, wordCount: words.length };
}

// Interviewer ka chhota reaction (answer ke hisaab se)
function reaction(score) {
  if (score >= 8) return "Great answer.";
  if (score >= 5) return "Okay, thank you.";
  return "Alright, noted.";
}

// Poore interview ki report banana (persona.js wale format mein)
function buildReport(results) {
  if (!results.length) {
    return {
      overallScore: 1, communication: 1, confidence: 1, relevance: 1,
      strengths: ["Interview started"],
      weaknesses: ["No answers were given"],
      tips: ["Try answering at least a few questions next time"],
      summary: "No answers were recorded.\nPlease attempt the interview again.",
    };
  }

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const round = (n) => Math.max(1, Math.min(10, Math.round(n)));

  const overall = avg(results.map((r) => r.score));
  const avgWords = avg(results.map((r) => r.wordCount));
  const relevance = avg(results.map((r) => Math.min(10, (r.matched.length / Math.max(1, r.total)) * 14)));
  const communication = avgWords >= 30 ? 8 : avgWords >= 15 ? 6 : 4;
  const confidence = round((overall + communication) / 2);

  const strengths = [];
  const weaknesses = [];
  const tips = [];

  if (overall >= 7) strengths.push("Answers covered most key concepts");
  if (avgWords >= 30) strengths.push("Detailed and well-explained answers");
  const best = [...results].sort((a, b) => b.score - a.score)[0];
  if (best.score >= 6) strengths.push(`Strong answer on: "${best.question}"`);

  const weak = results.filter((r) => r.score <= 4);
  if (weak.length) weaknesses.push(`Weak answers on ${weak.length} question(s)`);
  if (avgWords < 15) weaknesses.push("Answers were too short");
  if (relevance < 5) weaknesses.push("Missed important keywords and concepts");

  if (avgWords < 25) tips.push("Give longer answers with examples (aim for 30-60 words)");
  if (relevance < 5) tips.push("Revise core concepts for this role and use proper technical terms");
  tips.push("Use the STAR method (Situation, Task, Action, Result) for HR questions");

  if (!strengths.length) strengths.push("Completed the interview");
  if (!weaknesses.length) weaknesses.push("No major weaknesses found");

  return {
    overallScore: round(overall),
    communication,
    confidence,
    relevance: round(relevance),
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    tips: tips.slice(0, 3),
    summary: `You scored ${round(overall)}/10 overall across ${results.length} question(s).\n${
      overall >= 7 ? "Good performance, keep practising." : "Needs more practice on concepts and answer length."
    }`,
  };
}

module.exports = { buildQuestionSet, scoreAnswer, reaction, buildReport };