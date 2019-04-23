module.exports = function (req, res, next) {
    console.log('Inside say_hello middleware');
    next();
};