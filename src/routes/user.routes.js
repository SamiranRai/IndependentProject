const express = require("express");
const router = express.Router();

// ALL IMPORTS
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
// ALL AUTH ROUTES ONLY
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").post(authController.resetPassword);
router.route("/email/verify-email").post(authController.emailVerify);
router.route("/email/resend-verification").post(authController.resendEmailVerification);
// ROUTING
// router.route("/").get(authController.protect, authController.requiredVerifiedEmail, userController.getAllUsers);

router.route('/updateMyPassword').post(authController.protect, authController.updatePassword);
router.route('/updateMe').patch(authController.protect, userController.updateMe);

// router.route('/:id').method();
router.route('/').get(userController.getAllUsers);

// EXPORTS
module.exports = router;
