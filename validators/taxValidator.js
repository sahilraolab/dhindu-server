const { body } = require("express-validator");

const validateCreateTax = [
    body("tax_name")
        .notEmpty().withMessage("Tax name is required")
        .isLength({ min: 3, max: 50 }).withMessage("Tax name must be between 3 and 50 characters"),
    
    body("tax_value")
        .notEmpty().withMessage("Tax value is required")
        .isFloat({ min: 0, max: 100 }).withMessage("Tax value must be between 0 and 100"),
    
    body("display_tax_name")
        .notEmpty().withMessage("Display tax name is required")
        .trim(),
    
    body("status")
        .optional()
        .isIn(["active", "inactive"]).withMessage("Status must be 'active' or 'inactive'"),

    body("brand_id")
        .notEmpty().withMessage("Brand ID is required")
        .isMongoId().withMessage("Invalid Brand ID"),

    body("outlet_id")
        .notEmpty().withMessage("Outlet ID is required")
        .isMongoId().withMessage("Invalid Outlet ID")
];

const validateUpdateTax = [
    body("tax_name")
        .optional()
        .isLength({ min: 3, max: 50 }).withMessage("Tax name must be between 3 and 50 characters"),
    
    body("tax_value")
        .optional()
        .isFloat({ min: 0, max: 100 }).withMessage("Tax value must be between 0 and 100"),
    
    body("display_tax_name")
        .optional()
        .trim(),
    
    body("status")
        .optional()
        .isIn(["active", "inactive"]).withMessage("Status must be 'active' or 'inactive'"),

    body("brand_id")
        .optional()
        .isMongoId().withMessage("Invalid Brand ID"),

    body("outlet_id")
        .optional()
        .isMongoId().withMessage("Invalid Outlet ID")
];

module.exports = {
    validateCreateTax,
    validateUpdateTax
};
