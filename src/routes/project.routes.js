const express = require('express');
const router = express.Router();

const projectController = require('../controllers/project.controller');
const authController = require('../controllers/auth.controller');

router.post('/', authController.protect, projectController.createProject);
router.post('/:projectId/finish-onboarding', authController.protect, projectController.finishOnboarding);

module.exports = router;