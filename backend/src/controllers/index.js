const express = require('express');
const router = express.Router();

router.use('/greet', require('./greet'));

module.exports = router;