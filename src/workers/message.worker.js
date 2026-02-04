const MessageModel = require("../models/message.model");
const {
  classifyWithMlService,
} = require("../services/mlClassification.service");

const BATCH_SIZE = 5;

async function processPendingMessage() {
  for (let i = 0; i < BATCH_SIZE; i++) {
    const message = await MessageModel.findOneAndUpdate(
      {
        mlProcessed: false,
        handling: "blocked",
        processing: false,
      },
      {
        processing: true,
        processingAt: new Date(),
      },
      {
        new: true,
      }
    );
    if (!message) return;

    try {
      const result = await classifyWithMlService({
        provider: message.provider,
        payload: message.payload,
      });

      message.classification = result.classification;
      message.confidenceScore = result.confidenceScore;
      message.reason = result.reason;
      message.decisionSource = "ml";
      message.mlProcessed = true;

      if (message.classification === "legit" && message.confidenceScore > 75) {
        message.handling = "forwarded";
        message.deliveryStatus = "pending";
      } else {
        message.handling = "blocked";
      }

      await message.save();
    } catch (err) {
      console.error("Worker failed for message", message._id, err);
    } finally {
      message.processing = false;
      await message.save();
    }
  }
}

module.exports = { processPendingMessage };
