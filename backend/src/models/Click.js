import mongoose from "mongoose";

const clickSchema = new mongoose.Schema(
  {
    url: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Url",
      required: true,
    },
    clickedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    browser: {
      type: String,
      default: "Unknown",
      maxlength: 100,
    },
    device: {
      type: String,
      default: "Desktop",
      maxlength: 100,
    },
    referrer: {
      type: String,
      default: "Direct",
      maxlength: 2048,
    },
  },
  { versionKey: false },
);

clickSchema.index({ url: 1, clickedAt: -1 });

export const Click = mongoose.model("Click", clickSchema);
