const mongoose = require("mongoose");

const HackathonSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    theme: { type: String, required: true, trim: true },
    techStack: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Open", "Upcoming", "Closing Soon", "Closed"],
      default: "Upcoming",
    },
    logo: { type: String, default: "" },
    applyLink: { type: String, default: "" },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hackathon", HackathonSchema);
