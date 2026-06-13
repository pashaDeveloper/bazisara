const ShippingMethod = require("../models/shippingMethod.model");
const createService = require("../services/catalogEntity.service");
const createController = require("../controllers/catalogEntity.controller");
const createRoute = require("./catalogEntity.route");

const fields = [
  { name: "title_fa", type: "string" },
  { name: "title_en", type: "string" },
  { name: "description", type: "string" },
  { name: "price", type: "number" },
  { name: "estimated_days", type: "number" },
  { name: "provider", type: "string" },
  { name: "is_express", type: "boolean" },
  { name: "visibility", type: "boolean" },
  { name: "status", type: "string" },
];

const service = createService({
  Model: ShippingMethod,
  entityLabel: "نحوه ارسال",
  fields,
  required: ["title_fa"],
  searchFields: ["title_fa", "title_en", "description", "provider"],
});

module.exports = createRoute({
  controller: createController(service),
  storageFolder: "shipping-methods",
});
