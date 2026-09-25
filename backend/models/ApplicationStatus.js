const mongoose = require("mongoose");

const applicationStatusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingType: {
      type: String,
      enum: ["internship", "hackathon"],
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "listingTypeModel",
    },
    listingTypeModel: {
      type: String,
      required: true,
      enum: ["Internship", "Hackathon"],
    },
    status: {
      type: String,
      enum: ["Applied", "Interviewing", "Rejected", "Offer"],
      default: "Applied",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

applicationStatusSchema.index({ user: 1, listingType: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model("ApplicationStatus", applicationStatusSchema);
