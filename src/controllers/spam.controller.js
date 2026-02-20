const catchAsync = require("../middlewares/catchAsync");
const spamService = require("../services/spam.service");
const { DEFAULT_RANGE, PAGINATION } = require("../constants/spam");

/*
 * QUERY PARAMS:
 *   - range: 'day' | 'week' | 'month' (default: day)
 *   - page: number (default: 1)
 *   - limit: number (default: 50, max: 100)
 */
// CONTROLLER: GET SPAM BOX DATA FOR A PROJECT
exports.getSpamBox = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;
  const {
    range = DEFAULT_RANGE,
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
  } = req.query;

  const result = await spamService.getSpamBoxService(userId, projectId, {
    range,
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    code: "SPAM_BOX_FETCHED",
    message: "Spam box data loaded successfully",
    data: result,
  });
});

// CONTROLLER: CLEAR SPAM HISTORY
exports.clearSpamHistory = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;
  const { range = DEFAULT_RANGE } = req.body;

  const result = await spamService.clearSpamHistoryService(
    userId,
    projectId,
    range
  );

  res.status(200).json({
    success: true,
    code: "SPAM_HISTORY_CLEARED",
    message: "Spam history cleared successfully",
    data: { deletedCount: result.deletedCount },
  });
});

// CONTROLLER: GET FULL DETAIL OF A SINGLE SPAM MESSAGE (FOR MODAL VIEW)
exports.getSpamMessageDetail = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId, messageId } = req.params;

  const result = await spamService.getSpamMessageDetailService(
    userId,
    projectId,
    messageId
  );

  res.status(200).json({
    success: true,
    code: "SPAM_MESSAGE_DETAIL_FETCHED",
    message: "Spam message detail loaded successfully",
    data: result,
  });
});

// CONTROLLER: USER OVERRIDE (MARK MESSAGE AS NOT SPAM)
exports.overrideSpamMessage = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId, messageId } = req.params;

  const result = await spamService.overrideSpamMessageService(
    userId,
    projectId,
    messageId
  );

  res.status(200).json({
    success: true,
    code: "SPAM_MESSAGE_OVERRIDDEN",
    message: "Message marked as not spam and queued for delivery",
    data: result,
  });
});

// CONTROLLER: DELETE A SINGLE SPAM MESSAGE
exports.deleteSpamMessage = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId, messageId } = req.params;

  const result = await spamService.deleteSpamMessageService(
    userId,
    projectId,
    messageId
  );

  res.status(200).json({
    success: true,
    code: "SPAM_MESSAGE_DELETED",
    message: "Spam message deleted successfully",
    data: result,
  });
});
