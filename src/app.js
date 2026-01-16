const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const app = express();

// ALL IMPORTS
const registerGlobalRouteHandler = require("./global.routes");
const registerGlobalErrorHandler = require("./middlewares/error.middleware");
const AppError = require("./middlewares/AppError");
const { env, isDev } = require("./config/env");

// MIDDLEWARES
app.use(helmet());

// ENVOIRMENT LOGGING
if (isDev) {
  app.use(morgan("dev"));
}

// API LIMIT FOR IPs
const limitter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    "Too many request from same Ip, please wait for an hour and try again!",
});
app.use("/api", limitter);

app.use(express.json({ limit: "10kb" }));

// DATA SANITIZATION AGAINS NOSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINS XSS INJECTION

// GLOBAL ROUTE-HANDLER REGISTER
registerGlobalRouteHandler(app);

// UNHANDLE ROUTES
app.use((req, res, next) => {
  next(
    new AppError(
      `Can't find this ${req.originalUrl} route on this server...`,
      404
    )
  );
});

// GLOBAL ERROR HANDLER (Keep Always in Bottom)
app.use(registerGlobalErrorHandler);

console.log(`App is running in ${env.NODE_ENV} Mode.`);
module.exports = app;
