const MessageModel = require("../models/message.model");
const RelayEmailModel = require("../models/relayEmail.model");

/**
 * Ingest inbound email from Mailgun
 * @param {Object} payload - raw Mailgun Or Webhook payload
 **/

exports.processInboundEmailService = async (payload) => {
  try {
    // 1) CHECK DATA IF EMPTY
    if (!payload) return;

    // 2) GET THE RECIPENT
    const recipient = payload.recipient;
    if (!recipient) return;

    // 3) FIND THE LOCAL PART FROM 'TO'
    const localPart = recipient.split("@")[0]; // euph321@myapp.com -> 'euph321' : localPart

    // 4) FIND RELAY EMAIL BASED ON LOACAL PART -- update the email from webflow and framer
    const relayEmail = await RelayEmailModel.findOne({ localPart });
    if (!relayEmail) {
      return; // add here log, for later
    }

    // 5) NORMALIZE THE CONTENT
    const text = payload["stripped-text"] || payload["body-plain"] || null;
    const html = payload["stripped-html"] || payload["body-html"] || null;
    const from = payload.sender || payload.from || "unknown";

    const receivedAt = payload.timestamp
      ? new Date(Number(payload.timestamp) * 1000)
      : new Date();

    // CREATE AND SAVE MESSAGE
    const message = await createMessage({
      sourceType: "email",
      provider: "mailgun",
      projectId: relayEmail.projectId,
      relayEmailId: relayEmail._id,
      from: from.toLowerCase(),
      to: recipient.toLowerCase(),
      subject: payload.subject || "",
      text: text,
      html: html,
      rawEmail: payload["body-mime"] || null,
      contentStored: true,
      classification: "unknown",
      providerMessageId: payload["Message-Id"],
      receivedAt: receivedAt,
    });

    return message;
  } catch (err) {
    console.error("processInboundEmailService error:", err);
    return;
  }
};

// exports.processInboundWebhookService = async (payload) => {
//   if (!payload) return;
// };

// CREATE AND SAVE INGESTED MESSAGE TO DB
async function createMessage(normalizedData) {
  return await MessageModel.create({
    sourceType: normalizedData.sourceType,
    provider: normalizedData.provider,
    projectId: normalizedData.projectId,
    relayEmailId: normalizedData.relayEmailId,
    from: normalizedData.from,
    to: normalizedData.to,
    subject: normalizedData.subject,
    text: normalizedData.text,
    html: normalizedData.html,
    rawEmail: normalizedData.rawEmail,
    contentStored: true,
    classification: "unknown",
    providerMessageId: normalizedData.providerMessageId,
    receivedAt: normalizedData.receivedAt,
  });
}
