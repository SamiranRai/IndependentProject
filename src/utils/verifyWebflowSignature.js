const crypto = require("crypto");
const AppError = require("./../middlewares/AppError");

module.exports = function verifyWebflowSignature(req, webflowSecretKey) {
  const signature =
    req.headers["x-webflow-signature"] || req.headers["x-webflow-Signature"];
  const timestamp =
    req.headers["x-webflow-timestamp"] || req.headers["x-webflow-Timestamp"];

  if (!signature || !timestamp) {
    throw new AppError("Missing Webflow signature headers", 401);
  }

  const bodyString = req.rawBody.toString("utf8");
  const payload = Buffer.from(Number(timestamp) + ":" + bodyString, "utf8");

  const expected = crypto
    .createHmac("sha256", webflowSecretKey)
    .update(payload)
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );

  // @ADD_TIME_PROTECTION: add timestamp to protect agains replay attack!
  if (!isValid) {
    throw new AppError("Invalid Webflow signature", 401);
  }

  console.log("Webflow Signature Verification Successfull..");
};
