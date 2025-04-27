const express = require("express");
const router = express.Router();
const BuyXGetYOffer = require("../models/BuyXGetYOffer");
const { verifyToken } = require("../middleware/authMiddleware");

// Create Buy X Get Y Offer
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const existingOffer = await BuyXGetYOffer.findOne({
            name: req.body.name,
            brand_id: req.body.brand_id,
            outlet_id: req.body.outlet_id,
            day: req.body.day
        });
        if (existingOffer) {
            return res.status(400).json({ message: "An offer with this name already exists for this brand and outlet on this day." });
        }

        // Ensure start_time and end_time are Date objects
        if (req.body.start_time) req.body.start_time = new Date(req.body.start_time);
        if (req.body.end_time) req.body.end_time = new Date(req.body.end_time);

        const newOffer = new BuyXGetYOffer(req.body);
        await newOffer.save();

        const populatedOffer = await BuyXGetYOffer.findById(newOffer._id)
            .populate("brand_id outlet_id menu_id buy_item get_item");

        res.status(201).json({ message: "Offer created successfully", offer: populatedOffer });
    } catch (error) {
        console.error("Error creating offer:", error);
        res.status(500).json({ message: "Error creating offer", error });
    }
});

// Update Buy X Get Y Offer
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const offer = await BuyXGetYOffer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        if (req.body.start_time) req.body.start_time = new Date(req.body.start_time);
        if (req.body.end_time) req.body.end_time = new Date(req.body.end_time);

        Object.assign(offer, req.body);
        await offer.save();

        const populatedOffer = await BuyXGetYOffer.findById(offer._id)
            .populate("brand_id outlet_id menu_id buy_item get_item");

        res.status(200).json({ message: "Offer updated successfully", offer: populatedOffer });
    } catch (error) {
        console.error("Error updating offer:", error);
        res.status(500).json({ message: "Error updating offer", error });
    }
});

// Delete Buy X Get Y Offer
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const offer = await BuyXGetYOffer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        await BuyXGetYOffer.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Offer deleted successfully" });
    } catch (error) {
        console.error("Error deleting offer:", error);
        res.status(500).json({ message: "Error deleting offer", error });
    }
});

// Accessible Buy X Get Y Offers
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        const offers = await BuyXGetYOffer.find({
            brand_id: { $in: brands },
            outlet_id: { $in: outlets }
        }).populate("brand_id outlet_id menu_id buy_item get_item");

        res.status(200).json({ message: "Accessible offers fetched successfully", offers });
    } catch (error) {
        console.error("Error fetching accessible offers:", error);
        res.status(500).json({ message: "Error fetching offers", error });
    }
});

module.exports = router;
