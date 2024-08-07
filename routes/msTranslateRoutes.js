const express = require('express');
const router = express.Router();
const getTranslate = require('../controllers/msTranslateController');

router.route('/').get(getTranslate);

module.exports = router