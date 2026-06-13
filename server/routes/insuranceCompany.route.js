const InsuranceCompany = require("../models/insuranceCompany.model");
const createService = require("../services/catalogEntity.service");
const createController = require("../controllers/catalogEntity.controller");
const createRoute = require("./catalogEntity.route");

const fields = [
  { name: "name_fa", type: "string" },
  { name: "name_en", type: "string" },
  { name: "description", type: "string" },
  { name: "is_international", type: "boolean" },
  { name: "is_trusted", type: "boolean" },
  { name: "is_official", type: "boolean" },
  { name: "is_new", type: "boolean" },
  { name: "visibility", type: "boolean" },
  { name: "license_number", type: "string" },
  { name: "regulatory_body", type: "string" },
  { name: "solvency_level", type: "number", nullable: true },
  { name: "customer_satisfaction_rate", type: "number", nullable: true },
  { name: "claim_settlement_rate", type: "number", nullable: true },
  { name: "phone", path: "contact.phone", type: "string" },
  { name: "website", path: "contact.website", type: "string" },
  { name: "email", path: "contact.email", type: "string" },
  { name: "total_rate", path: "rating.total_rate", type: "number" },
  { name: "total_count", path: "rating.total_count", type: "number" },
  { name: "commitment", path: "rating.commitment", type: "number" },
  { name: "no_return", path: "rating.no_return", type: "number" },
  { name: "on_time_shipping", path: "rating.on_time_shipping", type: "number" },
];

const service = createService({
  Model: InsuranceCompany,
  entityLabel: "شرکت بیمه",
  fields,
  required: ["name_fa"],
  searchFields: ["name_fa", "name_en", "description", "contact.website", "contact.email"],
});

module.exports = createRoute({
  controller: createController(service),
  storageFolder: "insurance-companies",
  uploadFields: [{ name: "logo", maxCount: 1 }],
});
