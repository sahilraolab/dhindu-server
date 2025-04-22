const { body } = require("express-validator");

const validateLogin = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

const validateCreateStaff = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone")
        .matches(/^\d{3}-\d{3}-\d{4}$/)
        .withMessage("Phone must be in the format ###-###-####."),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("role").notEmpty().withMessage("Role is required"),
    body("permissions").isArray().withMessage("Permissions must be an array"),
    body("brands")
        .isArray({ min: 1 })
        .withMessage("At least one brand is required"),
    body("outlets").isArray().withMessage("Outlets must be an array"),
];

const validateUpdateStaff = [
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("phone")
        .optional()
        .matches(/^\d{3}-\d{3}-\d{4}$/)
        .withMessage("Phone must be in the format ###-###-####."),
    body("password")
        .optional()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("pos_login_pin")
        .optional()
        .isLength({ min: 4 })
        .withMessage("POS login PIN must be at least 4 characters"),
    body("permissions")
        .optional()
        .isArray()
        .withMessage("Permissions must be an array"),
    body("brands").optional().isArray().withMessage("Brands must be an array"),
    body("outlets").optional().isArray().withMessage("Outlets must be an array"),
];

module.exports = {
    validateLogin,
    validateCreateStaff,
    validateUpdateStaff,
};
