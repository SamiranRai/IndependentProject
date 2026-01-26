const AppError = require("../middlewares/AppError");
const crypto = require("crypto");
const ProjectModel = require("../models/project.model");
const UserModel = require("../models/user.model");
const RelayEmailModel = require("../models/relayEmail.model");
const { env } = require("../config/env");

exports.createProjectService = async (body, userId) => {
  // INPUT
  const name= body.name?.trim();
  if (!name)
    throw new AppError("Please enter the Project Name!", 400, "MISSING_FIELDS");

  // NEW PROJECT CREATE
  const project = await ProjectModel.create({
    name: name.trim(),
    userId,
    status: "onboarding"
  });

  // SEND BACK RESPONSE
  return {
    project: {
      id: project._id,
      name: project.name,
      status: project.status,
      createdAt: project.createdAt,
    }
  };
};



// @FIXME: FIX THIS LATER
// exports.addDestinationEmailService = async (body, userId, projectId) => {
//   const { destinationEmail, label } = body;
//   if (!destinationEmail) {
//     throw new AppError("Destination email is required", 400, "MISSING_FIELDS");
//   }

//   // Basic email format check (keep simple for MVP)
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(destinationEmail)) {
//     throw new AppError("Invalid destination email", 400, "INVALID_EMAIL");
//   }

//   // VERIFY PROJECT OWNERSHIP
//   const project = await ProjectModel.findOne({
//     _id: projectId,
//     userId,
//   });

//   if (!project) {
//     throw new AppError(
//       "Project not found or access denied",
//       404,
//       "PROJECT_NOT_FOUND"
//     );
//   }

//   // FIND RELAY EMAIL FOR THE PROJECT
//   const relayEmail = await RelayEmailModel.findOne({
//     projectId: project._id,
//     deletedAt: null,
//     status: "ACTIVE",
//   });

//   if (!relayEmail) {
//     throw new AppError(
//       "Relay email not found for project",
//       404,
//       "RELAY_EMAIL_NOT_FOUND"
//     );
//   }

//   // UPDATE DESTINATION EMAIL
//   relayEmail.destinationEmail = destinationEmail.toLowerCase().trim();
//   relayEmail.label = label?.trim() || relayEmail.label;
//   relayEmail.forwardingEnabled = true;
//   await relayEmail.save();

//   // MARK USER ONBOARDING COMPLETE
//   await UserModel.findByIdAndUpdate(userId, {
//     hasCompletedOnboarding: true,
//   });

//   // RETURN CLEAN RESPONSE
//   return {
//     relayEmail: {
//       address: relayEmail.address,
//       destinationEmail: relayEmail.destinationEmail,
//       forwardingEnabled: relayEmail.forwardingEnabled,
//       label: relayEmail.label,
//     },
//     onboardingCompleted: true,
//   };
// };