const MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];
const RETRIES = 2;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callModel(model, systemPrompt, history) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(20000),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    }),
  });

  if (!res.ok) {
    const err = new Error(`Gemini error ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("");
  if (!text) throw new Error("Empty AI response");
  return text;
}

async function askGemini(systemPrompt, history) {
  for (const model of MODELS) {
    for (let attempt = 0; attempt <= RETRIES; attempt++) {
      try {
        return await callModel(model, systemPrompt, history);
      } catch (err) {
        console.log(`Gemini ${model} attempt ${attempt + 1} failed:`, err.status || err.message);
        const busy = !err.status || [429, 500, 503].includes(err.status);
        if (!busy) throw err;
        await sleep(1000 * (attempt + 1));
      }
    }
  }
  throw new Error("AI_BUSY");
}

module.exports = { askGemini };