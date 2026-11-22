// Role-based skill expectations, independent of one listing's wording.
// Rule-based: only text matching. To support a new role, add an object to PROFILES.

const PROFILES = [
  {
    label: "Data Analyst",
    titleRe: /\bdata\s+analy(st|tics)\b|\banalytics\b|\bbusiness intelligence\b/i,
    must: [
      { name: "Python", terms: ["python", "pandas", "numpy"] },
      { name: "SQL", terms: ["sql", "mysql", "postgresql", "postgres", "sqlite", "sql server"] },
      { name: "Excel", terms: ["excel", "google sheets", "spreadsheet", "pivot table", "vlookup"] },
      { name: "Statistics", terms: ["statistics", "statistical", "hypothesis testing", "regression", "probability"] },
      { name: "Data visualization", terms: ["power bi", "tableau", "looker", "matplotlib", "seaborn", "plotly", "data visualization", "dashboard"] },
      { name: "Data cleaning", terms: ["data cleaning", "data cleansing", "data wrangling", "data preprocessing", "exploratory data analysis", "eda"] },
    ],
    good: [
      { name: "Pandas", terms: ["pandas"] },
      { name: "NumPy", terms: ["numpy"] },
      { name: "A/B testing", terms: ["a/b testing", "ab testing"] },
      { name: "Data pipelines / ETL", terms: ["etl", "data pipeline", "data pipelines"] },
      { name: "Power BI / Tableau", terms: ["power bi", "tableau"] },
      { name: "Machine learning basics", terms: ["machine learning", "scikit-learn"] },
    ],
  },
];

// hasSkill(text, term) is passed in from resumeAnalyzer.js (whole-word match).
function evaluateRole(title, resumeLower, hasSkill) {
  const profile = PROFILES.find((p) => p.titleRe.test(title));
  if (!profile) return null;

  const check = (item) => item.terms.some((t) => hasSkill(resumeLower, t));
  const mustHave = profile.must.filter(check).map((i) => i.name);
  const mustMissing = profile.must.filter((i) => !check(i)).map((i) => i.name);
  const goodHave = profile.good.filter(check).map((i) => i.name);
  const goodMissing = profile.good.filter((i) => !check(i)).map((i) => i.name);

  // must-have skills = 70 points, good-to-have = 30 points
  const score = Math.round(
    70 * (mustHave.length / profile.must.length) +
      30 * (goodHave.length / profile.good.length)
  );

  return {
    role: profile.label,
    score,
    have: [...mustHave, ...goodHave],
    missing: { must: mustMissing, good: goodMissing },
  };
}

module.exports = { evaluateRole };
