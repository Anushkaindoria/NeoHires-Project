// Devpost se open/upcoming hackathons laata hai aur unhe NeoHires ke common format mein badalta hai.
// Node 18+ mein fetch built-in hai, koi extra package nahi chahiye.

const BASE = "https://devpost.com/api/hackathons";

// "Oct 03 - Dec 15, 2026" | "Dec 15, 2026" | "Dec 15 - 20, 2026" | "Dec 20, 2026 - Jan 10, 2027"
// se END date nikalta hai. Samajh na aaye to null.
function parseEndDate(str) {
  if (!str || typeof str !== "string") return null;
  const parts = str.split(/\s[-–]\s/);
  const lastPart = parts[parts.length - 1].trim();

  const year = (lastPart.match(/\b(20\d{2})\b/) || str.match(/\b(20\d{2})\b/) || [])[1];
  if (!year) return null;

  let monthDay = lastPart.replace(/,?\s*20\d{2}/, "").trim(); // "Dec 15" ya sirf "20"
  if (/^\d{1,2}$/.test(monthDay)) {
    const m = parts[0].match(/^[A-Za-z]{3,}/); // "Dec 15 - 20" mein month pehle hisse se
    if (!m) return null;
    monthDay = `${m[0]} ${monthDay}`;
  }
  const d = new Date(`${monthDay} ${year} 23:59:59 UTC`);
  return isNaN(d.getTime()) ? null : d;
}

function normalize(h) {
  const themes = (h.themes || []).map((t) => t && t.name).filter(Boolean);
  const location = h.displayed_location && h.displayed_location.location;
  let logo = h.thumbnail_url || "";
  if (logo.startsWith("//")) logo = "https:" + logo;

  return {
    kind: "hackathon",
    source: "devpost",
    externalId: String(h.id),
    name: h.title,
    company: h.organization_name || "Devpost",
    theme: themes.join(", "),
    description: [h.title, themes.join(", "), location].filter(Boolean).join(". "),
    applyLink: h.url || "",
    logo,
    deadline: parseEndDate(h.submission_period_dates),
    rawDates: h.submission_period_dates || null,
  };
}

async function fetchDevpost({ pages = 2 } = {}) {
  const out = [];
  for (let page = 1; page <= pages; page++) {
    const url = `${BASE}?page=${page}&status[]=open&status[]=upcoming&order_by=deadline`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "NeoHires-student-project" },
    });
    if (!res.ok) throw new Error(`Devpost HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data.hackathons) ? data.hackathons : [];
    if (!list.length) break;
    for (const h of list) {
      if (h && h.id && h.title) out.push(normalize(h));
    }
  }
  return out;
}

module.exports = { fetchDevpost, normalize, parseEndDate };