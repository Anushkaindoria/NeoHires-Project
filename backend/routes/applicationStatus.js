const express = require("express");
const ApplicationStatus = require("../models/ApplicationStatus");
const Internship = require("../models/Internship");
const Hackathon = require("../models/Hackathon");
const { requireAuth } = require("./auth");

const router = express.Router();

const getListingByType = async (listingType, listingId) => {
  if (listingType === "internship") return Internship.findById(listingId);
  if (listingType === "hackathon") return Hackathon.findById(listingId);
  return null;
};

router.get("/", requireAuth, async (req, res) => {
  try {
    const records = await ApplicationStatus.find({ user: req.user._id }).sort({ updatedAt: -1 }).lean();

    const enriched = await Promise.all(
      records.map(async (item) => {
        const listing = await getListingByType(item.listingType, item.listingId);
        return {
          _id: item._id,
          status: item.status,
          notes: item.notes,
          listingType: item.listingType,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          listing: listing || null,
        };
      })
    );

    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { listingType, listingId, status, notes } = req.body;

    if (!listingType || !listingId) {
      return res.status(400).json({ message: "listingType and listingId are required" });
    }

    if (!["internship", "hackathon"].includes(listingType)) {
      return res.status(400).json({ message: "listingType must be internship or hackathon" });
    }

    const validStatuses = ["Applied", "Interviewing", "Rejected", "Offer"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "status must be one of Applied, Interviewing, Rejected, Offer" });
    }

    const listing = await getListingByType(listingType, listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const existing = await ApplicationStatus.findOne({
      user: req.user._id,
      listingType,
      listingId,
    });

    if (existing) {
      existing.status = status || existing.status;
      existing.notes = notes ?? existing.notes;
      existing.listingTypeModel = listingType === "internship" ? "Internship" : "Hackathon";
      const updated = await existing.save();
      return res.json(updated);
    }

    const record = await ApplicationStatus.create({
      user: req.user._id,
      listingType,
      listingId,
      listingTypeModel: listingType === "internship" ? "Internship" : "Hackathon",
      status: status || "Applied",
      notes: notes || "",
    });

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const record = await ApplicationStatus.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!record) {
      return res.status(404).json({ message: "Application record not found" });
    }

    if (status) {
      const validStatuses = ["Applied", "Interviewing", "Rejected", "Offer"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      record.status = status;
    }

    if (notes !== undefined) {
      record.notes = notes;
    }

    await record.save();
    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const record = await ApplicationStatus.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!record) {
      return res.status(404).json({ message: "Application record not found" });
    }

    return res.json({ message: "Application record deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
