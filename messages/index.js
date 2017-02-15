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

bot.dialog('/', function (session) {
    //console.log(session);
    //session.send('You said ' + session.message.text);
	try{
		if (session.userData && session.userData.zorkId) {
			zork.sessions[session.userData.zorkId].sendMessage(session.message.text);
		} else {
			session.userData.zorkId = zork.initializeZork(session);
		}
	} catch(ex){
		session.send(JSON.stringify(ex));
	}
});

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
