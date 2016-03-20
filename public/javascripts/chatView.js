$(document).ready(function() {
    window.client = new ChatClient({url:"ws://" + url + ":" +port});
    client.userConnected = function(values){
        $("#userlist").append('<p>' + values.username + '</p>');
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
        $("#messages").append('<p>' + values.from + ": " +values.text + "</p>");
    }
});

$('#send').on('click', function () {
    sendData($('.form-control').val());
    $('.form-control').val("");

});

$('#clear').on('click', function(){
    $('#messages').empty();
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
