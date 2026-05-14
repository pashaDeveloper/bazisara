const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const baseSchema = require("./baseSchema.model");

const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Genre name is required"],
      trim: true,
      maxLength: [100, "Genre name must be at most 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxLength: [500, "Description must be at most 500 characters"],
    },
    icon: {
      type: ObjectId,
      ref: "Icon",
      default: null,
    },
    image: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },
    ...baseSchema.obj,
  },
  { timestamps: true }
);

genreSchema.index(
  { name: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Genre = mongoose.model("Genre", genreSchema);

module.exports = Genre;
