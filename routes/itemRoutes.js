const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const { verifyToken } = require("../middleware/authMiddleware");
const Category = require("../models/Category");

// Upsert Items (Single or Bulk)
router.post("/upsert", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("menu_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    // Extract the changedItems and addedItems from the request body
    const { changedItems, addedItems, menu_id, brand_id, outlet_id } = req.body;

    // Ensure the items are in array form
    const success = [];
    const failed = [];

    // Upsert changed items
    for (const itemData of changedItems) {
        try {
            const { _id, name, category_name, food_type, image, price, status } = itemData;

            let categoryDoc = await Category.findOne({ name: category_name, brand_id: brand_id, outlet_id: outlet_id });

            if (!categoryDoc) {
                categoryDoc = new Category({
                    name: category_name,
                    brand_id,
                    outlet_id: outlet_id || null
                });

                try {
                    await categoryDoc.save();
                } catch (catErr) {
                    failed.push({ data: itemData, error: "Failed to create new category: " + catErr.message });
                    continue;
                }
            }

            // Use toLowerCase to format food_type
            const formattedFoodType = food_type.toLowerCase();

            // Include status in updatedItemData
            const updatedItemData = {
                menu_id,
                name,
                category_name,
                food_type: formattedFoodType,
                image,
                price,
                status
            };

            const existingItem = await Item.findById(_id);
            if (!existingItem) {
                failed.push({ data: itemData, error: "Item not found with this ID." });
                continue;
            }

            // Check if another item with the same name, menu_id, and category_name already exists (duplicate check)
            const duplicateItem = await Item.findOne({
                name,
                menu_id,
                category_name,
                _id: { $ne: _id } // Exclude the current item being updated
            });

            if (duplicateItem) {
                failed.push({ data: itemData, error: "Duplicate item name found in the same menu and category." });
                continue;
            }

            Object.assign(existingItem, updatedItemData);
            await existingItem.save();
            success.push({ status: "updated", item: existingItem });
        } catch (error) {
            failed.push({ data: itemData, error: error.message });
        }
    }

    // Upsert added items
    for (const itemData of addedItems) {
        try {
            const { name, category_name, food_type, image, price, status } = itemData;

            let categoryDoc = await Category.findOne({ name: category_name, brand_id: brand_id, outlet_id: outlet_id });

            if (!categoryDoc) {
                categoryDoc = new Category({
                    name: category_name,
                    brand_id,
                    outlet_id: outlet_id || null
                });

                try {
                    await categoryDoc.save();
                } catch (catErr) {
                    failed.push({ data: itemData, error: "Failed to create new category: " + catErr.message });
                    continue;
                }
            }

            // Use toLowerCase to format food_type
            const formattedFoodType = food_type.toLowerCase();

            // Include status in newItemData
            const newItemData = {
                menu_id,
                name,
                category_name,
                food_type: formattedFoodType,
                image,
                price,
                status
            };

            // Check if an item with the same name, menu_id, and category_name already exists (duplicate check)
            const duplicateItem = await Item.findOne({ name, menu_id, category_name });

            if (duplicateItem) {
                failed.push({ data: itemData, error: "Duplicate item name found in the same menu and category." });
                continue;
            }

            const existingItem = await Item.findOne({ menu_id, name });

            if (existingItem) {
                Object.assign(existingItem, newItemData);
                await existingItem.save();
                success.push({ status: "updated", item: existingItem });
            } else {
                const newItem = new Item(newItemData);
                await newItem.save();
                success.push({ status: "created", item: newItem });
            }
        } catch (error) {
            failed.push({ data: itemData, error: error.message });
        }
    }

    res.status(200).json({
        message: "Bulk upsert complete",
        successCount: success.length,
        failedCount: failed.length,
        success,
        failed
    });
});

// Delete Item
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("menu_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ message: "Error deleting item", error });
    }
});

// Fetch items by menu_id with category_name populated (category name only)
router.get("/menu/:menu_id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("menu_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { menu_id } = req.params;

        const items = await Item.find({ menu_id })
            .populate({
                path: "category_name",  // Changed to category_name for population
                select: "name"
            });

        res.status(200).json({
            message: "Items fetched successfully",
            items
        });
    } catch (error) {
        console.error("Error fetching items by menu ID:", error);
        res.status(500).json({ message: "Error fetching items", error });
    }
});

module.exports = router;
