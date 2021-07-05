const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const schedule = require('./server_schedule');

main().catch(err => console.error(err.message, err));

async function main() {
    global.config = require('./config');
    global.util = require('./public/util');
    global.Enum = require('./public/commonenum');
    global._ = require('underscore');

    const COOKIE_SECRET = config.npm_config_cookie_secret | config.COOKIE_SECRET;

    const app = express();
    app.use(cookieParser());
    app.use(session({
        secret: COOKIE_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
        maxAge: config.SESSION_MAX_TIME,
    }));

    let route = require('./route/route');
    app.use('/', route);
    app.use(express.static('client'));

    app.listen(3000, () => console.log('listening on http://127.0.0.1:3000'));

    schedule.listenstart();

    connectionGoogleDocs();
}