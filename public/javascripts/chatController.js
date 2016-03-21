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
                    if (this.name == data.from) {this.name = data.to;localStorage.setItem("chat-username", this.name)};
                    break;
                case "message":
                    this.userMessaged({from: data.from, text: data.text});
                    break;
                case "private message":
                    this.userPrivateMessaged({from: data.from, text: data.text});
                    break;
                case "init":
                    this.name = data.name;
                    for(let us of data.users){
                        this.users.push(us);
                        this.userConnected({username:us});
                    }
                    for(let message of data.messages){
                        this.messageRestored({from: message.from, text: message.text})
                    }
                    break;
                case "init request":
                    let username = localStorage.getItem("chat-username");
                    if (!username) username = "";
                    this.socket.send(JSON.stringify({type: "init", name: username}));
                    console.log('init sent');
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
    userPrivateMessaged(values){

    }
    messageRestored(values){

    }
    sendMessage(text){
        this.socket.send(JSON.stringify({type: "message", text: text}));
    }
    sendPrivateMessage(recipient,text){
        this.socket.send(JSON.stringify({type: "private message", text: text, recipient: recipient}));
    }
    rename(newname){
        this.socket.send(JSON.stringify({type: "command", text: "/rename " + newname}));
    }
    help(){
        this.socket.send(JSON.stringify({type: "command", text: "/help"}));
    }

}