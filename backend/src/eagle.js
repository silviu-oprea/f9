#!/usr/bin/env node
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mustacheExpress = require('mustache-express');

const db = require('./db');

const app = express();

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(require('./middlewares/security'));
app.use(require('./controllers'));

const server = app.listen(3255, function () {
    console.log(`Listening on port 3255`);
});
