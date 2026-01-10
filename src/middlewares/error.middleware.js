const { env, isDev, isProd, isTesting } = require('../config/env');

// Send error in "Production"
const sendErrorInProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            mesage: err.message,
        });
    } else {
        // Log the error
        console.error("ERROR: ", {err});
        res.status(500).json({
            status: "error",
            message: "Something very went wrong...",
        });
    }
}

// Send error in "Development"
const sendErrorInDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        mesage: err.message,
        stack: err.stack,
        err: {
            err
        }
    });
}

// Global Error Handler
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Error";

    if (isDev) {
        sendErrorInDev(err, res);
    } else if (isProd) {
        sendErrorInProd(err, res);
    }
}