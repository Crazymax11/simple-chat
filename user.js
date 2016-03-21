/**
 * Created by MaxSosnov on 19.03.2016.
 */
"use strict";

class User{
    //values.connection - socket connection
    //values.name - nickname
    constructor(values){
        console.log("constructor");
        //this.name = values.name || this._getRandomName();
        this.connection = values.connection;
        this.name = values.name;
        this.logger = values.logger;
        this.connection.on("text", function (str) {
            let message = JSON.parse(str);
            switch(message.type){
                case "message":
                    this.logger.debug("got message");
                    this.onMessage(message.text);
                    break;
                case "command":
                    this.logger.debug("got command");
                    if (message.text.substring(0, "/rename".length) == "/rename"){
                        this.oldname = this.name.substring(0, this.name.length);
                        this.name = message.text.substring("/rename".length + 1);
                        this.onNameChanged(this.name);
                    }
                    break;
                case "init":
                    this.name = message.name || 'Unnamed user';
                    this.sendMessage(JSON.stringify({type: "init", name: this.name}));
                    break;
            }
        }.bind(this));
        this.connection.on("close", function(code, reason){
            this.logger.info("user %s disconnected with code %d and reason $s", this.name, code, reason);
            this.onDisconnect("");
        }.bind(this));
        this.connection.on("error", function(err){
            console.log(err);
            //this.onDisconnect("");
        }.bind(this));
    }
    onNameChanged(newName){

    }
    onMessage(message){

    }
    onDisconnect(message){

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