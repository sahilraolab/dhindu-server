const { body } = require("express-validator");

const createPaymentTypeValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Payment name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Payment name must be between 3 and 50 characters"),

  body("status")
    .optional()
    .isIn(["active", "inactive"]).withMessage("Invalid status value"),

  body("brand_id")
    .notEmpty().withMessage("Brand ID is required")
    .isMongoId().withMessage("Invalid Brand ID"),

  body("outlet_id")
    .notEmpty().withMessage("Outlet ID is required")
    .isMongoId().withMessage("Invalid Outlet ID")
];

const updatePaymentTypeValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage("Payment name must be between 3 and 50 characters"),

  body("status")
    .optional()
    .isIn(["active", "inactive"]).withMessage("Invalid status value"),

  body("brand_id")
    .optional()
    .isMongoId().withMessage("Invalid Brand ID"),

  body("outlet_id")
    .optional()
    .isMongoId().withMessage("Invalid Outlet ID")
];

module.exports = {
  createPaymentTypeValidator,
  updatePaymentTypeValidator
};
