const BootBot = require('bootbot');
const config = require('config');
const togpx = require('togpx');
const tmp = require('tmp');
const fs = require('fs');

//init
var port = process.env.PORT || config.get('PORT');

console.log('index.js inited');

const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});

bot.on('message', (payload, chat) => {
	const text = payload.message.text;
	console.log(`The user said: ${text}`);
});

bot.hear(['hello', 'hi', 'hey'], (payload, chat) => {
	console.log('The user said "hello" or "hi"!');
	chat.getUserProfile().then((user) => {
		var answer = `Hello ${user.first_name}, how can I help you? You do not know? Then choose one of the commands below.`;
		
		chat.say({
			text: answer,
			buttons: [
				{ type: 'postback', title: 'Weather', payload: 'HELP_WEATHER'}
			]
		});
	});
});

bot.start(port);
