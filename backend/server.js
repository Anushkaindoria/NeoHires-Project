const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const Internship = require("./models/Internship");
const Hackathon = require("./models/Hackathon");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/neohires";
const PORT = process.env.PORT || 5000;

const cleanupExpiredListings = async () => {
  try {
    const now = new Date();
    const internshipResult = await Internship.deleteMany({ deadline: { $lt: now } });
    const hackathonResult = await Hackathon.deleteMany({ deadline: { $lt: now } });

    console.log(
      `Expired listings cleaned: ${internshipResult.deletedCount} internships, ${hackathonResult.deletedCount} hackathons`
    );

    return {
      internships: internshipResult.deletedCount,
      hackathons: hackathonResult.deletedCount,
    };
  } catch (error) {
    console.error("Expired listing cleanup failed:", error.message);
    return { internships: 0, hackathons: 0, error: error.message };
  }
};

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "NeoHires backend is running" });
});

app.post("/api/cleanup-expired", async (req, res) => {
  try {
    const result = await cleanupExpiredListings();
    return res.json({
      message: "Expired listings cleanup completed",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.use("/api/internships", require("./routes/internships"));
app.use("/api/hackathons", require("./routes/hackathons"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/saved", require("./routes/savedListings"));
app.use("/api/applications", require("./routes/applicationStatus"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/ingest", require("./routes/ingest"));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    cleanupExpiredListings();
    setInterval(cleanupExpiredListings, 60 * 60 * 1000);
    require("./services/pipeline").runPipeline();
    setInterval(() => require("./services/pipeline").runPipeline(), 6 * 60 * 60 * 1000);
    const { runInternshipsPipeline } = require("./internshipsPipeline");
    runInternshipsPipeline();
    setInterval(runInternshipsPipeline, 60 * 60 * 1000);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const distPath = path.join(__dirname, "..", "neohires-react", "dist");
app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
