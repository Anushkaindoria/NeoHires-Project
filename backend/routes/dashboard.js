const express = require("express");
const SavedListing = require("../models/SavedListing");
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
    const savedListings = await SavedListing.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    const applications = await ApplicationStatus.find({ user: req.user._id }).sort({ updatedAt: -1 }).lean();

    const savedWithDetails = await Promise.all(
      savedListings.map(async (item) => {
        const listing = await getListingByType(item.listingType, item.listingId);
        return {
          _id: item._id,
          listingType: item.listingType,
          createdAt: item.createdAt,
          listing: listing || null,
        };
      })
    );

    const applicationsWithDetails = await Promise.all(
      applications.map(async (item) => {
        const listing = await getListingByType(item.listingType, item.listingId);
        return {
          _id: item._id,
          listingType: item.listingType,
          status: item.status,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          listing: listing || null,
        };
      })
    );

    const summary = {
      savedCount: savedWithDetails.length,
      appliedCount: applicationsWithDetails.filter((item) => item.status === "Applied").length,
      interviewingCount: applicationsWithDetails.filter((item) => item.status === "Interviewing").length,
      rejectedCount: applicationsWithDetails.filter((item) => item.status === "Rejected").length,
      offerCount: applicationsWithDetails.filter((item) => item.status === "Offer").length,
    };

    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      summary,
      savedListings: savedWithDetails,
      applications: applicationsWithDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
