const crypto = require("crypto");
const { env } = require("../config/env");
const AppError = require("../middlewares/AppError");
const ProjectModel = require("../models/project.model");
const RelayEmailModel = require("../models/relayEmail.model");
const WebhookSourceModel = require("../models/webhookSource.model");

/**
 * Onboarding Step 2
 * Choose and setup project input source
 */

// SERVICE: SELECT INPUT SOURCE=email,webflow,framer,custom
exports.setupProjectInputService = async (body, userId, projectId) => {
  const { type } = body;

  // VALIDATE INPUT TYPE
  if (!type || !["email", "webflow", "framer", "custom"].includes(type)) {
    throw new AppError("Invalid Input Type", 400, "INVALID_INPUT_TYPE");
  }

  // VERIFY PROJECT OWNERSHIP + ONBOARDING STATE
  const project = await ProjectModel.findOne({
    _id: projectId,
    userId,
    status: "onboarding",
  });

  if (!project) {
    throw new AppError(
      "Project not found or already configured",
      404,
      "PROJECT_NOT_FOUND"
    );
  }

  // CHECK ONE INPUT CHANNEL PER PROJECT --future-removal
  const existingEmail = await RelayEmailModel.findOne({ projectId });
  const existingWebhook = await WebhookSourceModel.findOne({ projectId });

  if (existingEmail || existingWebhook) {
    throw new AppError(
      "Input source already configured for this project",
      409,
      "INPUT_ALREADY_EXISTS"
    );
  }

  // CREATE INPUT BASED ON TYPE=email
  if (type === "email") {
    return await setupEmailInput(project); // { inputType: "email", address: relayEmail.address }
  }

  // TYPE=webflow,framer,custom --fornow
  return await setupWebhookInput(projectId, (provider = type));
};

// FUNC: GENERATE AND SAVE RELAY EMAIL
const setupEmailInput = async (project) => {
  const domain = env.DOMAIN_NAME;
  let relayEmail = null;
  let attempts = 0;

  while (!relayEmail && attempts < 10) {
    try {
      const localPart = generateRelayLocalPart(project.name);
      const address = `${localPart}@${domain}`;

      relayEmail = await RelayEmailModel.create({
        projectId: project._id,
        localPart,
        address,
        domain,
        status: "ACTIVE",
      });
    } catch (err) {
      if (err.code === 11000) {
        attempts++;
        continue;
      }
      throw err;
    }
  }

  if (!relayEmail) {
    throw new AppError(
      "Failed to generate relay email. Please try again.",
      500,
      "RELAY_EMAIL_FAILED"
    );
  }

  return {
    inputType: "email",
    address: relayEmail.address,
  };
};

// FUNC: GENERATE WEBHOOKS ACCORDING TO PLATFORM
const setupWebhookInput = async (projectId, provider) => {
  // CREATE A IDENTIFIER USING CRYPTOHASH
  const identifier = crypto.randomBytes(16).toString("hex");

  // SAVE THE WEBHOOK SOURCE --> MAP --> PPROJECT
  await WebhookSourceModel.create({
    projectId, // ownership
    provider, // ["webflow", "framer", "custom"]
    identifier, // "hashstring" -> mapping to -> project
    secret: null, // We're just returning the universal webhook basedOn=webflow,framer,custom
  });

  // RETURN UNIVERSAL WEBHOOK
  return {
    provider,
    webhookUrl: `${env.API_BASE_URL}/api/v1/inbound/webhook/${identifier}`,
    note:
      provider === "webflow"
        ? "You will receive a secret key from Webflow after adding this webhook."
        : "No secret required for this platform.",
  };
};


// SERVICE: SAVE WEBFLOW SECRET KEY
exports.saveWebflowSecretKeyService = async (body, projectId) => {
  const { webflowSecretKey } = body;
  if (!webflowSecretKey)
    throw new AppError(
      "Webflow SecretKey is required",
      400,
      "INVALIDATE_WEBFLOW_SECRET_KEY"
    );

  // FIND PROJECT AND SAVE WEBFLOW SECRET KEY
  const source = await WebhookSourceModel.findOneAndUpdate(
    { projectId, provider: "webflow" }, // find
    { secret: webflowSecretKey }, // update
    { new: true }
  );

  if (!source) {
    throw new AppError("Webhook source not found!", 404, "CODE");
  }

  return;
};

// FUNC: GENERATE IDENTIFIER FOR RELAY EMAIL --> MAPPING TO --> PROJECT
const generateRelayLocalPart = (projectName) => {
  const base = projectName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "");

  if (!base) throw new AppError("Invalid project name for relay email");

  const randomNumber = Math.floor(Math.random() * 1000); // 0-999
  return `${base}${randomNumber}`;
};
