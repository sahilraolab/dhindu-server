const express = require("express");
const router = express.Router();
const BuyXGetYOffer = require("../models/BuyXGetYOffer");
const { verifyToken } = require("../middleware/authMiddleware");

// Create Buy X Get Y Offer
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("offers_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const existingOffer = await BuyXGetYOffer.findOne({ name: req.body.name, brand_id: req.body.brand_id, day: req.body.day });
        if (existingOffer) {
            return res.status(400).json({ message: "An offer with this name already exists for this brand on this day." });
        }

        const newOffer = new BuyXGetYOffer(req.body);
        await newOffer.save();
        res.status(201).json({ message: "Offer created successfully", offer: newOffer });
    } catch (error) {
        console.error("Error creating offer:", error);
        res.status(500).json({ message: "Error creating offer", error });
    }
});

// Update Buy X Get Y Offer
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("offers_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const offer = await BuyXGetYOffer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        Object.assign(offer, req.body); // Update fields
        await offer.save();
        res.status(200).json({ message: "Offer updated successfully", offer });
    } catch (error) {
        console.error("Error updating offer:", error);
        res.status(500).json({ message: "Error updating offer", error });
    }
});

// Delete Buy X Get Y Offer
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("offers_delete") || req.staff?.role === "admin")) {
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

// Fetch All Buy X Get Y Offers
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("offers_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const offers = await BuyXGetYOffer.find().populate("brand_id outlet_id buy_items buy_categories buy_menus get_items order_types");
        res.status(200).json({ message: "Offers fetched successfully", offers });
    } catch (error) {
        console.error("Error fetching offers:", error);
        res.status(500).json({ message: "Error fetching offers", error });
    }
});

// Fetch Single Buy X Get Y Offer
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("offers_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const offer = await BuyXGetYOffer.findById(req.params.id).populate("brand_id outlet_id buy_items buy_categories buy_menus get_items order_types");
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        res.status(200).json({ message: "Offer fetched successfully", offer });
    } catch (error) {
        console.error("Error fetching offer:", error);
        res.status(500).json({ message: "Error fetching offer", error });
    }
});

module.exports = router;
