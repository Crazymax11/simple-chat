/**
 * Created by MaxSosnov on 19.03.2016.
 */
"use strict";

class User{
    constructor(values){
        console.log("constructor");
        //this.name = values.name || this._getRandomName();
        this.connection = values.connection;
        this.usersArr = values.usersArr;
        this.connection.on("text", function (str) {
            let message = JSON.parse(str);
            switch(message.type){
                case "login":
                    this.name = message.name;
                    this.onNameChanged(this.name);
                    break;
                case "message":
                    console.log("onmes");
                    this.onMessage(message.text);
                    break;
                case "command":
                    if (message.text.substring(0, "/rename".length) == "/rename"){
                        this.oldname = this.name.substring(0, this.name.length);
                        this.name = message.text.substring("/rename".length + 1);
                        this.onNameChanged(this.name);
                    }
                    break;
                case "init":
                    this.name = message.name || this._getRandomName();
                    this.onInited(this.name);
                    this.sendMessage(JSON.stringify({type: "init", name: this.name}));
                    break;
            }
        }.bind(this));
        this.connection.on("close", function(code, reason){
            console.log("user %s disconnected with code %d and reason $s", this.name, code, reason);
            this.onDisconnect("");
        }.bind(this));
        this.connection.on("error", function(err){
            console.log(err);
            //this.onDisconnect("");
        }.bind(this));
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
            this.usersArr.splice(this.usersArr.indexOf(this),1);
        }
    }
    onInited(name){

    }
}

module.exports = User;