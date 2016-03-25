/**
 * Created by MaxSosnov on 19.03.2016.
 */
"use strict";

/** TODO: commands case list:
 *  help
 *  login
 *  logout
 *  rename
 */

class User{
    //values.connection - socket connection
    //values.name - nickname
    constructor(values){
        //this.name = values.name || this._getRandomName();
        this.connection = values.connection;
        this.name = values.name;
        this.logger = values.logger;
        this.usersStorage = values.usersStorage;
        this.connection.on("message", function (str) {
            let message = JSON.parse(str);
            switch(message.type){
                case "message":
                    this.logger.debug("got message");
                    this.onMessage(message.text);
                    break;
                case "private message":
                    this.logger.debug("got private message");
                    this.onPrivateMessage(message.recipient, message.text);
                    break;
                case "command":
                    this.logger.debug("got command");
                    switch (message.text.split(' ')[0]) {
                        case '/help':
                            let helpResponse = '';
                            helpResponse += '<p>Change name: "/rename newname" </p>';
                            helpResponse += '<p>Whisper: "/whisper(/w) username message" </p>';
                            helpResponse += '<p>Help: "/help (/h)" </p>';
                            this.sendMessage(JSON.stringify({type: "private message", from: 'System', text: helpResponse }));
                            break;
                        case '/rename':
                            this.oldname = this.name.toString();
                            this.name = message.text.substring("/rename".length + 1);
                            this.onNameChanged(this.name);
                            break;
                        case '/register' :
                            let re = /\/register\s([\d\w]+)\s([\w\d]+)\s([\w\d]+)/;
                            let matched = message.text.match(re);
                            if(matched) this.onRegistration({login: matched[1], password: matched[2], username: matched[3]});
                            else this.sendMessage(JSON.stringify({type: "private message", from: 'System', text: 'type /register login password username'}));
                            break
                        case '/login':{
                            let re = /\/login\s([\d\w]+)\s([\w\d]+)/;
                            let matched = message.text.match(re);
                            matched ? this.onLogin({login: matched[1], password: matched[2]}): this.sendMessage(JSON.stringify({type: "private message", from: 'System', text: 'type /login login password'}));
                            break;
                          }
                        case '/logout':
                            this.sendMessage(JSON.stringify({type: "private message", from: 'System', text: 'Cya ' + this.name }));
                            this.connection.close();
                            break;
                        default:
                            this.sendMessage(JSON.stringify({type: "private message", from: 'System', text: 'It\'s not easy to fool me, kid' }));
                            this.connection.close();
                    };
                    break;
                default:
                    this.sendMessage(JSON.stringify({type: "private message", from: 'System', text: 'It\'s not easy to fool me, kid' }));
                    this.connection.close();

            };
        }.bind(this));
        this.connection.on("close", function(code, reason){
            this.logger.info("user %s disconnected with code %d and reason $s", this.name, code, reason);
            this.onDisconnect("");
        }.bind(this));
        this.connection.on("error", function(err){
            this.logger.info("error occured");
            console.log(err);
            //this.onDisconnect("");
        }.bind(this));
    }
    onNameChanged(newName){

    }
    onMessage(message){

    }
    onPrivateMessage(recipient, message){

    }
    onDisconnect(message){

    }
    //values.login, values.username, values.password
    onRegistration(values){

    }
    sendMessage(str){
        try {
            this.connection.send(str);
        }
        catch(err){
            console.log(err);
        }
    }
}

module.exports = User;
