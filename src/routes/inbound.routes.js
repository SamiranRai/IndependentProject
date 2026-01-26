const express = require('express');
const router = express.Router();

const inboundController = require('../controllers/inbound.controller');

router.post('/email', inboundController.inboundEmailWebhook);
router.post('/webhook', inboundController.inboundFramerWebhook);
// @ACTIVATE_ROUTE: activate route for the webflow webhook
// router.post('/webhook', inboundController.inboundWebflowWebhook);

module.exports = router;