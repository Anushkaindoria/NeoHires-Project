const express = require("express");
const SavedListing = require("../models/SavedListing");
const Internship = require("../models/Internship");
const Hackathon = require("../models/Hackathon");
const { requireAuth } = require("./auth");

const router = express.Router();

const getListingByType = async (listingType, listingId) => {
  if (listingType === "internship") {
    return Internship.findById(listingId);
  }

  if (listingType === "hackathon") {
    return Hackathon.findById(listingId);
  }

  return null;
};

router.get("/", requireAuth, async (req, res) => {
  try {
    const saved = await SavedListing.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const enrichedSaved = await Promise.all(
      saved.map(async (item) => {
        const listing = await getListingByType(item.listingType, item.listingId);

        return {
          _id: item._id,
          listingType: item.listingType,
          createdAt: item.createdAt,
          listing: listing || null,
        };
      })
    );

    return res.json(enrichedSaved);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { listingType, listingId } = req.body;

    if (!listingType || !listingId) {
      return res.status(400).json({ message: "listingType and listingId are required" });
    }

    if (!["internship", "hackathon"].includes(listingType)) {
      return res.status(400).json({ message: "listingType must be internship or hackathon" });
    }

    const listing = await getListingByType(listingType, listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const existing = await SavedListing.findOne({
      user: req.user._id,
      listingType,
      listingId,
    });

    if (existing) {
      return res.status(409).json({ message: "Listing already saved" });
    }

    const savedListing = await SavedListing.create({
      user: req.user._id,
      listingType,
      listingId,
      listingTypeModel: listingType === "internship" ? "Internship" : "Hackathon",
    });

    return res.status(201).json(savedListing);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const savedListing = await SavedListing.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!savedListing) {
      return res.status(404).json({ message: "Saved listing not found" });
    }

    return res.json({ message: "Saved listing removed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
