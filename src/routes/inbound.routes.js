const express = require('express');
const router = express.Router();

const inboundController = require('../controllers/inbound.controller');

//webhookUrl: /api/v1/inbound/webhook/${identifier},
router.post('/webhook/:identifier', inboundController.inboundWebhook);
router.post('/email', inboundController.inboundEmail);

module.exports = router;