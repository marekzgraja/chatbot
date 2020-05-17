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

	chat.conversation((conversation) => {

		const question = {
			text: 'Write a city you want weather for.',
			quickReplies: ['Prague', 'London', 'New York']
		};

		const answer = (payload, conversation) => {
			const city = payload.message.text; 

			console.log('ask .. ');

			let result = getWeather(city); 


			if(result){ 
				conversation.say('Wheather in ' + city + 'is ' + result + ' Celsius');
			}else{ 
				conversation.say('I could not find information about weather in given city.');
			} 


		}; 

		const callbacks = [
			{
				event: 'quicky_reply',
				callback: () => {
					console.log('quick reply');
				},
				pattern: ['Prague', 'London', 'New York'],
				callback: () => { 
					console.log('pattern'); 
				},
			} 
		];

		const options = { 
			typing: true //send a typing indicator before asking the question
		};

		conversation.ask(question, answer, callbacks, options); 
	});

});

bot.hear(/weather in (.*)/i, (payload, chat, data) => {
	console.log('someone said weather?'); 

	chat.conversation((conversation) => {
		const city = data.match[1]; 

		let result = getWeather(city);

		if(result){ 
			conversation.say('Wheather in ' + city + 'is ' + result + ' Celsius');
		}else{ 
			conversation.say('I could not find information about weather in given city.');
		} 

		conversation.end();
	});
});


function getWeather(city){
	const url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + OWM_KEY + '&units=metric'; 

	fetch(url)
		.then(res => res.json())
		.then(json => {
			console.log("OWM result: " + JSON.stringify(json));
			if(json.cod == "404"){
				return false;
			}else{ 
				return json.main.temp;
			} 
	});
		
	return false;
}



bot.start(port);
