const catchAsync = require("../middlewares/catchAsync");
const projectService = require("../services/project.service");

// CONTROLLER: CREATE PROJECT
exports.createProject = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const result = await projectService.createProjectService(req.body, userId);

  res.status(201).json({
    success: true,
    code: "PROJECT_CREATED",
    message: "Project created successfully",
    data: {
      result
    },
  });
});

// CONTROLLER: SELECT INPUT=WEBFLOW|FRAMER
exports.selectInputProvider = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const {projectId} = req.params;

  const result = await projectService.selectInputProviderService(req.body, userId, projectId);

  res.status(200).json({
    success: true,
    code: "INPUT_PROVIDER_SELECTED",
    message: "Input provider selected successfully",
    data: {
      result
    }
  })
});

// CONTROLLER: SAVE WEBFLOW SECRET KEY
exports.saveWebflowSecretKey = catchAsync(async (req, res, next) => {
  const userId = req.user;
  const { projectId } = req.params;

  const result = await projectService.saveWebflowSecretKeyService(req.body, userId, projectId);

  res.status(200).json({
    success: true,
    code: "PROVIDER_CONFIGURED",
    message: "Webhook provider configured successfully",
    data: {
      result
    }
  })
});

// CONTROLLER: ADD DESTINATION EMAIL
exports.addDestinationEmail = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { projectId } = req.params;

  const result = await projectService.addDestinaonEmailService(req.body, userId, projectId);

  res.status(200).json({
    success: true,
    code: "PROJECT_SETUP_COMPLETED",
    message: "Project setup completed successfully",
    data: {
      result
    }
  });
});