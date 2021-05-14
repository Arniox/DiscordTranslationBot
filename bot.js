//const { OpusEncoder } = require('@discordjs/opus');
const Enmap = require("enmap");
const Discord = require('discord.js');
const mysql = require('promise-mysql');
const RedditJS = require('js-reddit.js/src');
var fs = require('fs');
var tools = require('./extra-functions');

//Load process
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

//Create mysql connection pool
const pool = mysql.createPool({
	host: process.env.CLEARDB_DATABASE_URL.match(/(@)[a-zA-Z\d-.]+/)[0].replace(/(@)/, ''), //Get host
	user: process.env.CLEARDB_DATABASE_URL.match(/(\/\/)[a-zA-Z\d]+/)[0].replace(/(\/\/)/, ''), //Get user
	password: process.env.CLEARDB_DATABASE_URL.match(/(:)[a-zA-Z\d]+/)[0].replace(/(:)/, ''), //Get password
	database: process.env.CLEARDB_DATABASE_URL.match(/([a-zA-Z]\/)[a-zA-Z\d_]+/)[0].replace(/([a-zA-Z]\/)/, '') //Get database
});
//Initialize Reddit client
const reddit = new RedditJS.Client({
	username: process.env.REDDIT_USERNAME,
	password: process.env.REDDIT_PASSWORD,
	appId: process.env.REDDIT_APP_ID,
	appSecret: process.env.REDDIT_APP_SECRET
});

//Initialize Discord bot with settings for enabled intents.
//Enable: GUILD_MEMBERS and GUILD_PRESENCES
//Enabled in the discord developer portal
const bot = new Discord.Client();

//Server music queue
const queue = new Map();
//Akinator game queue
const gameQueue = new Map();
//Jobs map
const jobsManager = new Map();

bot.dbpool = pool; //Attach pool to bot
bot.reddit = reddit; //Attach reddit to bot
bot.musicQueue = queue; //Attach music queue to bot
bot.akinatorGames = gameQueue; //Attach game queue to bot
bot.jobsManager = jobsManager; //Attach job manager to bot

//Test connection to database
bot.dbpool.then((p) => {
	return p.getConnection();
}).then((connection) => {
	//Data base works
	console.log(`Connection to ${process.env.CLEARDB_DATABASE_URL} was successful!`);
	//Reddit works
	bot.reddit.fetchSelf()
		.then(user => {
			console.log(`Reddit client is logged into ${user.name}`);
		}).catch((err) => {
			console.error(err);
		});

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

	//Release connection
	connection.release();
}).catch(err => {
	console.error(err, `Connection to ${process.env.CLEARDB_DATABASE_URL} has failed!`);
});
//Bot log in
bot.login(process.env.BOT_TOKEN);
//Handle promise rejections
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

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