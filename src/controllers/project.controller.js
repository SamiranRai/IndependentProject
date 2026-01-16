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
      relayEmail
    }
  });
});

exports.finishOnboarding = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const { destinationEmail } = req.body;

  await projectService.finishOnboardingService({
    destinationEmail,
    userId,
    projectId,
  });

  res.status(200).json({
    status: "success",
    message: "Onboarding successfully completed..",
  });
});
