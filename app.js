"use strict";
var User = require('./user');
var ws = require("nodejs-websocket");

var users = [];
var id = 1;
var server = ws.createServer(function (conn) {
  console.log("lol");
  //console.log(JSON.stringify(conn));
  //console.log(conn);
  let user = new User({connection: conn, id: id, usersArr: users});
  user.onInited = function(username) {
    userConnected(username);
    for(var cruser of users){
      if (cruser != user) user.sendMessage(JSON.stringify({type: "new user", username: cruser.name}));
    }
  };
  users.push(user);
  user.onMessage = (message) => broadcastMessage({text: message, username : user.name});
  user.onNameChanged = (newName) => renameUser({newname: newName, oldname: user.oldname});
  user.onDisconnect = (message) => userDisconnected({message: message, username: user.name});

}).listen(1992);

// text - string
// username - string
function broadcastMessage(message){
  console.log("broadcast");
  for(var user of users){
    user.sendMessage(JSON.stringify({type: "message", from: message.username, text: message.text}));
  }
}

// newname - string
// oldname - string
function renameUser(message){
  for(var user of users){
    user.sendMessage(JSON.stringify({type: "rename", from: message.oldname, to: message.newname}));
  }
}

// message - string
// username - string
function userDisconnected(message){
  for(var user of users){
    if (user.name!= message.username){
      user.sendMessage(JSON.stringify({type: "disconnect", user: message.username, message: message.message}));
    }
  }
  users.splice(users.indexOf(user),1);
}

function userConnected(username){
  for(var user of users){
    user.sendMessage(JSON.stringify({type: "new user", username: username}));
  }
}

var app = require("express")();
var fs = require("fs");
var path    = require("path");
app.use(require("express").static(path.join(__dirname, 'public')));
var config = require('./config.json');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function(req, res, next){
  console.log(req.connection.remoteAddress);
  var url = req.connection.remoteAddress == "::1" ? "localhost" : config.url;
  res.render('chat', {url: url, port: config.port});
});

app.listen(1991);