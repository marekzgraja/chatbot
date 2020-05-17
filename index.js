const BootBot = require('bootbot');
const config = require('config');
const togpx = require('togpx');
const tmp = require('tmp');
const fs = require('fs');

//needed for api call
const fetch = require('node-fetch');

//init
var port = process.env.PORT || config.get('PORT'); 

//api keys
const OWM_KEY = "02695ee4c789e3ed332512aea62be367";

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

bot.on('postback:HELP_WEATHER', (payload, chat) => {
	console.log('button weather clicked'); 
	getWeather(); 
});

bot.hear(/weather in (.*)/i, (payload, chat, data) => {
	console.log('someone said weather?'); 
	getWeather(chat, data); 
});


//functions
function getWeather(chat, data){

	chat.conversation((conversation) => {
		const city = data.match[1]; 
		const url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + OWM_KEY + '&units=metric';
		

		fetch(url)
			.then(res => res.json())
			.then(json => {
				console.log("OWM result: " + JSON.stringify(json));
				if(json.cod == "404"){
					converstaion.say('I could not find information about weather in given city.');
					conversation.end();
				}else{ 
					conversation.say('Wheather in ' + city + 'is ' + json.main.temp);
				}
		});
	});

}

bot.start(port);
