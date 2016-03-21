/**
 * Created by MaxSosnov on 20.03.2016.
 */
"use strict";

var User = require('./user');
class ChatCore{
    constructor(values){
        this.logger = logger.getLogger("chat");
        this.users = [];
        this.logger.info("chat core started");
    }
    // values.connection - websocket connection
    pushNewUser(values){
        //let user = new User({connection: values.connection});
        this.logger.info("new connection");
        new Promise(function(resolve, reject){
            let connection = values.connection;
            connection.send(JSON.stringify({type:"init request"}));
            connection.once("text", str => {
                let obj = JSON.parse(str);
                if (obj.type != "init") reject(connection);
                for(var user of this.users){
                    if (user.name == obj.name){
                        obj.name = this._getRandomName();
                        break;
                    }
                }
                resolve(new User({name: obj.name, connection: connection}));
            })
        }.bind(this))
        .then(user => {
            //нужно сообщить ему о юзерах и подключить обработчики
            this.users.push(user);
            let usernames = [];
            for(let us of this.users){
                usernames.push(us.name);
            }
            user.sendMessage(JSON.stringify({type: "init", name: user.name, users: usernames}));
            user.onMessage = (message) => this.broadcastMessage({type: "message", text: message, from: user.name});
            user.onNameChanged = (newName) => this.broadcastMessage({type: "rename", from: user.oldname, to: user.name});
            user.onDisconnect = (message) => {
                this.users.splice(this.users.indexOf(user), 1);
                this.broadcastMessage({type: "disconnect", user: user.name, message: message});
            };
            logger.info(user.name + " connected to chat");
        })
        .catch( conn=> {
            conn.send(JSON.stringify({type: "err", text: "somethign went wrong"}));
            conn.close();
            logger.info("connect rejected");
        });
    }
    _getRandomName(){
        let first = [
            "грязный",
            "дивный",
            "черный",
            "изобразительный",
            "мокрый",
            "огненный"
        ];
        let second = [
            "лебедь",
            "тролль",
            "печеник",
            "гуль"
        ];
        let randElement = arr => arr[Math.floor(Math.random()*arr.length)];
        return randElement(first) + " " + randElement(second);
    }
    //message will be jsoned and sent to ALL users available
    broadcastMessage(message){
        for(let user of this.users){
            user.sendMessage(JSON.stringify(message));
        }
    }
}

module.exports = ChatCore;