const jwt = require("jsonwebtoken");
const AppError = require("../middlewares/AppError");
const catchAsync = require("../middlewares/catchAsync");
const authService = require("../services/auth.service");
const { promisify } = require("util");
const { env } = require("../config/env");
const UserModel = require("../models/user.model");

exports.signup = catchAsync(async (req, res, next) => {
  // CALL SIGNUP SERVICE
  const { newUser } = await authService.signupService(req.body);
  // SEND RESPONSE BACK
  res.status(201).json({
    success: true,
    code: "SIGNUP_EMAIL_VERIFICATION_SENT",
    message: "Email verification code sent",
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // GET ALL THE RETURN VALUES FROM SERVICE
  const loginResult = await authService.loginService(req.body);

  switch (loginResult.authState) {
    case "EMAIL_PENDING":
      return res.status(403).json({
        success: false,
        code: "EMAIL_VERIFICATION_REQUIRED",
        message: "User email not verified",
        meta: {
          resendAllowed: false,
        },
      });

    case "EMAIL_RESENT":
      return res.status(403).json({
        success: false,
        code: "EMAIL_VERIFICATION_RESENT",
        message: "Verification email resent",
        meta: {
          resendAllowed: false,
          cooldown: 60,
        },
      });

    case "AUTHENTICATED":
      return res.status(200).json({
        success: true,
        code: "LOGIN_SUCCESS",
        message: "User Authanticated",
        data: {
          token: loginResult.token,
          user: loginResult.user,
        },
      });

    default:
      throw new AppError("Invalid Auth State", 500, "INVALID_AUTHSTATE");
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  const authorization = req.headers.authorization;
  let token;
  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError(
      "Please log in to get access",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  const decoded = await promisify(jwt.verify)(token, env.SECRET_KEY);
  const currentUser = await UserModel.findById({ _id: decoded.id });
  if (!currentUser) {
    throw new AppError(
      "The user belonging to the token does not exist!",
      401,
      "USER_NOT_FOUND"
    );
  }

  // PASSWORD CHANGED AFTER TOKEN ISSUED
  if (currentUser.isPasswordChangedAfterTokenIssued(decoded.iat)) {
    throw new AppError(
      "User recently changed password! Please login again!",
      401,
      "TOKEN_INVALIDATED"
    );
  }

  req.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  await authService.forgotPasswordService(req.body, req);

  //Send Response
  res.status(200).json({
    success: true,
    message:
      "If an account exists, a password reset email has been sent.",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = await authService.resetPasswordService(
    req.body,
    req.params.token
  );

  res.status(201).json({
    success: true,
    code: "PASSWORD_RESET_SUCCESS",
    message: "Password reset successful",
    data: {
      token,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.updatePasswordService(
    req.body,
    req.user
  );
  res.status(201).json({
    success: true,
    code: "PASSWORD_UPDATE_SUCCESS",
    message: "Password updated successfully",
    data: {
      user,
      token,
    },
  });
});

exports.emailVerify = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.emailVerifyService(req.body);
  res.status(200).json({
    success: true,
    code: "EMAIL_VERIFIED",
    message: "Email successfully verified..",
    data: {
      user,
      token,
    },
  });
});

exports.requiredVerifiedEmail = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    throw new AppError(
      "You need to verify your email first to get access",
      403,
      "EMAIL_VERIFICATION_REQUIRED"
    );
  }

  next();
};

exports.resendEmailVerification = catchAsync(async (req, res, next) => {
  // CALL RESEND-EMAIL-VERIFICATION SERVICE
  await authService.resendEmailVerificationService(req.body);
  // SEND RESPONSE BACK
  res.status(200).json({
    success: true,
    code: "EMAIL_VERIFICATION_RESENT",
    message: "Verification email resent if required",
    meta: {
      cooldown: 60,
    },
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action.",
          403,
          "INSUFFICIENT_ROLE_PERMISSION"
        )
      );
    }

    next();
  };
};
