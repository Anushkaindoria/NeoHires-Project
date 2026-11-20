// Rule-based NLP helpers: koi external AI API nahi.
// Sab functions pure hain (DB/network nahi), isliye Jest se test karna easy hai.

const STOP = new Set(
  ("a an the and or of to in for on at by with from is are was were be been this that these those it its as " +
    "we you your our their they i me my will can should would could may might have has had do does did not no " +
    "if then than so such about into over under up down out more most other some any each per via etc please " +
    "tell what when where which who how").split(" ")
);

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const MONTH_ABBR = { jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };

// "ml" jaisi short forms ko expand karna
const SYNONYMS = {
  ml: ["machine", "learning"],
  ai: ["ai", "machine", "learning"],
  dev: ["developer", "development"],
  sde: ["software", "engineer"],
  swe: ["software", "engineer"],
  frontend: ["frontend", "front-end", "react", "ui"],
  backend: ["backend", "back-end", "node", "api"],
  web: ["web", "frontend", "backend"],
  data: ["data", "analyst", "analytics"],
};

// Query mein ye words search keywords nahi, sirf intent ke signals hain
const INTENT_WORDS = new Set([
  "hackathon","hackathons","hack","hacks","contest","contests","competition","competitions",
  "intern","interns","internship","internships","open","closing","soon","upcoming","closed",
  "urgent","deadline","last","date","apply","now","live","ending","find","show","give","list",
  "want","looking","available","opportunities","opportunity","openings","new","jobs","job",
]);

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((w) => w && !STOP.has(w));
}

// ---------- 1) Smart search: intent parsing ----------
function parseIntent(query = "") {
  const q = String(query).toLowerCase();
  const intent = { type: "all", status: null, month: null, keywords: [] };

  const wantsHack = /\b(hackathons?|hacks?|contests?|competitions?)\b/.test(q);
  const wantsIntern = /\b(interns?|internships?)\b/.test(q);
  if (wantsHack && !wantsIntern) intent.type = "hackathon";
  else if (wantsIntern && !wantsHack) intent.type = "internship";

  if (/closing soon|last date|ending soon|urgent|deadline (is )?(near|soon)|about to close/.test(q)) intent.status = "Closing Soon";
  else if (/\bupcoming\b/.test(q)) intent.status = "Upcoming";
  else if (/\bclosed\b/.test(q)) intent.status = "Closed";
  else if (/\b(open|apply now|live)\b/.test(q)) intent.status = "Open";

  // "may" ek common word bhi hai, isliye usse sirf "in/for/during may" jaise context mein month maante hain
  if (/\b(in|for|during|of|by|before)\s+may\b/.test(q)) intent.month = 4;

  const tokens = tokenize(q);
  for (const t of tokens) {
    const mi = MONTHS.indexOf(t);
    if (mi !== -1) intent.month = mi;
    else if (MONTH_ABBR[t] !== undefined) intent.month = MONTH_ABBR[t];
  }

  const kws = [];
  for (const t of tokens) {
    if (INTENT_WORDS.has(t) || MONTHS.includes(t) || MONTH_ABBR[t] !== undefined || t.length < 2) continue;
    if (SYNONYMS[t]) kws.push(...SYNONYMS[t]);
    else kws.push(t);
  }
  intent.keywords = [...new Set(kws)];
  return intent;
}

function listingMonth(item) {
  if (item.month) {
    const mi = MONTHS.indexOf(String(item.month).toLowerCase());
    if (mi !== -1) return mi;
  }
  return item.deadline ? new Date(item.deadline).getMonth() : null;
}

// items: [{ _kind: "internship"|"hackathon", ...fields }]
function rankListings(items, intent) {
  const fields = [
    ["name", 3], ["company", 3], ["role", 2], ["theme", 2], ["techStack", 2], ["skills", 2], ["eligibility", 1], ["type", 1],
  ];

  const scored = [];
  for (const item of items) {
    if (intent.type !== "all" && item._kind !== intent.type) continue;
    if (intent.status ? item.status !== intent.status : item.status === "Closed") continue;
    if (intent.month !== null && listingMonth(item) !== intent.month) continue;

    let score = 0;
    for (const kw of intent.keywords) {
      for (const [field, weight] of fields) {
        const v = Array.isArray(item[field]) ? item[field].join(" ") : item[field];
        if (v && String(v).toLowerCase().includes(kw)) score += weight;
      }
    }
    if (intent.keywords.length && score === 0) continue;
    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score || new Date(a.item.deadline) - new Date(b.item.deadline));
  return scored.map((s) => ({ ...s.item, matchScore: s.score }));
}

// ---------- 2) Per-listing assistant (rule-based Q&A) ----------
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const daysLeft = (d, now = new Date()) => Math.ceil((new Date(d) - now) / 86400000);

function prepTips(listing, kind) {
  const text = `${listing.role || ""} ${listing.theme || ""} ${(listing.techStack || []).join(" ")}`.toLowerCase();
  if (/data|analyst|ml|machine|ai/.test(text)) return "SQL, Python (pandas) aur 1-2 chhote data projects ready rakho; resume mein results/numbers likho.";
  if (/design|ui|ux/.test(text)) return "Ek portfolio link (Figma/Behance) aur 2-3 case studies ready rakho.";
  if (/software|developer|sde|engineer|web|backend|frontend|react|node/.test(text) || kind === "hackathon")
    return "DSA basics (arrays, strings, hashing), 1-2 GitHub projects aur apne projects ko explain karne ki practice karo.";
  return "Resume ko role ke hisaab se customize karo aur company ke baare mein 5 lines ki research karo.";
}

function answerQuestion(listing, kind, question = "", now = new Date()) {
  const q = question.toLowerCase();
  const title = `${listing.name} (${listing.company})`;
  const left = daysLeft(listing.deadline, now);
  const leftTxt = left < 0 ? "deadline nikal chuki hai" : left === 0 ? "aaj last date hai" : `${left} din bache hain`;
  const has = (re) => re.test(q);

  let topic = "overview";
  let answer;

  if (has(/deadline|last date|when|due|closing|kab/)) {
    topic = "deadline";
    answer = `${title} ki deadline ${fmtDate(listing.deadline)} hai (${leftTxt}).`;
  } else if (has(/eligib|who can|kaun|year|batch|qualif/)) {
    topic = "eligibility";
    answer = kind === "internship" && listing.eligibility
      ? `Eligibility: ${listing.eligibility}.`
      : "Is listing mein eligibility alag se nahi di gayi. Official apply page pe check kar lo.";
  } else if (has(/apply|link|register|how to/)) {
    topic = "apply";
    answer = listing.applyLink
      ? `Yahan apply karo: ${listing.applyLink} (${leftTxt}).`
      : "Apply link available nahi hai, company ki official site check karo.";
  } else if (has(/tech|stack|skill|technolog|tools/)) {
    topic = "skills";
    answer = kind === "hackathon" && listing.techStack?.length
      ? `Tech stack: ${listing.techStack.join(", ")}.`
      : `Role "${listing.role || "N/A"}" ke liye ye tips: ${prepTips(listing, kind)}`;
  } else if (has(/prepar|tips|crack|ready|select/)) {
    topic = "preparation";
    answer = prepTips(listing, kind);
  } else if (has(/status|open|closed/)) {
    topic = "status";
    answer = `Abhi status "${listing.status}" hai, aur ${leftTxt}.`;
  } else if (has(/stipend|salary|pay|paid|prize/)) {
    topic = "pay";
    answer = "Stipend/prize ki detail is listing mein nahi hai. Official page check karo.";
  } else {
    const what = kind === "internship" ? `Role: ${listing.role}. Type: ${listing.type}.` : `Theme: ${listing.theme}.`;
    answer = `${title}. ${what} Status: ${listing.status}, deadline ${fmtDate(listing.deadline)} (${leftTxt}).`;
  }

  return {
    topic,
    answer,
    suggestions: ["What is the deadline?", "Who can apply?", "How to apply?", "How should I prepare?"],
  };
}

// ---------- 3) Summarizer (extractive) ----------
function topKeywords(freq, n = 8) {
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}

function summarize(text = "", maxSentences = 3) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
  const words = tokenize(clean);
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

  const base = { keywords: topKeywords(freq), skills: extractSkills(clean), wordCount: words.length };
  if (sentences.length <= maxSentences) {
    return { summary: sentences.length ? sentences.join(" ") : clean, ...base };
  }

  const maxF = Math.max(...Object.values(freq));
  const scored = sentences.map((s, i) => {
    const toks = tokenize(s);
    const sum = toks.reduce((acc, w) => acc + (freq[w] || 0) / maxF, 0);
    return { s, i, score: (sum / Math.max(toks.length, 1)) * (i < 2 ? 1.15 : 1) };
  });
  const top = scored.sort((a, b) => b.score - a.score).slice(0, maxSentences).sort((a, b) => a.i - b.i);
  return { summary: top.map((t) => t.s).join(" "), ...base };
}

// ---------- 4) Skills + skill gap analyzer ----------
const SKILLS = {
  javascript: ["javascript", "js", "es6"], typescript: ["typescript"], python: ["python"], java: ["java"],
  "c++": ["c++", "cpp"], "c#": ["c#"], php: ["php"], kotlin: ["kotlin"], swift: ["swift"], golang: ["golang"],
  html: ["html", "html5"], css: ["css", "css3"], react: ["react", "react.js", "reactjs"], angular: ["angular"],
  vue: ["vue", "vue.js"], node: ["node", "node.js", "nodejs"], express: ["express", "express.js"],
  mongodb: ["mongodb", "mongo"], mysql: ["mysql"], postgresql: ["postgresql", "postgres"], sql: ["sql"],
  django: ["django"], flask: ["flask"], "spring boot": ["spring boot", "springboot"], flutter: ["flutter"],
  android: ["android"], git: ["git"], github: ["github"], docker: ["docker"], kubernetes: ["kubernetes", "k8s"],
  aws: ["aws"], azure: ["azure"], gcp: ["gcp", "google cloud"], linux: ["linux"], "ci/cd": ["ci/cd", "cicd"],
  "rest api": ["rest api", "restful", "rest apis"], graphql: ["graphql"], jest: ["jest"],
  testing: ["testing", "unit test", "unit testing"],
  "machine learning": ["machine learning", "ml"], "deep learning": ["deep learning"],
  nlp: ["nlp", "natural language processing"], tensorflow: ["tensorflow"], pytorch: ["pytorch"],
  pandas: ["pandas"], numpy: ["numpy"], "scikit-learn": ["scikit-learn", "sklearn"],
  "data analysis": ["data analysis", "data analytics"], "power bi": ["power bi", "powerbi"],
  tableau: ["tableau"], excel: ["excel"], figma: ["figma"], "ui/ux": ["ui/ux", "ux", "ui design"],
  dsa: ["dsa", "data structures", "algorithms"], oop: ["oop", "oops", "object oriented"],
  agile: ["agile", "scrum"], communication: ["communication"], teamwork: ["teamwork", "team player", "collaboration"],
  leadership: ["leadership"], "problem solving": ["problem solving", "problem-solving"],
  cybersecurity: ["cybersecurity", "cyber security"],
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// lookbehind mein "." bhi hai taaki "node.js" mein "js" alag se match na ho
const SKILL_RES = Object.entries(SKILLS).map(([skill, aliases]) => [
  skill,
  new RegExp(`(?<![a-z0-9+#.])(?:${aliases.map(escapeRe).join("|")})(?![a-z0-9+#])`, "i"),
]);

function extractSkills(text = "") {
  return SKILL_RES.filter(([, re]) => re.test(text)).map(([skill]) => skill);
}

function skillGap(resumeText = "", jdText = "") {
  const have = extractSkills(resumeText);
  const need = extractSkills(jdText);
  const matched = need.filter((s) => have.includes(s));
  const missing = need.filter((s) => !have.includes(s));
  const extra = have.filter((s) => !need.includes(s));
  const matchPercent = need.length ? Math.round((matched.length / need.length) * 100) : null;
  const suggestions = missing.map((s) => `${s}: ek chhota project ya tutorial karke resume mein add karo.`);
  return { matchPercent, requiredSkills: need, matched, missing, extra, suggestions };
}

module.exports = {
  tokenize, parseIntent, rankListings, answerQuestion, summarize, extractSkills, skillGap, daysLeft,
};