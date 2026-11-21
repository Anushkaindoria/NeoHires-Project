// Saare data sources ko ek ke baad ek chalata hai aur result ingest karta hai.
// Ek source fail ho jaye to baaki chalte rehte hain.
const { ingest } = require("./ingest");
const { fetchDevpost } = require("../sources/devpost");

// Naya source jodna ho (jaise Adzuna) to bas yahan ek entry add karni hai.
const SOURCES = [
  { name: "devpost", fetch: () => fetchDevpost({ pages: 3 }) },
];

async function runPipeline() {
  const report = {};
  for (const src of SOURCES) {
    try {
      const items = await src.fetch();
      report[src.name] = await ingest(items);
    } catch (err) {
      report[src.name] = { error: err.message };
      console.error(`Source "${src.name}" failed:`, err.message);
    }
  }
  console.log("Pipeline report:", JSON.stringify(report));
  return report;
}

module.exports = { runPipeline };