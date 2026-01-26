const catchAsync = require("../middlewares/catchAsync");
const inboundService = require("../services/inbound.service");

// INBOUND EMAIL CONTROLLER
exports.inboundEmailWebhook = catchAsync(async (req, res, next) => {
  // MAILGUN SEND THE PAYLOAD
  const payload = req.body;

  // CALL THE SERVICE
  await inboundService.processInboundEmailService(payload);
  // SEND 200 CLEAN RESPONSE
  res.status(200).send("OK");
});

// @RESTORE_LATER: restore it later, Webflow Wehook.
// exports.inboundWebflowWebhook = catchAsync(async (req, res, next) => {
//   // EXTRACT WEBFLOW SIGNATURE, TIMESTAMP , & RAW BODY
//   const timestamp = req.headers["x-webflow-signature"];
//   const signatur = req.headers["x-webflow-timestamp"];
//   const rawBody = req.rawBody;

//   // VERIFY SIGNATURE FUNC
  
//   // CALL INBOUND_WEBHOOK_SERVICE
//   await inboundService.processInboundWebhookService({
//     provider: "webflow",
//     payload,
//   });

//   // SEND BACK RESPONSW
//   res.status(200).send("OK");
// });

exports.inboundFramerWebhook = catchAsync(async (req, res, next) => {
  console.log({
    headers: req.headers,
    payload: req.body
  });

  // VERIFY SIGNATURE FUNC
  
  // CALL INBOUND_WEBHOOK_SERVICE
  // await inboundService.processInboundWebhookService({
  //   provider: "framer",
  //   payload,
  // });

  // SEND BACK RESPONSW
  res.status(200).send("OK");
});
