const Insurance = require("../models/insurance.model");
const createService = require("../services/catalogEntity.service");
const createController = require("../controllers/catalogEntity.controller");
const createRoute = require("./catalogEntity.route");

const fields = [
  { name: "title_fa", type: "string" },
  { name: "title_en", type: "string" },
  { name: "duration_months", type: "number" },
  { name: "provider", type: "string" },
  { name: "coverage", type: "array" },
  { name: "exclusions", type: "array" },
  { name: "refund_policy", type: "array" },
  { name: "activation_method", type: "array" },
  { name: "global_discount_percent", type: "number" },
  { name: "status", type: "string" },
];

const service = createService({
  Model: Insurance,
  entityLabel: "بیمه",
  fields,
  populate: "provider",
  required: ["title_fa", "duration_months", "provider"],
  searchFields: ["title_fa", "title_en", "coverage", "exclusions"],
});

module.exports = createRoute({
  controller: createController(service),
  storageFolder: "insurances",
});
