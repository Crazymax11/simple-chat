// username - string
// avatarUrl - url
// time - string
// messages - [string .. string]
function render_user_message(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (avatarUrl, messages, time, undefined, username) {
buf.push("<div class=\"row user-message\"><div class=\"col-xs-2 user-info-column\"><p>" + (jade.escape(null == (jade_interp = username) ? "" : jade_interp)) + "</p><img" + (jade.attr("src", avatarUrl, true, false)) + " class=\"img-circle img-responsive\"/></div><div class=\"col-xs-10 messages-info-column\"><div class=\"message-info-header\"><p>" + (jade.escape(null == (jade_interp = time) ? "" : jade_interp)) + "</p></div><div class=\"message-info-body top-margin-4\">");
// iterate messages
;(function(){
  var $$obj = messages;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var message = $$obj[$index];

buf.push("<p>" + (jade.escape(null == (jade_interp = message) ? "" : jade_interp)) + "</p>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var message = $$obj[$index];

buf.push("<p>" + (jade.escape(null == (jade_interp = message) ? "" : jade_interp)) + "</p>");
    }

  }
}).call(this);

buf.push("</div></div></div>");}.call(this,"avatarUrl" in locals_for_with?locals_for_with.avatarUrl:typeof avatarUrl!=="undefined"?avatarUrl:undefined,"messages" in locals_for_with?locals_for_with.messages:typeof messages!=="undefined"?messages:undefined,"time" in locals_for_with?locals_for_with.time:typeof time!=="undefined"?time:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"username" in locals_for_with?locals_for_with.username:typeof username!=="undefined"?username:undefined));;return buf.join("");
}
