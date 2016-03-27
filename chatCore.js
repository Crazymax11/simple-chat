/**
 * Created by MaxSosnov on 20.03.2016.
 */
"use strict";

var User = require('./user');
var MessagesStorage = require('./messagesStorage')
var UsersStorage = require('./usersStorage');
class ChatCore{
    constructor(values){
        this.logger = values.logger.getLogger("chat");
        this.users = [];
        this.messages = new MessagesStorage({limit: values.messagesStorageLimit});
        this.usersStorage = new UsersStorage({dir: values.usersStorageDir, defaultAvatarUrl: "", logger: values.logger})
        this.logger.info("chat core started");
    }
    // values.connection - websocket connection
    pushNewUser(values){
        //let user = new User({connection: values.connection});
        this.logger.info("new connection");
        new Promise(function(resolve, reject){
            let connection = values.connection;
            connection.send(JSON.stringify({type:"init request"}));
            connection.once("message", str => {
                let obj = JSON.parse(str);
                if (obj.type != "init") reject(connection);
                for(var user of this.users){
                    if (user.name == obj.name){
                        obj.name = this._getRandomName();
                        break;
                    }
                }
                if (!obj.name) obj.name = this._getRandomName();
                resolve(new User({name: obj.name, connection: connection, logger: logger.getLogger("chat user " + obj.name ), usersStorage: this.usersStorage}));
            })
        }.bind(this))
        .then(user => {
            //нужно сообщить ему о юзерах и подключить обработчики
            this.users.push(user);
            let usernames = [];
            for(let us of this.users){
                usernames.push(us.name);
            }
            user.sendMessage(JSON.stringify({type: "init", name: user.name, users: usernames, messages: this.messages.getLasts()}));
            user.onMessage = (message) => {
                this.broadcastMessage({type: "message", text: message, from: user.name});
            }
            user.onPrivateMessage = (recipient, message) => {
                for(let to of this.users){
                    if(to.name == recipient){
                        to.sendMessage(JSON.stringify({type: "private message", text: message, from: user.name}));
                        return true;
                    }
                }
                user.sendMessage(JSON.stringify({type: "private message", from: 'System', text: 'Username does not exist' }));
            }
            user.onNameChanged = (newName) => this.broadcastMessage({type: "rename", from: user.oldname, to: user.name});
            user.onDisconnect = (message) => {
                this.users.splice(this.users.indexOf(user), 1);
                this.broadcastMessage({type: "disconnect", user: user.name, message: message});
            };
            user.onRegistration = (values) => {
              this.usersStorage.createUser(values, (err, obj)=>{
                if (err) user.sendMessage(JSON.stringify({type: "private message", from: 'System', text: 'error occurred while registration ' + err.toString()}));
                else user.sendMessage(JSON.stringify({type: "private message", from: 'System', text: 'registration successfull, try to login now!'}));
              })
            }
            user.onLogin = (values) => {
              return new Promise( (resolve, reject) => {
                this.usersStorage._doesLoginExists({login: values.login}, (ex) => ex? resolve(values) : reject(new Error("wrong login/pass pair")));
              })
              .then( (values) => {
                return new Promise( (resolve, reject) => {
                  this.usersStorage.readUser(values, (err, obj) => {
                    err ? reject(err) : (obj.password == values.password ? resolve(values) :reject(new Error("wrong login/pass pair")));
                  })
                })
              })
              .then( (values) => {
                user.sendMessage(JSON.stringify({type: "private message", from: "System", text: "glad to see you again, " + obj.username}));
                user.oldname = user.name;
                user.name = obj.username;
                user.onNameChanged(obj.username);
              })
              .catch( (err) => {
                user.sendMessage(JSON.stringify({type: "private message", from: "System", text: err.toString()}));
              });
            }
            for(let us of this.users){
                if (us!=user) us.sendMessage(JSON.stringify({type: "new user", username: user.name}));
            }
            let welcomeResponse = '<p>Welcome to our chat, ' + user.name + '. Enjoy our community.</p> <p>Type /h for help</p>';
            user.sendMessage(JSON.stringify({type: "private message", from: 'System', text: welcomeResponse }));
            this.logger.info(user.name + " connected to chat");
        })
        .catch( conn=> {
            conn.send(JSON.stringify({type: "err", text: "somethign went wrong"}));
            conn.close();
            this.logger.info("connect rejected");
        });
    }
    _getRandomName(){
        let first = [
            "Грязный",
            "Дивный",
            "Черный",
            "Изобразительный",
            "Мокрый",
            "Огненный"
        ];
        let second = [
            "Лебедь",
            "Тролль",
            "Печеник",
            "Гуль"
        ];
        let randElement = arr => arr[Math.floor(Math.random()*arr.length)];
        return randElement(first) + " " + randElement(second);
    }

    //message will be jsoned and sent to ALL users available
    broadcastMessage(message){
        if(message.type == 'message'){
            this.messages.pushMessage(message.from, message.text);
        }
        for(let user of this.users){
            user.sendMessage(JSON.stringify(message));
        }
    }
}

module.exports = ChatCore;
