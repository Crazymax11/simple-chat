/**
 * Created by Глеб on 21.03.2016.
 */
"use strict";

/**
*   messageObject = {
*            "from" : from,
*            "text" : text,
*            "time" : new Date()
*        }
**/

class messagesStorage{
    constructor(values) {
        this.logger = logger.getLogger("messagesStorage");
        this.logger.info("messagesStorage started");
        this.messages = [];
    }

    pushMessage(from, text){
        var message = {
            "from" : from,
            "text" : text,
            "time" : new Date()
        };
        this.messages.push(message)
    }

    getLasts(number){
        number = number || 10;
        return this.messages.length > number ? this.messages.slice(-number) : this.messages;
    }
}

module.exports = messagesStorage;

