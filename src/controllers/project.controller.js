const catchAsync = require("../middlewares/catchAsync");
const projectService = require("../services/project.service");

exports.createProject = catchAsync(async (req, res, next) => {
  // GET USER_ID OF LOGGED IN USER
  const userId = req.user.id;
  const { project, relayEmail } = await projectService.createProjectService(
    req.body,
    userId
  );

  // SEND RESPONSE
  res.status(201).json({
    success: true,
    code: "PROJECT_CREATED",
    data: {
      project,
      relayEmail,
    },
  });
});

exports.addDestinationEmail = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const projectId = req.params.projectId;
  const { relayEmail, onboardingCompleted } =
    await projectService.addDestinationEmailService(req.body, userId, projectId);

  res.status(200).json({
    success: true,
    code: "SETUP_COMPLETED",
    message: "Onboarding successfully completed..",
    data: {
      relayEmail,
      onboardingCompleted
    }
  });
});
