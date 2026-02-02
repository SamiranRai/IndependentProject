const catchAsync = require("../middlewares/catchAsync");
const WebhookSourceModel = require("../models/webhookSource.model");
const inboundService = require("../services/inbound.service");
const verifyFramerSignature = require("../utils/verifyFramerSignature");
const verifyWebflowSignature = require("../utils/verifyWebflowSignature");

// CONTROLLER: INBOUND WEBHOOK CONTROLLER
exports.inboundWebhookController = catchAsync(async (req, res, next) => {
  const { webhookIdentifier } = req.params;

  const webhookSource = await WebhookSourceModel.findOne({
    identifier: webhookIdentifier,
    status: "active",
    deletedAt: null,
  }).select("+secret");

  if (!webhookSource) {
    return res.status(404).end();
  }

  const signatureVerifierFunction = {
    webflow: verifyWebflowSignature,
    framer: verifyFramerSignature,
  };
  const webhookSignatureVerifier =
    signatureVerifierFunction[webhookSource.provider];
  const isWebhookSignatureValid = webhookSignatureVerifier(
    req,
    webhookSource.secret
  );
  if (!isWebhookSignatureValid) {
    console.warn("Invalid webhook signature", {
      provider: webhookSource.provider,
      identifier: webhookSource.identifier,
    });

    return res.status(200).json({ ok: true });
  }

  res.status(200).json({ ok: true });

  inboundService
    .processInboundWebhookService(req.body, webhookSource)
    .catch((err) => console.error("Inbound webhook processing failed", err));
});
