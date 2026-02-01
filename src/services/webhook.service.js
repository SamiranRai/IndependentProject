const crypto = require("crypto");
const WebhookSourceModel = require("../models/webhookSource.model");
const { env } = require("./../config/env");

const createWebhookSource = async (projectId, provider) => {
  const webhookIdentifier = crypto.randomBytes(12).toString("hex");
  const webhookSecretKey =
    provider === "framer" ? crypto.randomBytes(32).toString("hex") : null;

  const endPoint = `${env.API_BASE_URL}/api/v1/inbound/webhook/${webhookIdentifier}`;

  return await WebhookSourceModel.create({
    projectId,
    provider,
    identifier: webhookIdentifier,
    endPoint: endPoint,
    secret: webhookSecretKey,
    status: "unconfigured",
  });
};

module.exports = {
  createWebhookSource,
};
