const catchAsync = require("../middlewares/catchAsync");
const projectService = require("../services/project.service");
const ProjectInputService = require("../services/setupProjectInput.service");

/**
 * Onboarding Step1
 * Create Project Name
 **/

// CONTROLLER: CREATE PROJECT
exports.createProject = catchAsync(async (req, res, next) => {
  // LOGGED IN USER
  const userId = req.user.id;

  const result = await projectService.createProjectService(req.body, userId);

  // SEND RESPONSE
  res.status(201).json({
    success: true,
    code: "PROJECT_CREATED",
    data: result,
  });
});

// CONTROLLER: SELECT INPUT AND CREATE RELAY EMAIL Or WEBHOOK
exports.setupProjectInput = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { projectId } = req.params;

  const result = await ProjectInputService.setupProjectInputService(
    req.body,
    userId,
    projectId
  );

  res.status(200).json({
    success: true,
    code: "",
    data: result,
  });
});

// CONTROLLER: SAVE WEBFLOW SECRET KEY
exports.saveWebflowWebhook = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  await ProjectInputService.saveWebflowSecretKeyService(req.body, projectId);
  res.status(200).json({
    success: true,
  });
});

/**
 * Onboarding Step3
 * Add destination email for output, later in Future Integration
 **/

// @NEED_FIX: due to relay email model changes
// exports.addDestinationEmail = catchAsync(async (req, res, next) => {
//   const userId = req.user.id;
//   const projectId = req.params.projectId;
//   const { relayEmail, onboardingCompleted } =
//     await projectService.addDestinationEmailService(
//       req.body,
//       userId,
//       projectId
//     );

//   res.status(200).json({
//     success: true,
//     code: "SETUP_COMPLETED",
//     message: "Onboarding successfully completed..",
//     data: {
//       relayEmail,
//       onboardingCompleted,
//     },
//   });
// });
