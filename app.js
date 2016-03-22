"use strict";


GLOBAL.logger = require('log4js');
logger.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/log.log'}
  ]
});

var ChatCore = require('./chatCore');

var ws = require("nodejs-websocket");
var config = require('./config.json');
config.port = process.env.OPENSHIFT_NODEJS_PORT || config.port;
config.webport  = process.env.OPENSHIFT_NODEJS_PORT || config.webport;
config.url = process.env.OPENSHIFT_NODEJS_IP || config.url;
var core = new ChatCore({messagesStorageLimit: config.messagesStorageLimit});
var server = ws.createServer(function (conn) {
  core.pushNewUser({connection: conn});
}).listen(config.port);

var app = require("express")();
var fs = require("fs");
var path = require("path");
app.use(require("express").static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function(req, res, next){
  console.log(req.connection.remoteAddress);
  var url = req.connection.remoteAddress == "::1" ? "localhost" : config.url;
  res.render('chat', {url: url, port: config.port});
});

app.listen(config.webport);
