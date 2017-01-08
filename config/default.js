'use strict';
var uuid = require('node-uuid');

module.exports = {
    execMap: {
        py: 'python',
        rb: 'ruby'
    },
    session: {
        name: 'customSessionId',
        secret: 'Quidquid latine dictum, altum videtur',
        genid: function(req) {return uuid.v1();},
        resave: false,
        saveUninitialized: false,
        cookie: {httpOnly: true, secure: true}
    },
    websocket: {
        port: 13337
    },
    http: {
        port: process.env.PORT || 5984
    },
    https: {
        port: 8443
    },
    log: {
        level: 'error'
    },
    csp: {
        'default-src': '\'self\' \'unsafe-inline\'',
        'script-src':  '\'self\' \'unsafe-eval\' cdnjs.cloudflare.com www.navysearch.org',
        'font-src': '\'self\' fonts.gstatic.com data:',
        'connect-src': 'https://navysearch.org https://www.navysearch.org http://localhost:5984'
    }
};
