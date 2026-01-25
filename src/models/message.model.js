const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // ─────────────────────────────────────────────
    // SOURCE TYPE (HOW DATA ENTERED THE SYSTEM)
    // ─────────────────────────────────────────────
    sourceType: {
      type: String,
      enum: ["email", "webhook", "api", "manual"],
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["mailgun", "ses", "sendgrid", "internal"], // internal = webhook
      required: true,
      index: true,
    },
    // ─────────────────────────────────────────────
    // OWNERSHIP / ROUTING
    // ─────────────────────────────────────────────
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    relayEmailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RelayEmail",
      required: true,
      index: true,
    },

    // ─────────────────────────────────────────────
    // BASIC METADATA (ALWAYS STORED)
    // ─────────────────────────────────────────────
    from: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    to: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    subject: {
      type: String,
      trim: true,
    },

    // ─────────────────────────────────────────────
    // CONTENT (TEMPORARY / CONDITIONAL)
    // ─────────────────────────────────────────────
    text: {
      type: String,
    },

    html: {
      type: String,
    },

    rawEmail: {
      type: String, // base64 or raw RFC822
      select: false,
    },

    contentStored: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ─────────────────────────────────────────────
    // CLASSIFICATION (SYSTEM OPINION)
    // ─────────────────────────────────────────────
    classification: {
      type: String,
      enum: ["spam", "legit", "uncertain", "unknown"],
      default: "unknown",
      index: true,
    },

    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    decisionSource: {
      type: String,
      enum: ["rule", "ml", "llm", "manual"],
    },

    // ─────────────────────────────────────────────
    // HANDLING DECISION (WHAT WE DID)
    // ─────────────────────────────────────────────
    handling: {
      type: String,
      enum: ["BLOCKED", "FORWARDED"],
      index: true,
    },

    // ─────────────────────────────────────────────
    // DELIVERY (ONLY FOR FORWARDED EMAILS)
    // ─────────────────────────────────────────────
    deliveryStatus: {
      type: String,
      enum: ["PENDING", "DELIVERED", "FAILED"],
      default: "PENDING",
      index: true,
    },

    forwardedAt: {
      type: Date,
    },

    destination: {
      type: String, // email / webhook / crm
    },

    // ─────────────────────────────────────────────
    // USER OVERRIDE / FEEDBACK
    // ─────────────────────────────────────────────
    userOverride: {
      type: Boolean,
      default: false,
      index: true,
    },

    overriddenAt: Date,

    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ─────────────────────────────────────────────
    // PROVIDER / DEBUG
    // ─────────────────────────────────────────────
    providerMessageId: {
      type: String,
      index: true,
    },

    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // ─────────────────────────────────────────────
    // RETENTION / CLEANUP
    // ─────────────────────────────────────────────
    expiresAt: {
      type: Date,
      index: true,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ─────────────────────────────────────────────
// IMPORTANT INDEXES
// ─────────────────────────────────────────────
messageSchema.index({ projectId: 1, receivedAt: -1 });
messageSchema.index({ classification: 1, handling: 1 });
messageSchema.index({ deliveryStatus: 1, handling: 1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const MessageModel = mongoose.model("Message", messageSchema);
module.exports = MessageModel;
