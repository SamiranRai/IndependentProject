const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, "Project name is required"],
      maxLength: 100,
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    runTimeStatus: {
      type: String,
      enum: ["enabled", "paused"],
      default: "enabled",
    },
    output: {
      type: { type: String, enum: ["email"], default: "email" },
      config: {
        email: {
          type: String,
          lowercase: true,
          trim: true,
        },
        label: String,
      },
    },
    setup: {
      inputProvider: {
        type: String,
        enum: ["webflow", "framer"]
      },
      providerConfigured: Boolean,
      destinationConfigured: Boolean,
      completedAt: Date
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ProjectModel = mongoose.model("Project", projectSchema);
module.exports = ProjectModel;
