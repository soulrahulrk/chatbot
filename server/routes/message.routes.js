const express = require('express');
const { getMessages, createMessage } = require('../controllers/message.controller');

const router = express.Router();

router.route('/').get(getMessages).post(createMessage);

module.exports = router;
