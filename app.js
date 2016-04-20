"use strict";

let logger = require('log4js');
GLOBAL.logger = logger;
logger.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/log.log'}
  ]
});

var ChatCore = require('./source/chatCore');
var config = require('./config.json');
//заделка под openshift
config.port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || config.port;
config.webport  = process.env.OPENSHIFT_NODEJS_PORT || config.webport;
config.url = process.env.OPENSHIFT_NODEJS_IP || config.url;
var core = new ChatCore({messagesStorageLimit: config.messagesStorageLimit, logger: logger, usersStorageDir: config.usersStorageDir});
var app = require("express")();
var fs = require("fs");
var path = require("path");
app.use(require("express").static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function(req, res, next){
  console.log(req.connection.remoteAddress);
  // для запуска на локалхосте, подставить в res.render
  var url = req.connection.remoteAddress == "::1" ? "localhost" : config.url;
  res.render('chat', {url: config.url, port: config.clientWebSocketPort});
});

var server = require('http').createServer();
server.on('request', app);

var ws = require('ws').Server;
//вещаем websocket сервер на http сервер
var wsserver = new ws({server: server, autoAcceptConnections: false});
wsserver.on('connection', function(conn) {
  core.pushNewUser({connection:conn});
});
server.listen(config.port, config.url);
