// Sirf test ke liye: Devpost se data aa raha hai ya nahi, ye check karta hai. DB mein kuch save nahi karta.
const { fetchDevpost } = require("./sources/devpost");

(async () => {
  try {
    const items = await fetchDevpost({ pages: 1 });
    console.log("Total items:", items.length);
    console.log(JSON.stringify(items.slice(0, 3), null, 2));
    const withDeadline = items.filter((i) => i.deadline).length;
    console.log(`Deadline mili: ${withDeadline}/${items.length}`);
  } catch (err) {
    console.error("FAILED:", err.message);
  }
})();