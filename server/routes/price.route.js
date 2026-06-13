const Price = require("../models/price.model");
const createService = require("../services/catalogEntity.service");
const createController = require("../controllers/catalogEntity.controller");
const createRoute = require("./catalogEntity.route");

const fields = [
  { name: "selling_price", type: "number" },
  { name: "rrp_price", type: "number" },
  { name: "order_limit", type: "number" },
  { name: "is_incredible", type: "boolean" },
  { name: "is_promotion", type: "boolean" },
  { name: "is_locked_for_techplus", type: "boolean" },
  { name: "bnpl_active", type: "boolean" },
  { name: "marketable_stock", type: "number", nullable: true },
  { name: "discount_percent", type: "number" },
  { name: "is_plus_early_access", type: "boolean" },
  { name: "status", type: "string" },
];

const service = createService({
  Model: Price,
  entityLabel: "قیمت",
  fields,
  required: ["selling_price", "rrp_price", "order_limit"],
  searchFields: [],
});

module.exports = createRoute({
  controller: createController(service),
  storageFolder: "prices",
});
