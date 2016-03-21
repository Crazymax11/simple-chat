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
        this.limit = values.limit || 20;
    }

    pushMessage(from, text){
        var message = {
            "from" : from,
            "text" : text,
            "time" : new Date()
        };
        this.messages.push(message);
        this.messages = this.messages.slice(-this.limit);
    }

    getLasts(number){
        number = number || 10;
        return this.messages.slice(-number);
    }
}

module.exports = messagesStorage;

