const express = require('express');
const router = express.Router();

// ALL IMPORTS
const userController = require('../controllers/user.controller');

// ROUTING
router.route('/').get(userController.getAllUsers);

// router.route('/:id').method();


// EXPORTS
module.exports = router;