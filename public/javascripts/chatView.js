$(document).ready(function() {
    window.client = new ChatClient({url:"ws://" + url + ":" +port});
    client.userConnected = function(values){
        $("#userlist").append(renderHtmlForUser(values.username));
    };
    client.userDisconnected = function(values){
        $("#userlist").empty();
        for(var user of client.users) client.userConnected({username: user});
    };
    client.userRenamed = function(values){
        $("#userlist").empty();
        for(var user of client.users) client.userConnected({username: user});
    }.bind(this);
    client.userMessaged = function(values){
        $("#messages").append(renderHtmlForMessage(values.from, values.text));
        scrollChat();
        notification(values.from);

    }


    var newMessageSound = new Audio("/sounds/newMessage.mp3");
    newMessageSound.volume = 0.04;
    var chatActive = false;
    restoreMuteCheckbox();

    function restoreMuteCheckbox(){
        if(localStorage.getItem("mute-sound") == 'true'){
            $("#mute-sound").prop("checked", true );
        }
        else{
            $("#mute-sound").prop("checked", false );
        }
    }

    function renderHtmlForMessage(from, text, avatarUrl){
        var html = '';
        avatarUrl = avatarUrl || '/images/defaultAvatar.png';
        html += '<div class="row message"><div class="col-md-1 col-sm-1 col-md-offset-1 col-sm-offset-1"><img src="';
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
    
    function notification(senderName){
        var myName = client.name;
        var muted = $('#mute-sound').is(':checked');
        if((senderName != myName) && !muted){
            newMessageSound.pause();
            newMessageSound.play();
        }
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
        if (text.substring(0, "/rename".length) == "/rename"){
            var newname = text.substring("/rename".length + 1);
            client.rename(newname);
        }
        else{
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

});


