/**
 * @description Static HTTP Server
 * @see [Using Express.js Middleware]{@link http://expressjs.com/guide/using-middleware.html}
 * @see [Third-Party Middleware]}@link http://expressjs.com/resources/middleware.html}
 * @see [krakenjs/lusca]{@link https://github.com/krakenjs/lusca}
 * @see [helmetjs/helmet]{@link https://github.com/helmetjs/helmet}
**/
'use strict';

require('./data/store');

var fs         = require('fs-extra');
var config     = require('config');
var express    = require('express');
var bunyan     = require('bunyan');
var bugsnag    = require('bugsnag');
var session    = require('express-session');
var lusca      = require('lusca');
var helmet     = require('helmet');
var compress   = require('compression');
var hljs       = require('highlight.js');
var Remarkable = require('remarkable');
var message    = require('./routes/message');
var messages   = require('./routes/messages');

bugsnag.register(process.env.BUGSNAG_API_KEY);

var log = bunyan.createLogger({
    name: 'message',
    streams: [
        {
            stream: process.stdout
        },
        {
            type: 'file',
            path: 'http-server.log'
        }
    ]
});
var md = new Remarkable({
    highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (err) {log(err);}
        }
        try {
            return hljs.highlightAuto(str).value;
        } catch (err) {log(err);}
        return '';
    }
});
var PRECONDITION_FAILED = 412;

var app = express()
    .engine('html', require('ejs').renderFile)
    .engine('md', function(path, options, fn) {
        fs.readFile(path, 'utf8', function(err, str) {
            if (err) {return fn(err);}
            try {
                var html = md.render(str);
                fn(null, html);
            } catch (err) {
                fn(err);
            }
        });
    })
    .set('version', process.env.VERSION)
    .set('view engine', 'html')
    .set('views', __dirname + '/client')
    .set('jsonp callback', true)
    .use(session(config.get('session')))
    .use(function(req, res, next) {
        res.set('X-CSRF', req.sessionID);
        return next();
    })
    .disable('x-powered-by')                /** Do not advertise Express **/
    .use(lusca.csrf())                      /** Cross Site Request Forgery **/
    .use(lusca.csp({policy: config.csp}))   /** Content Security Policy **/
    .use(lusca.xframe('SAMEORIGIN'))        /** Helps prevent Clickjacking **/
    .use(lusca.hsts({maxAge: 31536000}))
    .use(lusca.xssProtection(true))
    .use(helmet.noSniff())
    .use(helmet.ieNoOpen())
    .use(helmet.referrerPolicy({policy: 'no-referrer'}))
    .use(compress())                        /** Use gzip compression **/
    .use(express.static(__dirname))         /** Serve static files **/
    .use(bugsnag.requestHandler)
    .use(bugsnag.errorHandler);

app.get('/loaderio-fcb6df7ac290a70c00036985de13836f', function(req, res) {
    if (res.get('X-CSRF') === req.sessionID) {
        res.send('loaderio-fcb6df7ac290a70c00036985de13836f');
    } else {
        res.status(PRECONDITION_FAILED).end();
    }
});
app.get('/', function(req, res) {
    if (res.get('X-CSRF') === req.sessionID) {
        res.redirect('/client');
    } else {
        res.status(PRECONDITION_FAILED).end();
    }
});
app.get('/api/docs', function(req, res) {
    if (res.get('X-CSRF') === req.sessionID) {
        res.redirect('/apidocs/index.html');
    } else {
        res.status(PRECONDITION_FAILED).end();
    }
});
var VERSION = app.get('version');
app.use(`/api/v${VERSION}/message`, message);
app.use(`/api/v${VERSION}/messages`, messages);
bugsnag.notify(new Error('Non-fatal'));
module.exports = app;
