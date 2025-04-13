const { body } = require("express-validator");

const orderTypeValidationRules = [
    body("name")
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Name must be between 3 and 50 characters"),

    body("category")
        .isIn(["pickup", "dine-in", "quick-service", "delivery", "third-party"])
        .withMessage("Invalid category"),

    body("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Status must be 'active' or 'inactive'"),

    body("brand_id")
        .isMongoId()
        .withMessage("Invalid brand ID"),

    body("outlet_id")
        .isMongoId()
        .withMessage("Invalid outlet ID"),
];

module.exports = { orderTypeValidationRules };
