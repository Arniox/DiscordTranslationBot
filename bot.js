//const { OpusEncoder } = require('@discordjs/opus');
const Enmap = require("enmap");
var Discord = require('discord.js');
var settings = require('./configure.json');
var dataToUse = require('./data-to-use.json');
var tools = require('./extra-functions');
var fs = require('fs');

//Initialize Discord bot 
var bot = new Discord.Client();
//Randomise prykie ban command
settings.bancommand = CreateCommand(10);
//Write to file
fs.writeFileSync('./configure.json', JSON.stringify(settings));
//Attach settings to bot
bot.config = settings;
bot.datatouse = dataToUse;

//Attaches all event files to event
fs.readdir('./events/', (err, files) => {
	if (err)
		return console.error(err); //Throw if file breaks
	files.forEach(file => {
		//if file is not js file, ignore
		if (!file.endsWith(".js"))
			return;
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
	if (err)
		return console.error(err); //Throw if folder breaks
	files.forEach(file => {
		//if file is not js file, ignore
		if (!file.endsWith(".js"))
			return;
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
//Bot loggin
bot.login(process.env.BOT_TOKEN);






/* 

bot.on('message', msg => {
	var msgContent = msg.content;
	var channel = msg.channel;
	var author = msg.author;
	var member = msg.member;
	var guild = msg.guild;

	//Make sure commands are not DM
	if (!guild) return;

	//Commands start with
		if (!author.bot) {
			//msgContent = tools.removeByMatches(msgContent, settings["translate-ignored-patterns"]);
			if (!msgContent) { return; }
			//Detect
			googleTranslate.detectLanguage(msgContent, function (err, detection) {
				//Translate if not english or link
				if (detection.language != 'en' && detection.language != 'und' && detection.confidence > 0.90) {
					//Translate
					googleTranslate.translate(msgContent, detection.language, 'en', function (err, translation) {
						if (translation.translatedText !== msgContent) {
							msg.delete({ timeout: 0 }); //Delete message
							//Get country
							googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
								//Create embedded message
								var embeddedTranslation = new Discord.MessageEmbed()
									.setColor('#0099ff')
									.setAuthor(author.username, author.avatarURL())
									.setDescription(translation.translatedText)
									.addFields(
										{ name: 'Original text', value: `${msgContent}` },
										{
											name: 'Detected Language',
											value: `${languageCodes.find(i => i.language == detection.language).name} - ` +
												`${(detection.confidence * 100).floor().toString()}% confidence.`,
											inline: true
										}
									)
									.setTimestamp()
									.setFooter('Powered by Google Translate');
								//Send
								return channel.send(embeddedTranslation);
							});
						}
					});
				}
			});
		}
});
bot.login(process.env.BOT_TOKEN);
*/
//----------------FUNCTIONS--------------------------------
//Function variables / Globals
const minutes = 20, interval = minutes * 60 * 1000;

//Ping bot
setInterval(function () {
	console.log('I am currently alive.');
}, interval);

//Get random string of length
function CreateCommand(length) {
	var result = '',
		characters = dataToUse["strings-to-chose-for-ban-command"],
		charactersLength = characters.length;
	for (var i = 0; i < length; ++i)
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	return result;
}

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