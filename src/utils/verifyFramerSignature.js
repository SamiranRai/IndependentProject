const crypto = require("crypto");

function verifyFramerSignature(req, framerSecretKey) {
  
  let signature = req.headers["framer-signature"];
  const submissionId = req.headers["framer-webhook-submission-id"];

  if (
    signature.length !== 71 ||
    !signature.startsWith("sha256=") ||
    !submissionId
  )
    return false;

  signature = signature.replace(/^sha256=/, "");

  const expectedSignature = crypto
    .createHmac("sha256", framerSecretKey)
    .update(req.rawBody)
    .update(submissionId)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (err) {
    console.error("Invalid framer Signature", err);
    return false;
  }
}

module.exports = verifyFramerSignature;
