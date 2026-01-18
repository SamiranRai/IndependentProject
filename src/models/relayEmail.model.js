const mongoose = require("mongoose");

const relayEmailSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // Full email address
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Used for inbound routing
    localPart: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    domain: {
      type: String,
      required: true,
      default: "relay.myapp.com",
    },

    // Where legit emails go
    destinationEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    label: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    // ACTIVE | DISABLED
    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED"],
      default: "ACTIVE",
    },

    // Runtime switch (quick pause)
    forwardingEnabled: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const RelayEmailModel = mongoose.model("RelayEmail", relayEmailSchema);
module.exports = RelayEmailModel;
