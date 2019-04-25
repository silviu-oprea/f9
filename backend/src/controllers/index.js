const express = require('express');
const router = express.Router();

router.use('/greet', require('./greet'));
router.use('/form_receiver', require('./form_receiver'));
router.use('/forms', require('./forms'));

module.exports = router;