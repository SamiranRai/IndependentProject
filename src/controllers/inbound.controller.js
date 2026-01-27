const AppError = require("../middlewares/AppError");
const catchAsync = require("../middlewares/catchAsync");
const WebhookSourceModel = require("../models/webhookSource.model");
const inboundService = require("../services/inbound.service");
const verifyWebflowSignature = require("../utils/verifyWebflowSignature");

// CONTROLLER: INBOUND EMAIL CONTROLLER
exports.inboundEmail = catchAsync(async (req, res, next) => {
  // MAILGUN SEND THE PAYLOAD
  const payload = req.body;

  await inboundService.processInboundEmailService(payload);
  res.status(200).send("OK");
});

//webhookUrl: /api/v1/inbound/webhook/${identifier}, --type=webflow,framer,custom
// CONTROLLER: INBOUND WEBHOOK CONTROLLER
exports.inboundWebhook = catchAsync(async (req, res, next) => {
  const { identifier } = req.params;

  // FIND THE WEBHOOK OWNER
  const source = await WebhookSourceModel.findOne({
    identifier,
    status: "ACTIVE",
    deletedAt: null,
  }).select("+secret");

  if (!source) {
    return res.status(404).end();
  }

  // EXPLICIT CHECK FOR WEBFLOW
  if (source.provider === "webflow") {
    // VALIDATE THE WEBFLOW REQ
    verifyWebflowSignature(req, source.secret);
  }

  res.status(200).json({ ok: true });

  // CALL AFTER TO PREVENT FROM WEBFLOW REQ. AGAIN
  await inboundService.processInboundWebhookService(req.body, source);
});
