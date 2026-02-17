const express = require("express");
const router = express.Router();

const projectController = require("../controllers/project.controller");
const spamController = require("../controllers/spam.controller");
const authController = require("../controllers/auth.controller");

router.use(authController.protect);

router.route("/").post(projectController.createProject);
router.route("/:projectId/input").post(projectController.selectInputProvider);
router
  .route("/:projectId/input/configure")
  .post(projectController.saveWebflowSecretKey);
router
  .route("/:projectId/destination")
  .post(projectController.addDestinationEmail);

router
  .route("/:projectId/spam/:messageId")
  .get(spamController.getSpamMessageDetail);

router
  .route("/:projectId/spam")
  .get(spamController.getSpamBox)
  .delete(spamController.clearSpamHistory);

router
  .route("/:projectId")
  .patch(projectController.updateProject)
  .delete(projectController.deleteProject);

module.exports = router;
