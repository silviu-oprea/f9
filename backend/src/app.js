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

app.use(session({
    secret: 'work hard - play hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db.testDb
    })
}));
app.use(require('./middlewares/say_hello'));
app.use(require('./controllers'));

const server = app.listen(8000, function () {
    console.log(`Listening on port 8000`);
});
