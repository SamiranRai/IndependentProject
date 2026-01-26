const express = require('express');
const router = express.Router();

const projectController = require('../controllers/project.controller');
const authController = require('../controllers/auth.controller');

router.post('/', authController.protect, projectController.createProject);
router.post('/:projectId/input', authController.protect, projectController.setupProjectInput);
router.patch('/:projectId/input/webflow', authController.protect, projectController.saveWebflowWebhook);

module.exports = router;