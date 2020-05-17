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
				{ type: 'postback', title: 'Temperature', payload: 'HELP_TEMP'}
			]
		});
	});
});

//help
bot.hear(['help'], (payload, chat) => {
	console.log('help');
	chat.say('List of all commands:\ntemperature\nweather\nhelp\nhello');
});

//weather with quick replies
bot.on('postback:HELP_TEMP', (payload, chat) => {
	console.log('button TEMP clicked'); 

	chat.conversation((conversation) => {

		const question = {
			text: 'Write a city you want temperature for.',
			quickReplies: ['Prague', 'London', 'New York'],
			options: {typing: true}
		}; 

		conversation.ask(
			question, 
			(payload, conversation) => { 

				let city = payload.message.text;
				console.log('is this a city: ' + city);

				let result;

				const url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + OWM_KEY + '&units=metric'; 

				fetch(url)
					.then(res => res.json())
					.then(json => {
						console.log("OWM result: " + JSON.stringify(json));
						if(json.cod == "404"){
							result = false;
							conversation.say('I could not find information about temperature in given city.');
						}else{ 
							result = json.main.temp;
							conversation.say('Temperature in ' + city + ' is ' + result + ' Celsius');
						} 
						conversation.end();
				}); 

			}
		); 
	});

});

//weaht in given city
bot.hear(/temperature in (.*)/i, (payload, chat, data) => {
	console.log('someone said temperature?'); 

	chat.conversation((conversation) => {
		const city = data.match[1]; 

		let result = getWeather(city);

		if(result){ 
			conversation.say('Temperature in ' + city + ' is ' + result + ' Celsius');
		}else{ 
			conversation.say('I could not find information about temperature in given city.');
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
}



bot.start(port);
