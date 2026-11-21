// Rule-based resume analyzer. No AI / API key: only text matching and counting.
//
// analyzeResume(text)                  -> general resume score + tips
// analyzeForInternship(text, listing)  -> match against ONE internship's description

const { evaluateRole } = require("./roleProfiles");

const SKILLS = {
  programming: [
    "javascript", "typescript", "python", "java", "c++", "c#", "golang", "rust", "php",
    "kotlin", "swift", "sql", "ruby", "scala", "dart", "bash",
  ],
  web: [
    "react", "next.js", "angular", "vue", "node.js", "express.js", "html", "css", "tailwind",
    "bootstrap", "redux", "django", "flask", "spring boot", "rest api", "restful api", "graphql",
  ],
  data: [
    "machine learning", "deep learning", "nlp", "llm", "pandas", "numpy", "scikit-learn",
    "tensorflow", "pytorch", "spark", "hadoop", "airflow", "kafka", "power bi", "tableau",
    "looker", "excel", "data analysis", "data pipelines", "statistics", "a/b testing", "opencv",
  ],
  tools: [
    "git", "github", "docker", "kubernetes", "aws", "azure", "gcp", "linux", "mongodb", "mysql",
    "postgresql", "firebase", "redis", "postman", "jira", "ci/cd", "terraform",
  ],
  design: ["figma", "photoshop", "illustrator", "ui/ux", "wireframing", "prototyping", "canva"],
  core: [
    "data structures", "algorithms", "oop", "dbms", "operating systems", "computer networks",
    "system design",
  ],
  marketing: [
    "seo", "sem", "social media", "content marketing", "content creation", "copywriting",
    "brand strategy", "branding", "market research", "email marketing", "google analytics",
    "campaigns", "public relations", "influencer marketing", "digital marketing", "storytelling",
    "community management", "video editing", "event management",
  ],
  business: [
    "business analysis", "project management", "stakeholder management", "financial modeling",
    "accounting", "sales", "crm", "salesforce", "hubspot", "operations", "strategy",
    "negotiation", "product management", "agile", "scrum", "powerpoint", "research",
    "recruiting", "customer support", "business development",
  ],
  soft: [
    "communication", "leadership", "teamwork", "problem solving", "time management",
    "presentation", "collaboration", "critical thinking", "adaptability", "creativity",
  ],
};

const SECTIONS = {
  education: /\b(education|academic|qualification)/i,
  experience: /\b(experience|internship|work history|employment)/i,
  projects: /\bprojects?\b/i,
  skills: /\b(skills|technical skills|technologies)/i,
  summary: /\b(summary|objective|profile|about me)/i,
  achievements: /\b(achievements?|awards?|certifications?|accomplishments)/i,
};

const ACTION_VERBS = [
  "built", "developed", "designed", "implemented", "created", "led", "optimized", "improved",
  "deployed", "automated", "launched", "managed", "analyzed", "reduced", "increased", "integrated",
];

// Words that carry no meaning for matching (common English + job-posting boilerplate).
const STOP = new Set((
  "the and for with that this are you your our will have has had not but can all any from they their " +
  "them his her its was were been being into out per via also more most such than then these those who " +
  "whom what when where which while about above after again against between both each few other some " +
  "only own same too very just should would could may might must shall over under until upon within " +
  "without across around before below during through off onto toward towards how why one two three " +
  "four five new get make made use used using like well able including include includes included based " +
  "help helps helping join joining part parts role roles position positions candidate candidates ideal " +
  "looking look seek seeking opportunity opportunities experience experiences team teams teammates work " +
  "working works worked skills skill strong ability abilities years year plus preferred required " +
  "requirements requirement qualifications qualification minimum responsibilities responsibility " +
  "description company companies intern interns internship internships student students program " +
  "programs summer winter spring fall time full day days week weeks month months high level great good " +
  "best excellent etc many much every everyone anyone someone world across whether either neither " +
  "ensure support supporting across various variety different within next make making take taking " +
  "currently current open apply applying application applications resume location remote office " +
  "hybrid onsite benefits equal employer employment status regard regardless race color religion " +
  "gender sexual orientation disability veteran age national origin inclusive diverse diversity " +
  "learn learning grow growing growth passion passionate eager excited love enjoy interested " +
  "interest country city based degree bachelor bachelors master masters phd enrolled pursuing " +
  "graduating graduation university college school academic expected expectation"
).split(/\s+/));

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");

// Whole-word match (optional plural s), so "java" does not match inside "javascript".
const hasSkill = (text, skill) =>
  new RegExp(`(^|[^a-z0-9+#])${escapeRe(skill)}s?([^a-z0-9+#]|$)`, "i").test(text);

const countOf = (text, word) =>
  (text.match(new RegExp(escapeRe(word), "gi")) || []).length;

const stem = (w) =>
  w.endsWith("ies") ? w.slice(0, -3) + "y" : w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;

const wordsOf = (text) => (text.toLowerCase().match(/[a-z][a-z+#]{2,}/g) || []);

const skillsIn = (lowerText) => {
  const byCategory = {};
  const all = [];
  for (const [cat, list] of Object.entries(SKILLS)) {
    const found = list.filter((s) => hasSkill(lowerText, s));
    if (found.length) byCategory[cat] = found;
    all.push(...found);
  }
  return { byCategory, all };
};

// Most frequent meaningful words in the listing (used when the fixed skill list is not enough).
function extractKeywords(text, title, excludeWords, limit = 10) {
  const counts = new Map();
  for (const w of wordsOf(text)) {
    if (STOP.has(w) || excludeWords.has(w)) continue;
    const key = stem(w);
    if (STOP.has(key) || excludeWords.has(key)) continue;
    const entry = counts.get(key) || { word: w, count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  const fromText = [...counts.entries()]
    .filter(([, e]) => e.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([key, e]) => ({ key, word: e.word }));

  // job-title words always count, e.g. "marketing", "designer"
  const fromTitle = [];
  for (const w of wordsOf(title)) {
    const key = stem(w);
    if (STOP.has(w) || STOP.has(key) || excludeWords.has(w) || excludeWords.has(key)) continue;
    if (!fromText.some((k) => k.key === key) && !fromTitle.some((k) => k.key === key)) {
      fromTitle.push({ key, word: w });
    }
  }
  return [...fromTitle, ...fromText];
}

// ---------- general analysis ----------

function analyzeResume(rawText) {
  const text = (rawText || "").replace(/\r/g, "");
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;

  const email = (text.match(/[\w.+-]+@[\w-]+\.[\w.]+/) || [])[0] || null;
  const phone = (text.match(/(\+?\d[\d\s-]{8,13}\d)/) || [])[0] || null;
  const linkedin = /linkedin\.com\/in\/|\blinkedin\b/i.test(text);
  const github = /github\.com\/[\w-]+|\bgithub\b/i.test(text);

  const sections = {};
  for (const [name, re] of Object.entries(SECTIONS)) sections[name] = re.test(text);

  const { byCategory: skills, all: allSkills } = skillsIn(lower);

  const verbsUsed = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, "i").test(text));
  const metrics = (text.match(/\d+\s?(%|\+|x|k\b|users|students|ms|hours)/gi) || []).length;

  // score out of 100
  let score = 0;
  score += (email ? 5 : 0) + (phone ? 4 : 0) + (linkedin ? 3 : 0) + (github ? 3 : 0); // 15
  const core = ["education", "skills", "projects", "experience"];
  score += core.filter((s) => sections[s]).length * 8; // 32
  score += (sections.summary ? 3 : 0) + (sections.achievements ? 5 : 0); // 8
  score += Math.min(allSkills.length, 10) * 2; // 20
  score += Math.min(verbsUsed.length, 5) * 2; // 10
  score += Math.min(metrics, 3) * 2; // 6
  score += words >= 200 && words <= 800 ? 9 : words >= 120 ? 4 : 0; // 9
  score = Math.min(100, score);

  const tips = [];
  if (!email) tips.push("Add your email address.");
  if (!phone) tips.push("Add your phone number.");
  if (!github) tips.push("Add your GitHub profile link so recruiters can see your projects.");
  if (!linkedin) tips.push("Add your LinkedIn profile link.");
  for (const s of core) {
    if (!sections[s]) tips.push(`The "${s[0].toUpperCase() + s.slice(1)}" section is missing.`);
  }
  if (!sections.summary) tips.push("Add a 2-3 line Summary/Objective at the top.");
  if (allSkills.length < 6) tips.push("List more relevant skills in your Skills section (at least 6-8).");
  if (verbsUsed.length < 3) tips.push("Start bullet points with action verbs (Built, Developed, Optimized...).");
  if (metrics === 0) tips.push("Add numbers to show impact, e.g. 'reduced load time by 30%' or '500+ users'.");
  if (words < 150) tips.push("Your resume is quite short. Describe your projects and experience in more detail.");
  if (words > 900) tips.push("Your resume is too long. For an internship, 1 page is ideal.");

  return {
    score,
    wordCount: words,
    contact: { email, phone, linkedin, github },
    sections,
    skills,
    totalSkills: allSkills.length,
    actionVerbs: verbsUsed,
    metricsCount: metrics,
    tips,
  };
}

// ---------- analysis against one internship ----------

function analyzeForInternship(rawText, internship) {
  const base = analyzeResume(rawText);
  const resumeText = rawText || "";
  const resumeLower = resumeText.toLowerCase();
  const resumeSkills = new Set(Object.values(base.skills).flat());
  const resumeStems = new Set(wordsOf(resumeText).map(stem));

  const role = internship.role || internship.name || "this role";
  const company = internship.company || "the company";
  const description = (internship.description || "").trim();
  const jdText = `${role} ${internship.name || ""} ${description}`.toLowerCase();

  const dataQuality = description.length === 0 ? "none" : description.length < 400 ? "limited" : "good";

  // 1) known skills mentioned in the listing
  const jdSkills = [...new Set(Object.values(SKILLS).flat().filter((s) => hasSkill(jdText, s)))];
  const matchedSkills = jdSkills.filter((s) => resumeSkills.has(s));
  const missingSkills = jdSkills.filter((s) => !resumeSkills.has(s));

  // 2) other important words of the listing (works for non-tech roles too)
  const exclude = new Set([
    ...wordsOf(company).map(stem),
    ...wordsOf(company),
    ...jdSkills.flatMap((s) => wordsOf(s)),
    ...jdSkills.flatMap((s) => wordsOf(s).map(stem)),
  ]);
  // the part of the title after a comma is usually a location or level ("..., France")
  const keywords = extractKeywords(description, role.split(",")[0], exclude, 10);
  const matchedKeywords = keywords.filter((k) => resumeStems.has(k.key)).map((k) => k.word);
  const missingKeywords = keywords.filter((k) => !resumeStems.has(k.key)).map((k) => k.word);

  const total = jdSkills.length + keywords.length;
  const matchedCount = matchedSkills.length + matchedKeywords.length;
  let matchPercent =
    dataQuality !== "none" && total >= 3 ? Math.round((matchedCount / total) * 100) : null;

  // Role baseline (e.g. Data Analyst): what the ROLE expects, not only the words of this listing
  const roleFit = evaluateRole(`${role} ${internship.name || ""}`, resumeLower, hasSkill);
  if (roleFit) {
    // 60% = role expectations, 40% = skills named in this listing (generic words are ignored)
    const listingPart = jdSkills.length ? (matchedSkills.length / jdSkills.length) * 100 : roleFit.score;
    matchPercent = Math.round(0.6 * roleFit.score + 0.4 * listingPart);
  }
  const roleHave = roleFit ? roleFit.have.map((s) => s.toLowerCase()) : [];
  const roleMissing = roleFit ? roleFit.missing.must.map((s) => s.toLowerCase()) : [];
  const finalMatched = [...new Set([...matchedSkills, ...roleHave])];
  const finalMissing = [...new Set([...missingSkills, ...roleMissing])].filter((s) => !finalMatched.includes(s));

  const tips = [];

  if (dataQuality === "none") {
    tips.push(
      `${company} has not provided a job description for this listing, so the match is based only on the job title. ` +
        `Open the Apply link, read the full posting and compare it with your resume manually.`
    );
  } else if (dataQuality === "limited") {
    tips.push(`${company}'s listing is short, so the match below may not be very accurate.`);
  }

  if (missingSkills.length) {
    tips.push(
      `This listing mentions skills that were not found in your resume: ${missingSkills.join(", ")}. ` +
        `If you genuinely have them, add them to your Skills section and project/experience bullets. ` +
        `If you don't, don't list them. Make them a learning priority instead.`
    );
  }

  if (missingKeywords.length) {
    tips.push(
      `${dataQuality === "none" ? "The job title mentions words that are" : "These words appear often in the listing but are"} not in your resume: ${missingKeywords.join(", ")}. ` +
        `Where they reflect work you have really done, use them naturally in your bullets.`
    );
  }

  // matched skills that appear only once (probably only in a skills list) need proof
  const mentionedOnce = matchedSkills.filter((s) => countOf(resumeLower, s) < 2);
  if (mentionedOnce.length) {
    tips.push(
      `These skills appear only once: ${mentionedOnce.join(", ")}. ` +
        `Also show them in a project or experience bullet (what you did and with which skill).`
    );
  }

  if (roleFit && roleFit.missing.must.length) {
    tips.push(
      `Typical ${roleFit.role} resumes show these core skills, which were not found in yours: ${roleFit.missing.must.join(", ")}. ` +
        `Add them only if you genuinely have them; otherwise make them a learning priority.`
    );
  }

  let generalTips = base.tips;
  if (!base.sections.summary) {
    tips.push(
      `Add a 2-line Summary at the top that shows your interest in the ${role} role and uses its keywords.`
    );
    generalTips = generalTips.filter((t) => !t.includes("Summary/Objective"));
  }

  if (matchPercent !== null && matchPercent >= 70 && !missingSkills.length) {
    tips.push("Your resume matches this listing well. Now add numbers (users, %, time saved) to show impact.");
  }

  return {
    internship: { _id: internship._id, company, role, applyLink: internship.applyLink },
    matchPercent,
    dataQuality,
    skills: { matched: finalMatched, missing: finalMissing },
    roleFit,
    keywords: { matched: matchedKeywords, missing: missingKeywords },
    resumeScore: base.score,
    tips: [...tips, ...generalTips], // listing-specific tips first, then general ones
  };
}

module.exports = { analyzeResume, analyzeForInternship, SKILLS };