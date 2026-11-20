// Alag-alag sources ke normalized items ko MongoDB mein save karta hai:
//  - status deadline se nikalta hai
//  - skills auto-tag karta hai (hamara nlp.extractSkills, koi AI API nahi)
//  - source + externalId pe upsert, isliye dobara chalane par duplicate nahi banta
const { extractSkills } = require("./nlp");

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function computeStatus(deadline, now = new Date()) {
  if (!deadline) return "Open";
  const days = (new Date(deadline) - now) / 86400000;
  if (days < 0) return "Closed";
  if (days <= 7) return "Closing Soon";
  return "Open";
}

function buildDoc(item, now = new Date()) {
  const text = [item.name, item.theme, item.role, item.description].filter(Boolean).join(". ");
  const skills = extractSkills(text);
  const deadline = item.deadline || null;

  const base = {
    source: item.source,
    externalId: item.externalId,
    name: item.name,
    company: item.company,
    description: item.description || "",
    applyLink: item.applyLink || "",
    logo: item.logo || "",
    deadline,
    status: computeStatus(deadline, now),
    skills,
  };

  if (item.kind === "internship") {
    return {
      ...base,
      role: item.role || item.name,
      type: item.type || "Internship",
      eligibility: item.eligibility || "",
      month: deadline ? MONTH_NAMES[new Date(deadline).getUTCMonth()] : "",
    };
  }
  return { ...base, theme: item.theme || "", techStack: skills };
}

function getModels() {
  return {
    Internship: require("../models/Internship"),
    Hackathon: require("../models/Hackathon"),
  };
}

// items: normalized listings ({ kind: "internship" | "hackathon", source, externalId, ... })
async function ingest(items, models = getModels(), now = new Date()) {
  const stats = { fetched: items.length, inserted: 0, updated: 0, skippedExpired: 0, errors: 0 };

  for (const item of items) {
    try {
      if (!item.source || !item.externalId || !item.name || !item.company) {
        stats.errors++;
        continue;
      }
      const doc = buildDoc(item, now);
      if (doc.status === "Closed") {
        stats.skippedExpired++; // nikli hui deadline wali listing save hi nahi karte
        continue;
      }
      const Model = item.kind === "internship" ? models.Internship : models.Hackathon;
      const res = await Model.updateOne(
        { source: doc.source, externalId: doc.externalId },
        { $set: doc },
        { upsert: true, setDefaultsOnInsert: true }
      );
      if (res.upsertedCount) stats.inserted++;
      else stats.updated++;
    } catch (err) {
      stats.errors++;
      console.error(`Ingest error (${item.source}/${item.externalId}):`, err.message);
    }
  }
  return stats;
}

module.exports = { ingest, buildDoc, computeStatus };