const mongoose = require('mongoose');
const conf = require('./config');

mongoose.Promise = global.Promise;
testDb = mongoose.createConnection(
    `mongodb://${conf.db.host}:${conf.db.port}/test`, { useNewUrlParser: true });

module.exports = {
    testDb: testDb
};
