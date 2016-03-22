$(document).ready(function() {
    window.client = new ChatClient({url:"ws://" + url + ":" +port});
    client.userConnected = function(values){
        $("#userlist").append(renderHtmlForUser(values.username));
    };
    client.userDisconnected = function(values){
        $("#userlist").empty();
        for(var user of window.client.users) client.userConnected({username: user});
    };
    client.userRenamed = function(values){
        $("#userlist").empty();
        for(var user of client.users) client.userConnected({username: user});
    }.bind(this);
    client.userMessaged = function(values){
        $("#messages").append(renderHtmlForMessage(values.from, values.text));
            unreadMessages++;
            scrollChat();
            notification(values.from);
    };
    client.userPrivateMessaged = function(values){
        $("#messages").append(renderHtmlForMessage(values.from, values.text, '', 'private-message'));
        unreadMessages++;
        scrollChat();
        notification(values.from);
    };
    client.messageRestored = function (values) {
        $("#messages").append(renderHtmlForMessage(values.from, values.text));
        scrollChat();
    };

    var newMessageSound = new Audio("/sounds/newMessage.mp3");
    newMessageSound.volume = 0.04;
    var chatActive = false;
    var windowActive = true;
    var originalPageTitle = $("title").text();
    var titleInterval, titleTimeout;
    var unreadMessages = 0;

    restoreMuteCheckbox();

    function restoreMuteCheckbox(){
        if(localStorage.getItem("mute-sound") == 'true'){
            $("#mute-sound").prop("checked", true );
        }
        else{
            $("#mute-sound").prop("checked", false );
        }
    }

    function renderHtmlForMessage(from, text, avatarUrl, messageType){
        messageType = messageType || 'message';
        var html = '';
        avatarUrl = avatarUrl || '/images/defaultAvatar.png';
        html += '<div class="row ' + messageType + '"><div class="col-md-1 col-sm-1 col-md-offset-1 col-sm-offset-1"><img src="';
        html += avatarUrl;
        html += '"class="img-circle img-responsive"></div><div class="col-md-9 col-sm-9"><label>';
        html += from;
        html += '</label><p>';
        html += text;
        html += '</p></div></div>';
        return html;
    }


    function renderHtmlForUser(username, avatarUrl){
        var html = '';
        avatarUrl = avatarUrl || '/images/defaultAvatar.png';
        html += '<div class="row user"><div class="col-sm-2 col-sm-offset-1"><img src="';
        html += avatarUrl;
        html += '" class="img-circle img-responsive"></div><div class="col-sm-8"><p>';
        html += username;
        html += '</p></div></div>';
        return html;
    }

    function blinkTitle(msg1, msg2, icon1, icon2){
        icon1 = icon1 || 'new-message.ico';
        icon2 = icon2 || 'favicon.ico';
        $("title").html(msg1);
        $('link[rel$=icon]').remove();
        $('head').append( $('<link rel="shortcut icon" type="image/x-icon"/>' ).attr( 'href', "images/ico/" + icon1  ) );
        titleTimeout = setInterval(function(){
            $("title").html(msg2);
            $('link[rel$=icon]').remove();
            $('head').append( $('<link rel="shortcut icon" type="image/x-icon"/>' ).attr( 'href', "images/ico/" + icon2  ) );
        },1000)
    }
    
    function notification(senderName){
        var myName = client.name;
        var muted = $('#mute-sound').is(':checked');
        unreadMessages = windowActive ? 0 : unreadMessages;
        if(unreadMessages){
            clearInterval(titleInterval);
            clearInterval(titleTimeout);
            var msg1 = 'You have ' + unreadMessages + ' new messages';
            blinkTitle(msg1, originalPageTitle);
            titleInterval = setInterval(function(){
               blinkTitle(msg1, originalPageTitle);
            }, 2000)
        }
        if((senderName != myName) && !muted){
            newMessageSound.play();
        }
    }

    function restoreOriginalTitle(){
        clearInterval(titleInterval);
        clearInterval(titleTimeout);
        $("title").html(originalPageTitle);
        $('link[rel$=icon]').remove();
        $('head').append( $('<link rel="shortcut icon" type="image/x-icon"/>' ).attr( 'href', "images/ico/favicon.ico") );
    }

    function scrollChat(){
        if (!chatActive) {
            $("#messages").animate({
                scrollTop: $('#messages')[0].scrollHeight + 9999
            }, 1000);
        }
    }

    $("#userlist").niceScroll({horizrailenabled: false});

    $("#messages").niceScroll({horizrailenabled: false});

    $('#send').on('click', function () {
        sendData($('.form-control').val());
        $('.form-control').val("");
    });

    $('#clear').on('click', function(){
        $('#messages').empty();
    });

    $('#mute-sound').on('click', function(){
        localStorage.setItem("mute-sound", $('#mute-sound').is(':checked'));
    });

    function sendData(text){
        switch(text.split(' ')[0]){
            case '/help':
                client.help();
                break;
            case '/rename':
                client.rename(text.split(' ')[1]);
                break;
            case '/whisper','/w':
                client.sendPrivateMessage(text.split(' ')[1], text.substr(text.split(' ')[0].length + text.split(' ')[1].length + 1));
                break;
            default:
                client.sendMessage(text);
        }
    }

    $('.form-control').bind("enterKey",function(e){
        sendData(this.value);
        this.value = "";
    });

    $('.form-control').keyup(function(e){
        if(e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });

    $("#messages").mouseover(function () {
        chatActive = true;
    });

    $("#messages").mouseout(function () {
        chatActive = false;
    });

    $(window).blur(function(e) {
        windowActive = false;
    });

    $(window).focus(function(e) {
        windowActive = true;
        restoreOriginalTitle();
    });

});


