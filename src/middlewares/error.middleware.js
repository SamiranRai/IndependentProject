const { env, isDev, isProd, isTesting } = require("../config/env");
const AppError = require("../middlewares/AppError");

// JSON-WEB TOKEN AND MONGOOSE AND OTHER ERRORS HANDLE

// 1) HANDLE JSON WEB TOKEN ERROR
const handleJsonWebTokenError = () =>
  new AppError("Invalid Token! please login again...", 401, "INVALID_JWT");

//2) HANDLE EXPIRED TOKEN ERROR.
const handleTokenExpiredError = () =>
  new AppError("Token has been expired! please login again...", 401, "EXPIRED_JWT");

// OTHER ERROR
const handleCastErrorDB = (err) => {
  const message = `Cant find this ${err.path}: ${err.value}. please check the I'd again and search!.`;
  return new AppError(message, 400, "INVALID_RESOURCE_ID");
};

// HANDLE DUPLICATE FIELDS ERROR
const handleDuplicateFieldsDB = (err) => {
  //Finding the what is the property name of duplicate
  let duplicateName = err.keyPattern;
  duplicateName = Object.keys(duplicateName)[0];
  //extracting the duplicate value form {error}
  const duplicateValue = err.keyValue.name;

  const message = `this "${duplicateName}: ${duplicateValue}" is already exist, please try different "${duplicateName}" ...`;

  return new AppError(message, 400, "DUPLICATE_FIELD");
};

// HANDLE DB VALIDATION ERROR
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data, ${errors.join(". ")}`;

  return new AppError(message, 400, "VALIDATION_ERROR");
};

// Send error in "Production"
const sendErrorInProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  } else {
    // Log full error internally
    console.error("UNEXPECTED ERROR: ", { err });

    res.status(500).json({
      success: false,
      code: "SERVER_ERROR", 
      message: "Something very went wrong...",
    });
  }
};

// Send error in "Development"
const sendErrorInDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    code: err.code,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

// Global Error Handler
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.code = err.code || "SERVER_ERROR";

  if (isDev) {
    sendErrorInDev(err, res);
  } else if (isProd) {
    let error = JSON.stringify(err);
    error = JSON.parse(error);

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJsonWebTokenError();
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError();

    sendErrorInProd(error, res);
  }
};
