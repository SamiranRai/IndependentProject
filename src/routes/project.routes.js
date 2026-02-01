const express = require("express");
const router = express.Router();

const projectController = require("../controllers/project.controller");
const authController = require("../controllers/auth.controller");

router.use(authController.protect);

router.post("/", projectController.createProject);
router.post("/:projectId/input", projectController.selectInputProvider);
router.post(
  "/:projectId/input/configure",
  projectController.saveWebflowSecretKey
);

// ONBOARDING (write-once)
router.post("/:projectId/destination", projectController.addDestinationEmail);

module.exports = router;
