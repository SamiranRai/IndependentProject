const catchAsync = require("../middlewares/catchAsync");
const inboundEmailService = require("../services/inboundEmail.service");

exports.inboundEmailWebhook = catchAsync(async (req, res, next) => {
  // MAILGUN SEND THE PAYLOAD
  const payload = req.body;

  // CALL THE SERVICE
  await inboundEmailService.processInboundEmailService(payload);

  // TERMINAL OUTPUT
  // console.log("INBOUND MAILGUN PAYLOAD:");
  // console.log(JSON.stringify(req.body, null, 2));

  // SEND 200 CLEAN RESPONSE
  res.status(200).send("OK");
});
