const express = require("express");
const router = express.Router();
const WhatsAppCredential = require("../models/WhatsAppCredential");
const { verifyToken } = require("../middleware/authMiddleware");

// Create WhatsApp Credential
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("whatsapp_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const {
            name,
            brand_id,
            outlet_id,
            whatsAppApiUrl,
            accessToken,
            phoneNumberId,
            businessAccountId,
            status = "active"
        } = req.body;

        console.log({
            name,
            brand_id,
            outlet_id,
            whatsAppApiUrl,
            accessToken,
            phoneNumberId,
            businessAccountId,
            status
        })

        if (!name || !accessToken || !phoneNumberId || !businessAccountId || !brand_id || !outlet_id) {
            return res.status(400).json({ message: "Required fields are missing." });
        }

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value. Must be 'active' or 'inactive'." });
        }

        const existingOutlet = await WhatsAppCredential.findOne({ outlet_id });
        if (existingOutlet) {
            return res.status(400).json({ message: "Credential already exists for this outlet." });
        }

        const existingName = await WhatsAppCredential.findOne({ name, outlet_id });
        if (existingName) {
            return res.status(400).json({ message: "Credential name already exists for this outlet." });
        }

        const newCredential = new WhatsAppCredential({
            name,
            whatsAppApiUrl,
            accessToken,
            phoneNumberId,
            businessAccountId,
            brand_id,
            outlet_id,
            status
        });

        await newCredential.save();

        const populated = await WhatsAppCredential.findById(newCredential._id)
            .populate("brand_id", "name")
            .populate("outlet_id", "name");

        res.status(201).json({
            message: "WhatsApp credential created successfully",
            credential: populated
        });
    } catch (error) {
        console.error("Error creating WhatsApp credential:", error);
        res.status(500).json({
            message: "Error creating WhatsApp credential",
            error: error.message
        });
    }
});

// Update WhatsApp Credential
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("whatsapp_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const credential = await WhatsAppCredential.findById(req.params.id);
        if (!credential) {
            return res.status(404).json({ message: "WhatsApp credential not found" });
        }

        const { name, outlet_id, status } = req.body;

        if (status && !["active", "inactive"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value. Must be 'active' or 'inactive'." });
        }

        if (outlet_id && outlet_id.toString() !== credential.outlet_id.toString()) {
            const outletExists = await WhatsAppCredential.findOne({ outlet_id });
            if (outletExists) {
                return res.status(400).json({ message: "Another credential already exists for this outlet." });
            }
        }

        if (
            name &&
            (name !== credential.name || outlet_id?.toString() !== credential.outlet_id.toString())
        ) {
            const nameExists = await WhatsAppCredential.findOne({
                _id: { $ne: credential._id },
                name,
                outlet_id: outlet_id || credential.outlet_id
            });

            if (nameExists) {
                return res.status(400).json({ message: "Credential name already exists for this outlet." });
            }
        }

        Object.assign(credential, req.body);

        await credential.save();

        const populated = await WhatsAppCredential.findById(credential._id)
            .populate("brand_id", "name")
            .populate("outlet_id", "name");

        res.status(200).json({
            message: "WhatsApp credential updated successfully",
            credential: populated
        });
    } catch (error) {
        console.error("Error updating WhatsApp credential:", error);
        res.status(500).json({
            message: "Error updating WhatsApp credential",
            error: error.message
        });
    }
});

// Fetch Accessible WhatsApp Credentials
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("whatsapp_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        const credentials = await WhatsAppCredential.find({
            brand_id: { $in: brands },
            outlet_id: { $in: outlets }
        }).populate("brand_id", "name")
            .populate("outlet_id", "name");

        res.status(200).json({ message: "Accessible WhatsApp credentials fetched successfully", credentials });
    } catch (error) {
        console.error("Error fetching WhatsApp credentials:", error);
        res.status(500).json({ message: "Error fetching WhatsApp credentials", error: error.message });
    }
});

module.exports = router;
