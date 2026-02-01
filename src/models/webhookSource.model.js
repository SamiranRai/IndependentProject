const mongoose = require("mongoose");

const webhookSourceSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["webflow", "framer"],
      required: true,
      index: true,
    },
    identifier: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    secret: {
      type: String,
      select: false,
    },
    endPoint: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["unconfigured", "active", "disabled"],
      default: "unconfigured",
    },
    lastRecivedAt: {
      type: Date,
      default: null,
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
