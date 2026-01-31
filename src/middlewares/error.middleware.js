const { isDev, isProd, isTesting } = require("../config/env");
const AppError = require("../middlewares/AppError");

// --- HANDLE VARIOUS JWT ERROR ---
const handleJwtError = () =>
  new AppError("Invalid Token! please login again...", 401, "INVALID_JWT");

const handleJwtExpiredError = () =>
  new AppError(
    "Token has been expired! please login again...",
    401,
    "EXPIRED_JWT"
  );

const handleCastError = (err) => {
  const message = `Cant find this ${err.path}: ${err.value}. please check the I'd again and search!.`;
  return new AppError(message, 400, "INVALID_RESOURCE_ID");
};

const handleDuplicateKeyError = (err) => {
  let duplicateName = err.keyPattern;
  duplicateName = Object.keys(duplicateName)[0];
  const duplicateValue = err.keyValue.name;

  const message = `this "${duplicateName}: ${duplicateValue}" is already exist, please try different "${duplicateName}" ...`;

  return new AppError(message, 400, "DUPLICATE_FIELD");
};

const handle_ValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data, ${errors.join(". ")}`;

  return new AppError(message, 400, "VALIDATION_ERROR");
};

// --- SEND ERROR IN PROD | DEV ---
const sendErrorInProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  } else {
    console.error("UNEXPECTED ERROR: ", { err });
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Something very went wrong...",
    });
  }
};

const sendErrorInDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    code: err.code,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// --- GLOBAL ERROR HANDLER ---
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.code = err.code || "SERVER_ERROR";

  let error = err;

  if (isDev) {
    sendErrorInDev(error, res);
  } else if (isProd) {
    if (error.name === "CastError") error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateKeyError(error);
    if (error.name === "ValidationError")
      error = handle_ValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJwtError();
    if (error.name === "TokenExpiredError") error = handleJwtExpiredError();

    sendErrorInProd(error, res);
  } else if (isTesting) {
    console.log("Testing Envoirment");
  }
};
