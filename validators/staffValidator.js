const { body } = require("express-validator");

exports.validateLogin = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

exports.validateCreateStaff = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").notEmpty().withMessage("Role is required"),
    body("permissions").isArray().withMessage("Permissions must be an array"),
    body("brands").isArray({ min: 1 }).withMessage("At least one brand is required"),
    body("outlets").isArray().withMessage("Outlets must be an array"),
];

exports.validateUpdateStaff = [
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("phone").optional().isMobilePhone().withMessage("Valid phone number is required"),
    body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("pos_login_pin").optional().isLength({ min: 4 }).withMessage("POS login PIN must be at least 4 characters"),
    body("permissions").optional().isArray().withMessage("Permissions must be an array"),
    body("brands").optional().isArray().withMessage("Brands must be an array"),
    body("outlets").optional().isArray().withMessage("Outlets must be an array"),
];
