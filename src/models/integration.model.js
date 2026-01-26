const mongoose = require("mongoose");
const crypto = require('crypto');

const integrationSchema = mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ["webhook"],
      required: true,
    },

    provider: {
      type: String,
      enum: ["webflow", "framer"],
      required: true,
      index: true,
    },
    // Webflow: siteId
    externalId: {
      type: String,
      index: true,
    },

    // Framer: internal token
    integrationToken: {
      type: String,
      index: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
  },
  { timestamps: true }
);

// GENERATE INTEGRATION TOKEN FOR FRAMER
integrationSchema.statics.generateTokenForFramer = function() {
  return crypto.randomBytes(32).toString("hex");
}

// FACTORY METHOD FOR FRAMER INTEGRATION
integrationSchema.statics.createFramerIntegration = async function({ projectId }) {
  return await this.create({
    projectId,
    sourceType: "webhook",
    provider: "framer",
    integrationToken: this.generateTokenForFramer(),
    status: "active"
  });
}

// FACTORY METHOD FOR WEBFLOW INTEGRATION


const IntegrationModel = mongoose.model('Integration', integrationSchema);
module.exports = IntegrationModel;