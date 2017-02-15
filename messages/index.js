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
	try{
		if (!session.userData || !session.userData.zorkId) {
			session.send("iniciando credenciales");
			session.beginDialog('/hola');
		} else {
			session.send("usando sesion iniciada...");
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
        builder.Prompts.choice(session, "Hola, ¿eres un nuevo jugador?", "si|no"); 
    },
    function (session, results) {
        if (results.response) {
            if (results.response === "si"){
				session.userData.isNew = true;
				builder.Prompts.text(session, "¿Cual es tu id de jugador?"); 
			} 
            if (results.response === "no"){
				session.userData.isNew = false;
				builder.Prompts.text(session, "¿Cual es tu id de jugador?"); 
			}
        } else {
            session.send("No lo he entendido");
			session.endDialog();
        }
    },
	function (session, results){
		var id = results.response;
		if (session.userData.isNew && zork.sessions[id]){
			session.send("Ya existe este usuario");
		}
		if (!session.userData.isNew && !zork.sessions[id]){
			session.send("No existe este usuario");
		}
		if (session.userData.isNew && !zork.sessions[id]){
			session.send('Comienza el juego...');
			session.userData.zorkId = id;
			zork.initializeZork(session);
		}
		if (!session.userData.isNew && zork.sessions[id]){
			session.userData.zorkId = id;
			zork.sessions[id].sendMessage("mirar");
		}
		
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
