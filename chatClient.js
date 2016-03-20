/**
 * Created by MaxSosnov on 20.03.2016.
 */
"use strict";


class ChatClient{
    constructor(values){
        this.socket = new WebSocket(values.url);
        this.users = [];
        this.socket.onmessage = function(event){
            var data = JSON.parse(event.data);
            switch(data.type){
                case "new user":
                    this.users.push(data.username);
                    this.userConnected({username: data.username});
                    break;
                case "disconnect":
                    this.users.splice(this.users.indexOf(data.user),1);
                    this.userDisconnected({user: data.user, message: data.message});
                    break;
                case "rename":
                    this.users.splice(this.users.indexOf(data.from),1);
                    this.users.push(data.to);
                    this.userRenamed({from: data.from, to: data.to});
                    break;
                case "message":
                    this.userMessaged({from: data.from, text: data.text});
                    break;
            }
        }.bind(this);
    }
    userDisconnected(values){

    }
    userConnected(values){

    }
    userRenamed(values){

    }
    userMessaged(values){

    }
    sendMessage(text){
        this.socket.send(JSON.stringify({type: "message", text: text}));
    }
    rename(newname){
        this.socket.send(JSON.stringify({type: "command", text: "/rename " + newname}));
    }

}