const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// test route
// app.get("/", (req, res) => {
//   res.send("NeoHires Backend is running 🚀");
// });
app.use("/api/internships", require("./routes/internships"));
app.use("/api/hackathons", require("./routes/hackathons"));


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
  

const path = require("path");

// serve frontend files
app.use(express.static(path.join(__dirname, "..")));

// for all other routes, send index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
