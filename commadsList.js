'use strict';
var commands ={
    '/help' : function(mode, object, callback) {
        callback = callback || function() {};
        let values = {};
        let err = null;
        let handler = null;
        switch (mode) {
            case 'client' :
                console.log('Client mode');
                let clientHandlerName = 'help';
                err =  new Error('There is no "%s" handler in your client object', clientHandlerName);
                values.aliases = ['/h', '/?'];
                // Уже сейчас не красивый перебор всех свойств, а что будет если их будет >1?
                for (let key in object) {
                    if(key == clientHandlerName){
                        handler = object[clientHandlerName];
                        err = null;
                    }
                }
                callback(err, values, handler);
                break;
            case 'server' :
                console.log('Server mode');
                let serverHandlerName = 'sendMessage';
                err =  new Error('There is no "%s" handler in your client object', serverHandlerName);
                let helpResponse = '';
                helpResponse += '<p>Change name: "/rename newname" </p>';
                helpResponse += '<p>Whisper: "/whisper(/w) username message" </p>';
                helpResponse += '<p>Help: "/help (/h)" </p>';
                values.data = helpResponse;
                for (let key in object) {
                    if(key == serverHandlerName){
                        handler = object[serverHandlerName];
                        err = null;
                    }
                }
                callback(err, values, handler);
                break;
        };
    },
};

var object = function() {
    object.prototype.help = function(){
        console.log('Client help hadler executed');
    };
    object.prototype.sendMessage = function(){
        console.log('Server handler executed');
    };
}
var test = new object();

for (let key in commands){
    commands[key]('client', test, function(err, values, handler){
        if(err){
            console.log(err)
        }
        else{
           console.log('aliases for %s : ' + values.aliases, key);
           handler();
        };
    });
    commands[key]('server', test, function(err, values, handler){
        if(err){
            console.log(err)
        }
        else{
            console.log('Data : ' + values.data, key);
            handler();
        };
    });
}
