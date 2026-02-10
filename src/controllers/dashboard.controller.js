const catchAsync = require("../middlewares/catchAsync");
const dashboardService = require("../services/dashboard.service");

// CONTROLLER: GET ALL PROJECTS
exports.getDashboard = catchAsync(async (req, res, next) => {
  const userId = req.user;
  const result = await dashboardService.getDashboardService(userId);

  res.status(200).json({
    success: true,
    code: "DASHBOARD_DATA_FETCHED",
    message: "Dashboard data successfully loaded..",
    data: {
      result,
    },
  });
});
