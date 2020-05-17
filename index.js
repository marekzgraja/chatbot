const BootBot = require('bootbot');
const config = require('config');
const togpx = require('togpx');
const tmp = require('tmp');
const fs = require('fs');

//needed for api call
const fetch = require('node-fetch');

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

bot.on('postback:HELP_WEATHER', (payload, chat) => {
	console.log('button weather clicked');

	getWeather(); 

});


//functions
function getWeather(){

	chat.conversation((conversation) => {
		var city = data.match[1]; 
		var url = `api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OWM_KEY}`;
		

		fetch(url)
			.then(res => res.json())
			.then(json => {
				console.log("OWM result: " + JSON.stringify(json);
				if(json.Response == "False"){
					converstaion.say('I could not find information about weather in given city.');
					conversation.end();
				}else{ 
					conversation.say('Wheather in ' + city + ': ');
				}
		});
	});

}

bot.start(port);
