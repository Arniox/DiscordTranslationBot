//const { OpusEncoder } = require('@discordjs/opus');
const Enmap = require("enmap");
const Discord = require('discord.js');
const mysql = require('promise-mysql');

//WIP - to be removed
var settings = require('./configure.json');
var fs = require('fs');

//Create mysql connection pool
const pool = mysql.createPool({
	host: process.env.CLEARDB_DATABASE_URL.match(/(@)[a-zA-Z\d-.]+/)[0].replace(/(@)/, ''), //Get host
	user: process.env.CLEARDB_DATABASE_URL.match(/(\/\/)[a-zA-Z\d]+/)[0].replace(/(\/\/)/, ''), //Get user
	password: process.env.CLEARDB_DATABASE_URL.match(/(:)[a-zA-Z\d]+/)[0].replace(/(:)/, ''), //Get password
	database: process.env.CLEARDB_DATABASE_URL.match(/([a-zA-Z]\/)[a-zA-Z\d_]+/)[0].replace(/([a-zA-Z]\/)/, '') //Get database
});

//Initialize Discord bot 
var bot = new Discord.Client();

pool.then((p) => {
	return p.getConnection();
}).then((connection) => {
	console.log(`Connection to ${process.env.CLEARDB_DATABASE_URL} was successful!`);
	bot.con = connection; //Attach connection to bot

	//Attach settings to bot
	bot.config = settings;

	//Attaches all event files to event
	fs.readdir('./events/', (err, files) => {
		if (err) return console.error(err); //Throw if file breaks
		files.forEach(file => {
			//if file is not js file, ignore
			if (!file.endsWith(".js")) return;
			//Load event file
			const event = require(`./events/${file}`);
			//Get the event name from file nmae
			var eventName = file.split('.')[0];
			console.log(`Attempting to load event ${eventName}`);
			//Bind all found events to client
			bot.on(eventName, event.bind(null, bot));
			delete require.cache[require.resolve(`./events/${file}`)]; //Remove from memory
		});
	});

	//Set up commands and attach to the client
	bot.commands = new Enmap();
	fs.readdir('./commands/', (err, files) => {
		if (err) return console.error(err); //Throw if folder breaks
		files.forEach(file => {
			//if file is not js file, ignore
			if (!file.endsWith(".js")) return;
			//Load the command file itself
			var props = require(`./commands/${file}`);
			//Get just the command name from the file name
			var commandName = file.split('.')[0];
			console.log(`Attempting to load command ${commandName}`);
			//Store the command in the command Enmap.
			bot.commands.set(commandName, props);
		});
	});
	//Handle promise rejections
	process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));
}).catch(err => {
	console.error(err, `Connection to ${process.env.CLEARDB_DATABASE_URL} has failed!`);
});
//Bot loggin
bot.login(process.env.BOT_TOKEN);

//----------------FUNCTIONS--------------------------------
//Function variables / Globals
const minutes = 20, interval = minutes * 60 * 1000;
//Ping bot
setInterval(function () {
	console.log('I am currently alive.');
}, interval);

//To funny case
function ToFunnyCase(str) {
	return str.split('').map((v, i) => i % 2 == 0 ? v.toLowerCase() : v.toUpperCase()).join('');
}

//---------------PROTOTYPES-----------------------
String.prototype.toHHMMSS = function () {
	var sec_num = parseInt(this, 10); //don't forget the second param
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours < 10)
		hours = '0' + hours;
	if (minutes < 10)
		minutes = '0' + minutes;
	if (seconds < 10)
		seconds = '0' + seconds;

	var time = hours + ':' + minutes + ':' + seconds;
	return time;
}