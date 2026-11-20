const mongoose = require("mongoose");

const HackathonSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    theme: { type: String, trim: true, default: "" },
    techStack: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Open", "Upcoming", "Closing Soon", "Closed"],
      default: "Upcoming",
    },
    logo: { type: String, default: "" },
    applyLink: { type: String, default: "" },
    deadline: { type: Date, default: null },

    // naye fields (auto data pipeline ke liye)
    source: { type: String, default: "manual" },
    externalId: { type: String },
    description: { type: String, default: "" },
    skills: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ek source ki ek listing database mein sirf ek baar aaye (duplicate na bane)
HackathonSchema.index(
  { source: 1, externalId: 1 },
  { unique: true, partialFilterExpression: { externalId: { $type: "string" } } }
);

module.exports = mongoose.model("Hackathon", HackathonSchema);