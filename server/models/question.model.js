const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Counter = require("./counter");
const baseSchema = require("./baseSchema.model");

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: Number, unique: true },
    text: { type: String, required: true },
    status: { type: String, enum: ["pending", "answered", "closed"], default: "pending" },
    answer_count: { type: Number, default: 0 },
    sender: { type: String, default: "" },
    created_at: { type: String, default: "" },
    customer: { type: ObjectId, ref: "User" },
    creator: { type: ObjectId, ref: "Admin" },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

questionSchema.pre("save", async function (next) {
  try {
    if (!this.questionId) {
      const counter = await Counter.findOneAndUpdate({ name: "questionId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      this.questionId = counter.seq;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Question", questionSchema);
