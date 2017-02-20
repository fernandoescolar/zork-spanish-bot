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

var helpStrings = ['ayuda', 'help', 'sobre', 'info', 'pista'];
bot.dialog('/', function (session) {
	try{
		if (!session.userData || !session.userData.zorkId) {
			session.beginDialog('/hola');
		} else {
			var restart = session.message.text.toLowerCase() === 'reiniciar';
			var help = helpStrings.indexOf(session.message.text.toLowerCase()) >= 0;
			
			if (help){
				session.send("Ayuda:");
				session.send("Este es un juego online de tipo texto llamado Zork.");
				session.send("Para ver este menú puedes introducir 'ayuda'");
				session.send("Para reiniciar la partida puedes introducir 'reiniciar'");
				session.send("Para guardar el estado actual de la partida puedes introducir 'guardar'");
				session.send("Para cargar el estado guardado de la partida puedes introducir 'cargar'");
				session.send("Está activada una opción de autoguardado para cuando hay cierto tiempo de inactividad");
				session.send("Más información en https://github.com/fernandoescolar/zork-spanish-bot");
				return;
			}
			
			if (!zork.sessions[session.userData.zorkId] || restart){
				zork.initializeZork(session);
				if (restart) {
					session.send("reiniciando...");
					zork.sessions[session.userData.zorkId].outputFlush();
					zork.sessions[session.userData.zorkId].setAutoOutput(true);
				} else {
					zork.sessions[session.userData.zorkId].restoreState(function(ok){ 
						zork.sessions[session.userData.zorkId].setAutoOutput(true);
						if(ok) { 
							session.send("Un segundo!! He encontrado una partida guardada y la he cargado"); 
							zork.sessions[session.userData.zorkId].outputClean();
							zork.sessions[session.userData.zorkId].sendMessage("mirar"); 
						} else {
							zork.sessions[session.userData.zorkId].outputFlush();
						}
					});
				}
			} else {
				zork.sessions[session.userData.zorkId].setAutoOutput(true);
				zork.sessions[session.userData.zorkId].sendMessage(session.message.text);
			}
		}
	} catch(ex){
		session.send(JSON.stringify(ex));
	}
});

bot.dialog('/hola', [
    function (session) {
		session.send('Versión Aplha');
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
