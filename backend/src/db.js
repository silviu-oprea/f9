const mongoose = require('mongoose');
const conf = require('./config');

mongoose.Promise = global.Promise;
eagleDb = mongoose.createConnection(
    `mongodb://${conf.db.host}:${conf.db.port}/eagle`, { useNewUrlParser: true });

module.exports = {
    eagleDb: eagleDb
};
