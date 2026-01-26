const mongoose = require("mongoose");

const webhookSourceSchema = new mongoose.Schema(
  {
    // ─────────────────────────────
    // INPUT OWNERSHIP
    // ─────────────────────────────
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true, // V1: one webhook per project
      index: true,
    },
    provider: {
      type: String,
      enum: ["webflow", "framer", "custom"],
      required: true,
      index: true,
    },
    // Used to identify incoming webhook
    identifier: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // webflow → siteId
      // framer/custom → token
    },
    // Only for providers that support signing (Webflow)
    secret: {
      type: String,
      select: false,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED"],
      default: "ACTIVE",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const WebhookSourceModel = mongoose.model("WebhookSource", webhookSourceSchema);
module.exports = WebhookSourceModel;
