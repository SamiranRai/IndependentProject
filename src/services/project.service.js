const AppError = require("../middlewares/AppError");
const ProjectModel = require("../models/project.model");
const UserModel = require("../models/user.model");

exports.createProjectService = async (body, userId) => {
  // INPUT
  const { name } = body;
  if (!name) throw new AppError("Please enter the Project Name!", 400);

  // NEW PROJECT CREATE
  const project = await ProjectModel.create({
    name: name,
    userId: userId,
  });

  // PROJECT SVAED

  // RELAY EMAIL GENERATED

  // RELAY EMAIL SAVED

  // SEND BACK RESPONSE WITH RELAY EMAIL AND PROJECTS
  return; //{ project, relayEmail };
};

exports.finishOnboardingService = async ({
  destinationEmail, // input
  userId, // req.user // logedin
  projectId, // req.params
}) => {
  // projects/:projectId/finishOnboarding

  if (!destinationEmail)
    throw new AppError("Destination Email is required!", 400);

  // Fetch Project and verify ownership
  const project = await ProjectModel.findOne({
    _id: projectId,
    userId,
    status: "onboarding",
  });

  if (!project) throw new AppError("Project not found or Alredy active", 400);

  // Save
  // Ops Skip but added later

  // Activate Project
  project.status = "active";
  await project.save({ validateBeforeSave: false });

  // Mark user onbaording complete
  await UserModel.findByIdAndUpdate(userId, {
    hasCompletedOnboarding: true,
  });
};
