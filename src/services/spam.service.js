const mongoose = require("mongoose");
const AppError = require("../middlewares/AppError");
const MessageModel = require("../models/message.model");
const ProjectModel = require("../models/project.model");
const { validateObjectId } = require("../utils/validateObjectId");
const { normalizePayload } = require("../utils/normalizePayload");
const {
  VALID_RANGES,
  TIME_RANGES_DAYS,
  DEFAULT_RANGE,
  PAGINATION,
} = require("../constants/spam");

// SERVICE: GET SPAM BOX DATA FOR A PROJECT
exports.getSpamBoxService = async (
  userId,
  projectId,
  { range = DEFAULT_RANGE, page, limit } = {}
) => {
  if (!userId) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
  validateObjectId(projectId, "Project");

  const project = await ProjectModel.findOne({
    _id: projectId,
    userId,
    deletedAt: null,
  });
  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  const validRange = normalizeRange(range);
  const { start, end } = getDateRange(validRange);
  const { page: p, limit: l, skip } = normalizePagination(page, limit);

  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  const matchQuery = {
    projectId: projectObjectId,
    receivedAt: { $gte: start, $lte: end },
    deletedAt: null,
  };

  const [statsResult, messages, totalBlocked] = await Promise.all([
    MessageModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalReceived: { $sum: 1 },
          delivered: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$handling", "forwarded"] },
                    { $eq: ["$deliveryStatus", "delivered"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          blocked: {
            $sum: {
              $cond: [{ $eq: ["$handling", "blocked"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalReceived: { $ifNull: ["$totalReceived", 0] },
          delivered: { $ifNull: ["$delivered", 0] },
          blocked: { $ifNull: ["$blocked", 0] },
        },
      },
    ]),
    MessageModel.find({ ...matchQuery, handling: "blocked" })
      .sort({ receivedAt: -1 })
      .skip(skip)
      .limit(l)
      .lean()
      .select("payload provider classification confidenceScore reason receivedAt"),
    MessageModel.countDocuments({ ...matchQuery, handling: "blocked" }),
  ]);

  const stats = statsResult[0] || {
    totalReceived: 0,
    delivered: 0,
    blocked: 0,
  };

  const spamList = messages.map((msg) => ({
    id: msg._id,
    email: extractSenderEmail(msg),
    spamReason: msg.reason || "No reason provided",
    score: msg.confidenceScore ?? null,
    scoreDisplay: formatScoreDisplay(msg.confidenceScore),
    date: msg.receivedAt,
    isHighConfidence: (msg.confidenceScore ?? 0) >= 80,
  }));

  return {
    projectName: project.name,
    range: validRange,
    summary: {
      totalReceived: stats.totalReceived,
      delivered: stats.delivered,
      blocked: stats.blocked,
      spamRate: calculateSpamRate(stats.blocked, stats.totalReceived),
    },
    messages: spamList,
    pagination: {
      page: p,
      limit: l,
      total: totalBlocked,
      totalPages: Math.ceil(totalBlocked / l) || 1,
    },
  };
};

// SERVICE: CLEAR SPAM HISTORY FOR A PROJECT
exports.clearSpamHistoryService = async (userId, projectId, range = DEFAULT_RANGE) => {
  if (!userId) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
  validateObjectId(projectId, "Project");

  const project = await ProjectModel.findOne({
    _id: projectId,
    userId,
    deletedAt: null,
  });
  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  const validRange = normalizeRange(range);
  const { start, end } = getDateRange(validRange);

  const result = await MessageModel.updateMany(
    {
      projectId,
      handling: "blocked",
      receivedAt: { $gte: start, $lte: end },
      deletedAt: null,
    },
    { $set: { deletedAt: new Date() } }
  );

  return { deletedCount: result.modifiedCount };
};

// SERVICE: GET FULL DETAIL OF A SINGLE SPAM MESSAGE (FOR MODAL VIEW)
exports.getSpamMessageDetailService = async (userId, projectId, messageId) => {
  if (!userId) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
  validateObjectId(projectId, "Project");
  validateObjectId(messageId, "Message");

  const project = await ProjectModel.findOne({
    _id: projectId,
    userId,
    deletedAt: null,
  });
  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  const message = await MessageModel.findOne({
    _id: messageId,
    projectId,
    handling: "blocked",
    deletedAt: null,
  }).lean();

  if (!message) {
    throw new AppError("Spam message not found", 404, "MESSAGE_NOT_FOUND");
  }

  return {
    id: message._id,
    email: extractSenderEmail(message),
    spamReason: message.reason || "No reason provided",
    score: message.confidenceScore ?? null,
    scoreDisplay: formatScoreDisplay(message.confidenceScore),
    date: message.receivedAt,
    isHighConfidence: (message.confidenceScore ?? 0) >= 80,
    payload: message.payload,
    provider: message.provider,
    classification: message.classification,
    decisionSource: message.decisionSource,
    userOverride: message.userOverride || false,
    deliveryStatus: message.deliveryStatus,
    receivedAt: message.receivedAt,
    createdAt: message.createdAt,
  };
};

// SERVICE: USER OVERRIDE (MARK MESSAGE AS NOT SPAM)
exports.overrideSpamMessageService = async (userId, projectId, messageId) => {
  if (!userId) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
  validateObjectId(projectId, "Project");
  validateObjectId(messageId, "Message");

  const project = await ProjectModel.findOne({
    _id: projectId,
    userId,
    deletedAt: null,
  });
  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  const message = await MessageModel.findOne({
    _id: messageId,
    projectId,
    deletedAt: null,
  });

  if (!message) {
    throw new AppError("Message not found", 404, "MESSAGE_NOT_FOUND");
  }

  if (message.userOverride) {
    throw new AppError(
      "Message has already been overridden",
      409,
      "MESSAGE_ALREADY_OVERRIDDEN"
    );
  }

  if (message.handling !== "blocked") {
    throw new AppError(
      "Only blocked messages can be overridden",
      409,
      "MESSAGE_NOT_BLOCKED"
    );
  }

  if (message.deliveryStatus === "delivered") {
    throw new AppError(
      "Delivered messages cannot be overridden",
      409,
      "MESSAGE_ALREADY_DELIVERED"
    );
  }

  // Record user override and queue for delivery
  message.userOverride = true;
  message.overriddenAt = new Date();
  message.overriddenBy = userId;
  message.handling = "forwarded";
  message.deliveryStatus = "pending";
  message.processing = false;

  await message.save();

  return {
    id: message._id,
    email: extractSenderEmail(message),
    spamReason: message.reason || "No reason provided",
    score: message.confidenceScore ?? null,
    scoreDisplay: formatScoreDisplay(message.confidenceScore),
    date: message.receivedAt,
    isHighConfidence: (message.confidenceScore ?? 0) >= 80,
    userOverride: message.userOverride,
    deliveryStatus: message.deliveryStatus,
  };
};

// -----------------------------HELPERS-------------------------------

// HELPER: GET DATE RANGE
function getDateRange(rangeKey) {
  const days = TIME_RANGES_DAYS[rangeKey] ?? TIME_RANGES_DAYS[DEFAULT_RANGE];
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

// HELPER: NORMALIZE RANGE
function normalizeRange(range) {
  const normalized = (range || "").toLowerCase().trim();
  return VALID_RANGES.includes(normalized) ? normalized : DEFAULT_RANGE;
}

// HELPER: NORMALIZE PAGINATION
function normalizePagination(page, limit) {
  const p = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const l = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT)
  );
  return { page: p, limit: l, skip: (p - 1) * l };
}

// HELPER: EXTRACT SENDER EMAIL
function extractSenderEmail(message) {
  try {
    const normalized = normalizePayload(message);
    return (
      normalized?.to ||
      message.payload?.Email ||
      message.payload?.email ||
      "—"
    );
  } catch {
    return "—";
  }
}

// HELPER: FORMAT CONFIDENCE SCORE DISPLAY
function formatScoreDisplay(score) {
  const value = score != null ? Math.round(score) : 0;
  return `${value}/100`;
}

// HELPER: CALCULATE SPAM RATE
function calculateSpamRate(blocked, totalReceived) {
  if (!totalReceived || totalReceived === 0) return 0;
  return Math.round((blocked / totalReceived) * 100);
}