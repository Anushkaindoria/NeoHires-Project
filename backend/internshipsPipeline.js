// Live internships pipeline.
//
// Pulls postings from public company job boards (Greenhouse, Lever), keeps ONLY
// internships, and upserts them into the Internship collection.
//
// - applyLink is used as the unique key, so no schema change is needed.
// - The Internship schema requires `deadline`, but job boards don't publish one.
//   Each sync pushes the deadline to now + LISTING_TTL_DAYS. While a posting is
//   still on the board its deadline keeps moving forward; once it disappears the
//   deadline stops moving and the existing cleanupExpiredListings job removes it.
// - Job description is saved too (used for hover text and the resume checker).
// - Needs Node 18+ (global fetch).

const Internship = require("./models/Internship");

const LISTING_TTL_DAYS = 14;
const REQUEST_TIMEOUT_MS = 30000; // content=true makes Greenhouse responses big
const MAX_DESCRIPTION_CHARS = 8000;

// Board tokens are NOT verified. A wrong token just returns 404 and is skipped
// (it shows up under `errors` in the report), so edit this list freely.
// `domain` is used to fetch a logo (these companies have no file in assets/logos).
const COMPANIES = [
  { company: "Stripe", platform: "greenhouse", token: "stripe", domain: "stripe.com" },
  { company: "Airbnb", platform: "greenhouse", token: "airbnb", domain: "airbnb.com" },
  { company: "Cloudflare", platform: "greenhouse", token: "cloudflare", domain: "cloudflare.com" },
  { company: "Databricks", platform: "greenhouse", token: "databricks", domain: "databricks.com" },
  { company: "Datadog", platform: "greenhouse", token: "datadog", domain: "datadoghq.com" },
  { company: "MongoDB", platform: "greenhouse", token: "mongodb", domain: "mongodb.com" },
  { company: "Dropbox", platform: "greenhouse", token: "dropbox", domain: "dropbox.com" },
  { company: "Coinbase", platform: "greenhouse", token: "coinbase", domain: "coinbase.com" },
  { company: "Twilio", platform: "greenhouse", token: "twilio", domain: "twilio.com" },
  { company: "Pinterest", platform: "greenhouse", token: "pinterest", domain: "pinterest.com" },
  { company: "Spotify", platform: "lever", token: "spotify", domain: "spotify.com" },
  { company: "Palantir", platform: "lever", token: "palantir", domain: "palantir.com" },
];

// Logo from the company's domain (Google's favicon service).
const logoFor = (domain) =>
  domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : "";

// Optional. Leave null for all locations, or e.g. /india|bengaluru|bangalore|hyderabad|remote/i
const LOCATION_FILTER = null;

// Whole word "intern" / "interns" / "internship(s)" only, so "Internal Tools" doesn't match.
const INTERN_REGEX = /\bintern(ship)?s?\b/i;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const isInternship = (title, commitment) =>
  INTERN_REGEX.test(title || "") || INTERN_REGEX.test(commitment || "");

const monthNameOf = (dateLike) => {
  const d = new Date(dateLike);
  return Number.isNaN(d.getTime()) ? MONTHS[new Date().getMonth()] : MONTHS[d.getMonth()];
};

const rollingDeadline = () => new Date(Date.now() + LISTING_TTL_DAYS * 24 * 60 * 60 * 1000);

// ---- html -> text helpers ----

const decodeEntities = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

// Greenhouse content is entity-encoded HTML: decode, strip tags, decode again.
const htmlToText = (html) =>
  decodeEntities(decodeEntities(String(html || "")).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const fetchJson = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
};

// ---- normalizers (pure functions, easy to test) ----

const normalizeGreenhouse = (entry, payload) => {
  const jobs = Array.isArray(payload && payload.jobs) ? payload.jobs : [];
  return jobs
    .filter((job) => job.title && job.absolute_url && isInternship(job.title))
    .map((job) => ({
      title: job.title.trim(),
      location: (job.location && job.location.name) || "",
      applyLink: job.absolute_url,
      postedAt: job.updated_at,
      description: htmlToText(job.content),
    }));
};

const normalizeLever = (entry, payload) => {
  const postings = Array.isArray(payload) ? payload : [];
  return postings
    .filter((p) => {
      const commitment = p.categories && p.categories.commitment;
      return p.text && p.hostedUrl && isInternship(p.text, commitment);
    })
    .map((p) => ({
      title: p.text.trim(),
      location: (p.categories && p.categories.location) || "",
      applyLink: p.hostedUrl,
      postedAt: p.createdAt, // epoch ms
      description: [
        p.descriptionPlain,
        ...(p.lists || []).map((l) => `${l.text} ${htmlToText(l.content)}`),
        p.additionalPlain,
      ]
        .filter(Boolean)
        .join("\n"),
    }));
};

const toInternshipDoc = (entry, item) => ({
  company: entry.company,
  name: item.title,
  role: item.title,
  type: "Internship",
  eligibility: "Students",
  // These postings are open right now, so they go under the current month.
  month: MONTHS[new Date().getMonth()],
  status: "Open",
  logo: entry.logo || logoFor(entry.domain),
  description: (item.description || "").slice(0, MAX_DESCRIPTION_CHARS),
  applyLink: item.applyLink,
  deadline: rollingDeadline(),
});

// ---- fetching ----

const fetchCompany = async (entry) => {
  if (entry.platform === "greenhouse") {
    const payload = await fetchJson(
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(entry.token)}/jobs?content=true`
    );
    return normalizeGreenhouse(entry, payload);
  }
  if (entry.platform === "lever") {
    const payload = await fetchJson(
      `https://api.lever.co/v0/postings/${encodeURIComponent(entry.token)}?mode=json`
    );
    return normalizeLever(entry, payload);
  }
  throw new Error(`Unknown platform: ${entry.platform}`);
};

const runInternshipsPipeline = async () => {
  const report = { fetched: 0, inserted: 0, updated: 0, skippedByLocation: 0, errors: 0, byCompany: {} };

  for (const entry of COMPANIES) {
    try {
      let items = await fetchCompany(entry);

      if (LOCATION_FILTER) {
        const before = items.length;
        items = items.filter((i) => LOCATION_FILTER.test(i.location));
        report.skippedByLocation += before - items.length;
      }

      report.fetched += items.length;
      report.byCompany[entry.company] = items.length;

      for (const item of items) {
        const doc = toInternshipDoc(entry, item);
        // applyLink is the key; deadline and description are refreshed on every sync.
        const result = await Internship.updateOne(
          { applyLink: doc.applyLink },
          { $set: doc },
          { upsert: true }
        );
        if (result.upsertedCount) report.inserted += 1;
        else report.updated += 1;
      }
    } catch (err) {
      report.errors += 1;
      console.error(`[internships pipeline] ${entry.company} (${entry.platform}): ${err.message}`);
    }
  }

  console.log("Pipeline report:", JSON.stringify({ internships: report }));
  return report;
};

module.exports = {
  runInternshipsPipeline,
  // exported for testing
  isInternship,
  htmlToText,
  normalizeGreenhouse,
  normalizeLever,
  toInternshipDoc,
  monthNameOf,
};