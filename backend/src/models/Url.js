import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalUrl: {
      type: String,
      required: true,
      maxlength: 2048,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 32,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

urlSchema.index({ owner: 1, createdAt: -1 });

export const Url = mongoose.model("Url", urlSchema);
