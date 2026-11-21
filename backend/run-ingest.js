// Pipeline ko ek baar haath se chalane ke liye: node run-ingest.js
// DB mein data save karta hai (jo .env ke MONGO_URI mein hai).
require("dotenv").config();
const mongoose = require("mongoose");
const { runPipeline } = require("./services/pipeline");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    await runPipeline();
  } catch (err) {
    console.error("FAILED:", err.message);
  } finally {
    await mongoose.disconnect();
  }
})();