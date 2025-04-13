const { body } = require("express-validator");

const brandValidationRules = [
  body("full_name").trim().notEmpty().withMessage("Full name is required."),
  body("short_name").trim().notEmpty().withMessage("Short name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("phone").trim().notEmpty().withMessage("Phone number is required."),
  body("gst_no").trim().notEmpty().withMessage("GST number is required."),
  body("license_no").trim().notEmpty().withMessage("License number is required."),
  body("food_license").trim().notEmpty().withMessage("Food license is required."),
  body("city").trim().notEmpty().withMessage("City is required."),
  body("state").trim().notEmpty().withMessage("State is required."),
  body("country").trim().notEmpty().withMessage("Country is required."),
  body("postal_code").trim().notEmpty().withMessage("Postal code is required."),
  body("street_address").trim().notEmpty().withMessage("Street address is required.")
];

module.exports = {
  brandValidationRules,
};
