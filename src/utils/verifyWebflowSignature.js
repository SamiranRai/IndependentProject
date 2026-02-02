const crypto = require("crypto");

function verifyWebflowSignature(req, webflowSecretKey) {
  const signature = req.headers["x-webflow-signature"];
  const timestamp = req.headers["x-webflow-timestamp"];
  if (!signature || !timestamp) {
    return false;
  }

  const bodyString = req.rawBody.toString("utf8");
  const payload = Buffer.from(Number(timestamp) + ":" + bodyString, "utf8");

  const expected = crypto
    .createHmac("sha256", webflowSecretKey)
    .update(payload)
    .digest("hex");

  try {
    crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
    return true;
  } catch (err) {
    console.error("Invalid Webflow Signature", err);
    return false;
  }
}

module.exports = verifyWebflowSignature;
