const { body } = require("express-validator");

const outletValidationRules = [
  body("brand_id").notEmpty().withMessage("Brand ID is required."),
  body("name").notEmpty().withMessage("Outlet name is required."),
  body("code").notEmpty().withMessage("Outlet code is required."),
  body("email").isEmail().withMessage("A valid email is required."),
  body("phone")
    .matches(/^\d{3}-\d{3}-\d{4}$/)
    .withMessage("Phone must be in the format ###-###-####."),
  body("timezone.label").notEmpty().withMessage("Timezone label is required."),
  body("timezone.value").notEmpty().withMessage("Timezone value is required."),
  body("opening_time")
    .matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/)
    .withMessage("Opening time must be in HH:mm format."),
  body("closing_time")
    .matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/)
    .withMessage("Closing time must be in HH:mm format."),
  body("street").notEmpty().withMessage("Street is required."),
  body("city").notEmpty().withMessage("City is required."),
  body("state").notEmpty().withMessage("State is required."),
  body("country").notEmpty().withMessage("Country is required."),
];

module.exports = {
  outletValidationRules,
};
