const mongoose = require("mongoose");

module.exports = mongoose.model("PublicIdReservation", new mongoose.Schema({
  _id: { type: String },
  createdAt: { type: Date, default: Date.now },
}));
