const { body } = require("express-validator");

const floorCreateValidation = [
  body("brand_id")
    .isMongoId()
    .withMessage("Invalid brand ID")
    .notEmpty()
    .withMessage("Brand ID is required"),
  
  body("outlet_id")
    .isMongoId()
    .withMessage("Invalid outlet ID")
    .notEmpty()
    .withMessage("Outlet ID is required"),
  
  body("floor_name")
    .notEmpty()
    .withMessage("Floor name is required")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Floor name must be at least 3 characters long"),
  
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Invalid status, should be 'active' or 'inactive'"),
];

const floorUpdateValidation = [
  body("floor_name")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Floor name must be at least 3 characters long"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Invalid status, should be 'active' or 'inactive'"),
];

module.exports = {
  floorCreateValidation,
  floorUpdateValidation,
};
