const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const authController = require("../controllers/auth.controller");

router.use(authController.protect);

router.get('/', dashboardController.getDashboard);

module.exports = router;
