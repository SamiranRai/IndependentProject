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
      required: [true, "Project name must!"],
      maxLength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["onboarding", "active", "deleted"],
      default: "onboarding",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    output: {
      type: {
        type: String,
        enum: ["email"], // later -> Integration
        default: "email",
      },

      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
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
