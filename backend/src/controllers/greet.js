const express = require('express');
const router = express.Router();

router.get('/:message', function (req, res, next) {
    res.render('start.html', {message: req.params.message})
});

module.exports = router;