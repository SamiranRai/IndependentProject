const { env } = require("../config/env");
const crypto = require("crypto");
const AppError = require("../middlewares/AppError");
const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { signToken } = require("../utils/token");
const sendEmail = require("../utils/email");

// SIGNUP SERVICE
exports.signupService = async (body) => {
  // CREATE USER
  const newUser = await UserModel.create({
    name: body.name,
    email: body.email,
    password: body.password,
    passwordConfirm: body.passwordConfirm,
    role: body.role,
  });

  // GENERATE AND SEND EMAIL VERIFICATION CODE
  await sendEmailVerificationCode(newUser);

  // RETURN NEW-USER
  return { newUser };
};

// LOGIN SERVICE
exports.loginService = async (body) => {
  // GET THE INPUT
  const { email, password } = body;

  // CHECK THE INPUT
  if (!email || !password)
    throw new AppError(
      "Please provide email and password",
      400,
      "MISSING_CREDENTIALS"
    );

  // FIND USER WITH EMAIL AND CHECK PASSWORD
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user || !(await user.checkPassword(password, user.password))) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  // EMAIL NOT VERIFIED -> NO TOKEN
  if (!user.isEmailVerified) {
    // CHECK IF EMAIL VERIFICATION CODE EXPIRED
    const isEmailVerificationCodeExpired =
      !user.emailVerificationExpires ||
      user.emailVerificationExpires.getTime() < Date.now();

    if (isEmailVerificationCodeExpired) {
      await sendEmailVerificationCode(user);
      return {
        authState: "EMAIL_RESENT",
      };
    }

    // SEND
    return {
      authState: "EMAIL_PENDING",
    };
  }

  // IF EMAIL VERIFIED
  const token = signToken(user.id);
  return { user, token, authState: "AUTHENTICATED" };
};

// FORGOT-PASSWORD SERVICE
exports.forgotPasswordService = async (body, req) => {
  const { email } = body;
  // Check user exist or not
  const user = await UserModel.findOne({ email });
  if (!user) {
    await new Promise((r) => setTimeout(r, 500));
    return true;
  }

  // CALL SEND-PASSWORD-RESET-LINK
  await sendPasswordResetLink(user, req);

  return true;
};

const sendPasswordResetLink = async (user, req) => {
  // CoolDown
  const now = Date.now();

  // CHEKC IF RESET LINK SENT AGAIN WITHIN 60SEC
  if (
    user.resetPasswordLinkLastSentAt &&
    now - user.resetPasswordLinkLastSentAt.getTime() < 60 * 1000
  ) {
    return; // silent
  }

  // SET PASSWORD RESET WINDOW AND COUNTER TO '0' AFTER EVERY 1 HOUR
  if (
    !user.passwordResetWindowStart ||
    now - user.passwordResetWindowStart > 60 * 60 * 1000
  ) {
    // RESET THE COUNTER
    user.passwordResetWindowStart = new Date(now);
    user.resetPasswordLinkLastSentCount = 0;
  }

  // CHECK IF RESET LINK SENT OVER 3 TIMES IN A HOUR
  if (user.resetPasswordLinkLastSentCount >= 3) {
    return; // silent
  }

  // GENERATE PASSWORD RESET TOKEN
  const genearatePasswordResetToken = user.createPasswordResetToken();
  user.resetPasswordLinkLastSentAt = new Date(now);
  user.resetPasswordLinkLastSentCount =
    (user.resetPasswordLinkLastSentCount || 0) + 1;
  await user.save({ validateBeforeSave: false });

  // RESET URL SEND VIA EMAIL
  const resetUrl = `${req.protocol}//:${req.get(
    "host"
  )}/api/v1/users/resetPassword/${genearatePasswordResetToken}`;
  const message = `Forgot your password! update your new password with this Url:${resetUrl}.\n if you don't forgot your password ignore this message!`;

  try {
    await sendEmail({
      email: user.email, // cuurent user,
      subject: "Password reset (valid 10 minutes)",
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
  }
};

// RESET-PASSWORD SERVICE
exports.resetPasswordService = async (body, paramToken) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(paramToken)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(
      "Token is invalid or Token has been expired!",
      400,
      "INVALID_RESET_TOKEN"
    );
  }

  user.password = body.password;
  user.passwordConfirm = body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user.id);
  return { token };
};

// UPDATE-PASSWORD SERVICE
exports.updatePasswordService = async (body, currentUser) => {
  const user = await UserModel.findById(currentUser.id).select("+password");
  if (!(await user.checkPassword(body.password, user.password))) {
    throw new AppError(
      "Current Password is wrong! Please provide the correct password.",
      400,
      "INCORRECT_CURRENT_PASSWORD"
    );
  }

  user.password = body.password;
  user.passwordConfirm = body.passwordConfirm;
  await user.save();

  const token = signToken(user.id);
  return { user, token };
};

// EMAIL-VERIFICATION SERVICE
exports.emailVerifyService = async (body) => {
  // GET THE INPUT
  const { email, code } = body;

  // CHECK THE INPUT
  if (!email || !code) {
    throw new AppError(
      "Please provide email and 4 digit verification code!",
      400,
      "MISSING_VERIFICATION_DATA"
    );
  }

  // HASHED THE PLAIN EMAIL CODE
  const hashedCode = crypto
    .createHash("sha256")
    .update(String(code))
    .digest("hex");

  // FIND THE USER BASED ON EMAIL, THEN CHECK HASED CODE, AND EMAIL CODE EXPIRE OR NOT
  const user = await UserModel.findOne({
    email: email,
    emailVerificationCode: hashedCode,
    emailVerificationExpires: { $gt: new Date() },
  });
  if (!user) {
    throw new AppError(
      "Invalid or Expired Code!",
      400,
      "INVALID_VERIFICATION_CODE"
    );
  }

  // IF EVERYTHING OK
  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  // SEND
  const token = signToken(user.id);
  return { user, token };
};

// RESEND-EMAIL-VERIFICATION SERVICE
exports.resendEmailVerificationService = async (body) => {
  // INPUT
  const { email } = body;

  // CHECK USER EXIST OR NOT
  const user = await UserModel.findOne({ email });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  // CHECK IF USER ALREADY VERIFED
  if (user.isEmailVerified)
    throw new AppError("Email already verified", 400, "EMAIL_ALREADY_VERIFIED");

  // RESEND EMAIL
  await sendEmailVerificationCode(user);

  return true;
};

// SEND-EMAIL-VERIFICATION-CODE FUNC
const sendEmailVerificationCode = async (user) => {
  const now = Date.now();

  // CHECK IF EMAIL SENT BEFORE 60 SEC
  if (
    user.emailVerificationLastSentAt &&
    now - user.emailVerificationLastSentAt.getTime() < 60 * 1000
  ) {
    throw new AppError(
      "Please wait before resending the verification email",
      429,
      "EMAIL_RESEND_COOLDOWN"
    );
  }

  // RESET THE COUNTER AND WINDOW
  if (
    !user.emailVerificationWindowStart ||
    now - user.emailVerificationWindowStart.getTime() > 60 * 60 * 1000
  ) {
    user.emailVerificationWindowStart = new Date(now);
    user.emailVerificationSentCount = 0;
  }

  // HOURLY LIMIT
  if (user.emailVerificationSentCount >= 5) {
    throw new AppError(
      "Too many verification attempts. Please try again later.",
      429,
      "EMAIL_VERIFICATION_RATE_LIMIT"
    );
  }

  // GENERATE THE NEW CODE
  const generateEmailVerificationCode = user.createEmailVerificationCode();
  let message = `Your Code - ${generateEmailVerificationCode}`;

  user.emailVerificationLastSentAt = new Date(now);
  user.emailVerificationSentCount = (user.emailVerificationSentCount || 0) + 1;

  // SAVE THE USER WITH UPDATED DATA
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification Code (valid for 10 minutes)",
      message,
    });
  } catch (err) {
    // Rollback if email fails
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(
      "Could not send verification email. Please try again later.",
      500,
      "EMAIL_DELIVERY_FAILED"
    );
  }
};
