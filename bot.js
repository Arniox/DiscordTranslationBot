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
bot.login(process.env.BOT_TOKEN);

//Handle promise rejections
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));





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
	if (msgContent.startsWith(settings.prefix)) {
		var args = msgContent.substring(settings.prefix.length).split(' ');

		var cmd = args[0].toLowerCase();
		args = args.splice(1);

		switch (cmd) {
			case 'bancommand':
				msg.delete({ timeout: 0 }) //Delete message

				if (args.length != 0) {
					var option = args[0].toLowerCase();
					args = args.splice(1);

					//Check which option
					switch (option) {
						case 'change':
							if (member.hasPermission('ADMINISTRATOR')) {
								var query = args[0]; //Cut down command to only 3 characters
								args = args.splice(1);

								//Check if the query exists
								if (query) {
									var previousBanCommand = settings.bancommand;

									//Change bancommand
									settings.bancommand = query.split("").splice(0, 3).join('');
									//Reset bancommand tries
									settings["bancommand-tries"].attempted = "";
									settings["bancommand-tries"]["current-attempted-length"] = 0;
									settings["bancommand-tries"].tries = 0;
									settings["bancommand-tries"]["total-tries"] = 0;
									//Save old command
									settings["previous-bancommand"] = previousBanCommand;
									//Write to file
									fs.writeFileSync('./configure.json', JSON.stringify(settings));
									//Message prykie
									guild.members.cache
										.find(i => i.id == '341134882120138763')
										.send(new Discord.MessageEmbed().setDescription(`${author.username}, an Admin, has changed the ban command` +
											` manually to ${settings.bancommand}. Don\'t tell anyone.`).setColor('#FFCC00'));
									//Message
									return channel.send(new Discord.MessageEmbed().setDescription(`Changed Prykie ban command from: ${previousBanCommand} to: ${settings.bancommand}`).setColor('#09b50c'));
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('Sorry, I cannot change the Prykie ban command to nothing!').setColor('#b50909'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have administrative powers and cannot use this command!').setColor('#b50909'));
							}
						default:
							return channel.send(new Discord.MessageEmbed().setDescription('Sorry, what option do you want?').setColor('#b50909'));
					}
				} else {
					if (member.hasPermission('ADMINISTRATOR')) {
						var messageEmbedded = new Discord.MessageEmbed()
							.setDescription(`Bancommand info for Prykie ban command:`)
							.addFields(
								{
									name: 'Command:',
									value: `Current Random Prykie Command: ***${settings.bancommand}***`
								},
								{
									name: 'Previous Command: ',
									value: `The previous command used was ***${(settings["previous-bancommand"].length != 0 ?
										settings["previous-bancommand"][settings["previous-bancommand"].length - 1] :
										"nothing")}***`,
									inline: true
								},
								{
									name: 'Command History: ',
									value: `***${settings["previous-bancommand"].length != 0 ? `${settings["previous-bancommand"].join(', ')}` : 'No Command History'}***`,
									inline: true
								},
								{
									name: 'Previous Command Winner: ',
									value: `The person who figured out the last command (***${(settings["previous-bancommand"].length != 0 ?
										settings["previous-bancommand"][settings["previous-bancommand"].length - 1] :
										"nothing")}***) was ***${(settings["previous-bancommand-winner"] != "" ? settings["previous-bancommand-winner"] : "noone")}***`
								},
								{
									name: 'Hinted Player:',
									value: `Last random hinted player that was online at the time was: ***${(settings["hinted-member"] != "" ? settings["hinted-member"] : "noone")}***`
								},
								{
									name: 'Attempts',
									value: `${settings["bancommand-tries"]["total-tries"]} total attemps and \`${20 - settings["bancommand-tries"].tries}\` tries left before the next hint.`,
									inline: true
								},
								{
									name: 'Players have tried:',
									value: `So far, the closest guess is up to ***${(settings["bancommand-tries"].attempted != "" ? settings["bancommand-tries"].attempted : "no guesses yet")}***`
								}
							)
							.setColor('#0099ff');

						return channel.send(messageEmbedded);
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have administrative powers and cannot use this command!').setColor('#b50909'));
					}
				}
			case 'harrass':
				var person = msg.mentions.members;
				msg.delete({ timeout: 0 }); //Delete message

				if (member.hasPermission('ADMINISTRATOR')) {
					if (args.length != 0 && person.size != 0) {
						if (person.size < 2) {
							args = args.splice(1);

							if (args.length != 0) {
								var numberSelector = args[0];
								args = args.splice(1);

								//Check if numberSelector is actually a number
								if (/^\d+$/.test(numberSelector)) {
									//Grab number from string
									var numberOfSpam = parseInt(numberSelector);

									if (args.length != 0) {
										//Get message
										var messageToSpam = args.join(" ");
										args = args.splice(1);

										channel
											.send(new Discord.MessageEmbed().setDescription(`Harrassing ${person.first().toString()} with 0 / ${numberOfSpam} messages.\n\n` +
												`Content of message: ***${messageToSpam}***`).setColor('#FFCC00'))
											.then((sent) => {
												//For loop
												for (var i = 0; i < numberOfSpam + 1; ++i) {
													person.first().send(`${messageToSpam}`); //Send message

													//Edit message
													if (i == numberOfSpam)
														sent.edit(new Discord.MessageEmbed().setDescription(`✅ Finished Harrassing ${person.first().toString()} ` +
															`with ${i} / ${numberOfSpam} messages.\n\nContent of message: ***${messageToSpam}***`).setColor('#09b50c'));
													else
														sent.edit(new Discord.MessageEmbed().setDescription(`Harrassing ${person.first().toString()} ` +
															`with ${i} / ${numberOfSpam} messages.\n\nContent of message: ***${messageToSpam}***`).setColor('#FFCC00'));
												}
											});
										return;
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I cannot harrass ${person.first().toString()} with an empty message.`).setColor('#b50909'));
									}
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${numberSelector} is not a number.`).setColor('#b50909'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you didn\'t select the number of spam messages to send.`).setColor('#b50909'));
							}
						} else {
							return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you can only harrass one person at a time.').setColor('#b50909'));
						}
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you didn\'t select anyone to harrass.').setColor('#b50909'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need administrative powers for this command.').setColor('#b50909'));
				}
			default: //Error
				return channel.send(new Discord.MessageEmbed().setDescription('Sorry, I do not understand that command...').setColor('#b50909'));
		}
	} else if (msgContent.startsWith(settings.bancommand.split("").splice(0, 1).join("")) ||
		msgContent.startsWith(settings.bancommand.split("").splice(0, 2).join("")) ||
		msgContent.startsWith(settings.bancommand.split("").splice(0, 3).join(""))) {

		//Check length of msgContent
		if (msgContent.length < 4) {
			//Get guessed letters
			var firstG = msgContent.split("").splice(0, 1).join("");
			var secondG = msgContent.split("").splice(1, 1).join("");
			var thirdG = msgContent.split("").splice(2, 1).join("");
			//Get correct letters
			var firstC = settings.bancommand.split("").splice(0, 1).join("");
			var secondC = settings.bancommand.split("").splice(1, 1).join("");
			var thirdC = settings.bancommand.split("").splice(2, 1).join("");

			//Check first if you got the command
			if (firstG == firstC && secondG == secondC && thirdG == thirdC) {
				//Check perms
				if (member.hasPermission('KICK_MEMBERS') || member.id == '341134882120138763') {
					msg.delete({ timeout: 0 }); //Delete message
					//Auto ban prykie
					var findPrykie = guild.members.cache.find(i => i.id == '341134882120138763');
					if (findPrykie) {
						var prykiesId = findPrykie.id; //Save id
						findPrykie
							.send('https://discord.gg/NSmWZSW')
							.then(() => {
								console.log('I banned prykie.'); //Console log

								//Send prykie the code
								findPrykie
									.send(new Discord.MessageEmbed().setDescription(`Shhhh. The new ban command is ${settings.bancommand}. Don\'t tell anyone.`).setColor('#FFCC00'))
									.then(() => {
										//Send channel message if sent by prykie
										if (member.id == '341134882120138763')
											channel.send(new Discord.MessageEmbed().setDescription(`🤣, Prykie has decided to ban himself. This doesn\'t reset the command.` +
												` Whatever the command is, it\'s still the same as before.`).setColor('#09b50c'));

										//Ban prykie
										guild.members.ban(findPrykie, { reason: 'He\'s way too gay!' }); //Ban
										guild.members
											.unban(prykiesId)//Unban
											.then(() => {
												//Wait for ban
												if (member.id != '341134882120138763') {
													var randomPersonToHint = guild.members.cache.filter(i => i.user.presence.status == 'online' && !i.user.bot && i.id !== '341134882120138763').random(); //Filter out prykie
													var oldCommand = settings.bancommand; //Save old command

													//Random generate new command
													settings.bancommand = CreateCommand(3);
													//Reset bancommand tries
													settings["bancommand-tries"].attempted = "";
													settings["bancommand-tries"]["current-attempted-length"] = 0;
													settings["bancommand-tries"].tries = 0;
													settings["bancommand-tries"]["total-tries"] = 0;
													//Save old command
													settings["previous-bancommand"].push(oldCommand);
													settings["hinted-member"] = randomPersonToHint.user.username;
													//Save person who got the last command
													settings["previous-bancommand-winner"] = member.user.username;
													//Write to file
													fs.writeFileSync('./configure.json', JSON.stringify(settings));

													channel
														.send(new Discord.MessageEmbed().setDescription('CYA PRYKIE, you fucking bot!').setColor('#09b50c'))
														.then(() => {
															//Send random person the new ban command
															randomPersonToHint
																.send(new Discord.MessageEmbed().setDescription(`Horray! You have been randomly chosen to receive the secret Prykie ban command that you can use in ***` +
																	`${guild.toString()}***. It doesn\'t require any prefix, and as long as you have kicking powers;` +
																	` ***${settings.bancommand}*** is the Prykie ban command. Share it in the server if you want to. Or not 😛. The choice is up to you.`).setColor('#FFCC00'))
																.then(() => {
																	//Send message
																	channel
																		.send(new Discord.MessageEmbed().setDescription(`${member.toString()} figured out the command!! It was ${oldCommand}.\n` +
																			`The Prykie ban command has been changed to a new randomly generated 3 character command. It is no longer ${oldCommand}`).setColor('#FFCC00'))
																		.catch(error => {
																			console.log(`${error}. I couldn\'t post this message sorry...`);
																		});
																})
																.catch(error => {
																	console.log(`${error}. This person couldn\'t be messaged for some reason...`);
																});
														});
												}
											});
									});
							}); //Send reinvite
						return;
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('Prykie is already banned lol!').setColor('#b50909'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription(`Holy crap! You managed to figure out the Prykie ban command: ${settings.bancommand}. ` +
						`Unfortunately, you can\'t actually run this because you do not have kicking powers.`).setColor('#b50909'));
				}
			} else {
				//Check if detected 2 characters
				if (firstG == firstC && secondG == secondC) {
					//Check perms
					if (member.hasPermission('KICK_MEMBERS') && member.id != '341134882120138763') {
						//Current attempted length
						if (settings["bancommand-tries"]["current-attempted-length"] < 3) {
							//Reset tries when on a new character
							if (settings["bancommand-tries"]["current-attempted-length"] != 2)
								settings["bancommand-tries"].tries = 0;

							//Check tries is not over 0. Only message if tries is 0. Count up each time. Reset at 20
							if (settings["bancommand-tries"].tries == 0) {
								msg.delete({ timeout: 0 }); //Delete message

								//Save tries
								settings["bancommand-tries"].attempted = firstG + secondG;
								settings["bancommand-tries"]["current-attempted-length"] = 2;
								settings["bancommand-tries"].tries++;
								settings["bancommand-tries"]["total-tries"]++;
								//Write to file
								fs.writeFileSync('./configure.json', JSON.stringify(settings));

								//Send message
								return channel.send(new Discord.MessageEmbed().setDescription(`Your guess is very hot. ${settings["bancommand-tries"].attempted}` +
									` is the first two characters of the ban command!`).setColor('#FFCC00'));
							} else {
								if (settings["bancommand-tries"].tries == 19)
									settings["bancommand-tries"].tries = 0;
								else
									settings["bancommand-tries"].tries++;
								settings["bancommand-tries"]["total-tries"]++;
								//Write to file
								fs.writeFileSync('./configure.json', JSON.stringify(settings));
								return; //No message at 99 tries. Just reset and message again at 20 tries.
							}
						} else {
							return;
						}
					} else {
						return; //Just return. Don't say anything to users that can't guess anyways
					}
				} else {
					//Check if detected 1 character
					if (firstG == firstC) {
						//Check perms
						if (member.hasPermission('KICK_MEMBERS') && member.id != '341134882120138763') {
							//Current attempted length
							if (settings["bancommand-tries"]["current-attempted-length"] < 2) {
								//Reset tries when on a new character
								if (settings["bancommand-tries"]["current-attempted-length"] != 1)
									settings["bancommand-tries"].tries = 0;

								//Check tries is not over 0. Only message if tries is 0. Count up each time. Reset at 20
								if (settings["bancommand-tries"].tries == 0) {
									msg.delete({ timeout: 0 });

									//Save tries
									settings["bancommand-tries"].attempted = firstG;
									settings["bancommand-tries"]["current-attempted-length"] = 1;
									settings["bancommand-tries"].tries++;
									settings["bancommand-tries"]["total-tries"]++;
									//Write to file
									fs.writeFileSync('./configure.json', JSON.stringify(settings));

									//Send message
									return channel.send(new Discord.MessageEmbed().setDescription(`Your guess is very warm. ***${settings["bancommand-tries"].attempted}***` +
										` is the first character of the ban command!`).setColor('#FFCC00'));
								} else {
									if (settings["bancommand-tries"].tries == 19)
										settings["bancommand-tries"].tries = 0;
									else
										settings["bancommand-tries"].tries++;
									settings["bancommand-tries"]["total-tries"]++;
									//Write to file
									fs.writeFileSync('./configure.json', JSON.stringify(settings));
									return; //No message at 19 tries. Just reset and message again at 20 tries.
								}
							} else {
								return;
							}
						} else {
							return; //Just return. Don't say anything to users that can't guess anyways
						}
					} else {
						return; //Just return. Not guessed anything.
					}
				}
			}
		} else {
			return;
		}
	} else {
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