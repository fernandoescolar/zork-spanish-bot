"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var zork = require('./zork');
var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

bot.dialog('/', function (session) {
	try{
		if (!session.userData || !session.userData.zorkId) {
			session.beginDialog('/hola');
		} else {
			if (!zork.sessions[session.userData.zorkId]){
				zork.initializeZork(session);
			} else {
				zork.sessions[session.userData.zorkId].sendMessage(session.message.text);
			}
		}
	} catch(ex){
		session.send(JSON.stringify(ex));
	}
});

bot.dialog('/hola', [
    function (session) {
        session.send('Parece que eres nuevo');
		session.userData.zorkId = guid();
		session.send('Comienza el juego...');
		session.endDialog();
    }
]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
