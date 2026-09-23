const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    eligibility: { type: String, required: true, trim: true },
    month: { type: String, required: true, trim: true },
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

module.exports = mongoose.model("Internship", InternshipSchema);
