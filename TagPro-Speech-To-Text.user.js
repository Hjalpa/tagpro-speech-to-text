// ==UserScript==
// @name          TagPro Speech To Text
// @namespace     http://www.reddit.com/u/undergroundmonorail
// @description   Say a message out loud to say it into chat.
// @include         https://tagpro.koalabeast.com/game
// @include         https://tagpro.koalabeast.com/game?*
// @license       MIT
// @author        monorail
// @version       0.2
// ==/UserScript==

(function() {
    // https://github.com/TalAter/annyang
    // I couldn't figure out how to load it dynamically, so I just copypasted
    // the minified version.
    // @require works in Firefox, but not Chrome, and this is way easier than
    // any alternative I found.
    (function(a){"use strict";var b=this,c=b.SpeechRecognition||b.webkitSpeechRecognition||b.mozSpeechRecognition||b.msSpeechRecognition||b.oSpeechRecognition;if(!c)return b.annyang=null,a;var d,e,f=[],g={start:[],error:[],end:[],result:[],resultMatch:[],resultNoMatch:[],errorNetwork:[],errorPermissionBlocked:[],errorPermissionDenied:[]},h=0,i=!1,j="font-weight: bold; color: #00f;",k=/\s*\((.*?)\)\s*/g,l=/(\(\?:[^)]+\))\?/g,m=/(\(\?)?:\w+/g,n=/\*\w+/g,o=/[\-{}\[\]+?.,\\\^$|#]/g,p=function(a){return a=a.replace(o,"\\$&").replace(k,"(?:$1)?").replace(m,function(a,b){return b?a:"([^\\s]+)"}).replace(n,"(.*?)").replace(l,"\\s*$1?\\s*"),new RegExp("^"+a+"$","i")},q=function(a){a.forEach(function(a){a.callback.apply(a.context)})},r=function(){d===a&&b.annyang.init({},!1)};b.annyang={init:function(k,l){l=l===a?!0:!!l,d&&d.abort&&d.abort(),d=new c,d.maxAlternatives=5,d.continuous=!0,d.lang="en-US",d.onstart=function(){q(g.start)},d.onerror=function(a){switch(q(g.error),a.error){case"network":q(g.errorNetwork);break;case"not-allowed":case"service-not-allowed":e=!1,(new Date).getTime()-h<200?q(g.errorPermissionBlocked):q(g.errorPermissionDenied)}},d.onend=function(){if(q(g.end),e){var a=(new Date).getTime()-h;1e3>a?setTimeout(b.annyang.start,1e3-a):b.annyang.start()}},d.onresult=function(a){q(g.result);for(var c,d=a.results[a.resultIndex],e=0;e<d.length;e++){c=d[e].transcript.trim(),i&&b.console.log("Speech recognized: %c"+c,j);for(var h=0,k=f.length;k>h;h++){var l=f[h].command.exec(c);if(l){var m=l.slice(1);return i&&(b.console.log("command matched: %c"+f[h].originalPhrase,j),m.length&&b.console.log("with parameters",m)),f[h].callback.apply(this,m),q(g.resultMatch),!0}}}return q(g.resultNoMatch),!1},l&&(f=[]),k.length&&this.addCommands(k)},start:function(b){r(),b=b||{},e=b.autoRestart!==a?!!b.autoRestart:!0,h=(new Date).getTime(),d.start()},abort:function(){r(),e=!1,d.abort()},debug:function(a){i=arguments.length>0?!!a:!0},setLanguage:function(a){r(),d.lang=a},addCommands:function(a){var c,d;r();for(var e in a)if(a.hasOwnProperty(e)){if(c=b[a[e]]||a[e],"function"!=typeof c)continue;d=p(e),f.push({command:d,callback:c,originalPhrase:e})}i&&b.console.log("Commands successfully loaded: %c"+f.length,j)},removeCommands:function(a){a=Array.isArray(a)?a:[a],f=f.filter(function(b){for(var c=0;c<a.length;c++)if(a[c]===b.originalPhrase)return!1;return!0})},addCallback:function(c,d,e){if(g[c]!==a){var f=b[d]||d;"function"==typeof f&&g[c].push({callback:f,context:e||this})}}}}).call(this);

    // The following code is the function for sending a chat message. This is
    // how every userscript that touches chat does it. It's almost definitely
    // not related to the problem.

    var lastMessage = 0;

    var chat = function(message, all) {
        var limit = 500 + 10;
        var now = new Date();
        var timeDiff = now - lastMessage;
        if (timeDiff > limit) {
            tagpro.socket.emit("chat", {
                message: message,
                toAll: all
            });
            lastMessage = new Date();
        } else if (timeDiff >= 0) {
            setTimeout(chat, limit - timeDiff, chatMessage)
        }
    }

    // Code that I wrote begins here.

    var team = function(message) { chat(message, 0); };
    var all = function(message) { chat(message, 1); };
    var group = function(message) {
        if (tagpro.group.socket) {tagpro.group.socket.emit('chat', message);}
    };

    commands = { 'say *message': all,
                 'team *message': team,
                 'group *message': group };

    annyang.addCommands(commands);

    annyang.start();

})();
