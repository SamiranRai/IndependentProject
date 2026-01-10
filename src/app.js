const express = require("express");
const morgan = require('morgan');
const app = express();

// ALL IMPORTS
const registerGlobalRouteHandler = require("./global.routes");
const registerGlobalErrorHandler = require("./middlewares/error.middleware");
const AppError = require("./middlewares/AppError");
const { env, isDev } = require('./config/env');

// MORGAN=DEVLOPMENT
if (isDev) {
    app.use(morgan('dev'));
}

// MIDDLEWARES
app.use(express.json({ 'limit': '10kb' }));

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
// EXPORT APP
module.exports = app;
