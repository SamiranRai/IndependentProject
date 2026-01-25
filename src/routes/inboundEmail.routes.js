const express = require('express');
const router = express.Router();

const inboundEmailController = require('../controllers/inboundEmail.controller');

router.post('/email', inboundEmailController.inboundEmailWebhook);

module.exports = router;