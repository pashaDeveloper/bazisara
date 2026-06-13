const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Counter = require("./counter");
const baseSchema = require("./baseSchema.model");

const commentSchema = new mongoose.Schema(
  {
    commentId: { type: Number, unique: true },
    title: { type: String, default: "" },
    body: { type: String, required: true },
    created_at: { type: String, default: "" },
    rate: { type: Number, default: 0 },
    reactions: {
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
    },
    is_buyer: { type: Boolean, default: false },
    user_name: { type: String, default: "" },
    is_anonymous: { type: Boolean, default: false },
    relative_date: { type: String, default: "" },
    customer: { type: ObjectId, ref: "User" },
    creator: { type: ObjectId, ref: "Admin" },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

commentSchema.pre("save", async function (next) {
  try {
    if (!this.commentId) {
      const counter = await Counter.findOneAndUpdate({ name: "commentId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      this.commentId = counter.seq;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Comment", commentSchema);
