const AppError = require("../middlewares/AppError");
const crypto = require("crypto");
const ProjectModel = require("../models/project.model");
const UserModel = require("../models/user.model");
const RelayEmailModel = require("../models/relayEmail.model");

exports.createProjectService = async (body, userId) => {
  // INPUT
  const name= body.name?.trim();
  if (!name)
    throw new AppError("Please enter the Project Name!", 400, "MISSING_FIELDS");

  // NEW PROJECT CREATE
  const project = await ProjectModel.create({
    name: name,
    userId,
  });

  // GENERATE THE RELAY EMAIL
  const domain = "in.samiran.studio";
  let relayEmail = null;
  let attempts = 0;

  while (!relayEmail && attempts < 10) {
    try {
      // generate the relay email
      const localPart = generateRelayLocalPart(name);
      const address = `${localPart}@${domain}`;

      // save the relay email
      relayEmail = await RelayEmailModel.create({
        projectId: project._id,
        localPart,
        address,
        domain,
        status: "ACTIVE",
        forwardingEnabled: false,
      });
    } catch (err) {
      // Duplicate key error → regenerate
      if (err.code === 11000) {
        attempts++;
        continue;
      }
      throw err;
    }
  }

  if (!relayEmail) {
    throw new AppError(
      "Failed to generate relay email. Please try again.",
      500,
      "RELAY_EMAIL_FAILED"
    );
  }

  // SEND BACK RESPONSE WITH RELAY EMAIL AND PROJECTS
  return {
    project: {
      id: project._id,
      name: project.name,
      createdAt: project.createdAt,
    },
    relayEmail: {
      address: relayEmail.address,
      forwardingEnabled: relayEmail.forwardingEnabled,
    },
  };
};

exports.addDestinationEmailService = async (body, userId, projectId) => {
  const { destinationEmail, label } = body;
  if (!destinationEmail) {
    throw new AppError("Destination email is required", 400, "MISSING_FIELDS");
  }

  // Basic email format check (keep simple for MVP)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(destinationEmail)) {
    throw new AppError("Invalid destination email", 400, "INVALID_EMAIL");
  }

  // VERIFY PROJECT OWNERSHIP
  const project = await ProjectModel.findOne({
    _id: projectId,
    userId,
  });

  if (!project) {
    throw new AppError(
      "Project not found or access denied",
      404,
      "PROJECT_NOT_FOUND"
    );
  }

  // FIND RELAY EMAIL FOR THE PROJECT
  const relayEmail = await RelayEmailModel.findOne({
    projectId: project._id,
    deletedAt: null,
    status: "ACTIVE",
  });

  if (!relayEmail) {
    throw new AppError(
      "Relay email not found for project",
      404,
      "RELAY_EMAIL_NOT_FOUND"
    );
  }

  // UPDATE DESTINATION EMAIL
  relayEmail.destinationEmail = destinationEmail.toLowerCase().trim();
  relayEmail.label = label?.trim() || relayEmail.label;
  relayEmail.forwardingEnabled = true;
  await relayEmail.save();

  // MARK USER ONBOARDING COMPLETE
  await UserModel.findByIdAndUpdate(userId, {
    hasCompletedOnboarding: true,
  });

  // RETURN CLEAN RESPONSE
  return {
    relayEmail: {
      address: relayEmail.address,
      destinationEmail: relayEmail.destinationEmail,
      forwardingEnabled: relayEmail.forwardingEnabled,
      label: relayEmail.label,
    },
    onboardingCompleted: true,
  };
};


const generateRelayLocalPart = (projectName) => {
  const base = projectName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "");

    if (!base) throw new AppError("Invalid project name for relay email")

  const randomNumber = Math.floor(Math.random() * 1000); // 0-999 
  return `${base}${randomNumber}`;
};
