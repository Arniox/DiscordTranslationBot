const googleApiKey = process.env.GOOGLE_API_KEY;

//const { OpusEncoder } = require('@discordjs/opus');
const axios = require('axios');
const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
var Discord = require('discord.js');
var settings = require('./configure.json');
var dataToUse = require('./data-to-use.json');
var tools = require('./extra-functions');
var fs = require('fs');
var googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });

//Initialize Discord bot 
const bot = new Discord.Client();

bot.on('ready', () => {
	//Set activity
	bot.user.setActivity('the ' + settings.prefix + ' prefix', { type: 'WATCHING' });
	console.log('Connected!');
	console.log('Logged in as: ' + bot.user.username + ' - (' + bot.user.id + ')');
	console.log('Prefix: ' + settings.prefix);
});
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
			case 'ping': //Ping the bot - Are you alive
				msg.delete({ timeout: 0 }); //Delete message
				return channel.send(new Discord.MessageEmbed().setDescription('Right back at you! Yes, I am alive. Current uptime is: ' +
					UpTime() + '. Current Prefix is: ' + settings.prefix));
			case 'help': //Help command
				msg.delete({ timeout: 0 }); //Delete message
				if (args.length != 0) {
					var command = args[0].toLowerCase();
					args = args.splice(1);

					//Check which command you want help with
					switch (command) {
						case 'ping':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('The ping command is very simple. It prints out the bot uptime and current server prefix. Just use ' + settings.prefix + 'ping to run this command.')
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'prefix':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('You can use prefix by running ' + settings.prefix + 'prefix to list the current prefix, or ' + settings.prefix + 'prefix change [new prefix] to change the prefix.')
								.addFields(
									{ name: 'Required Permissions: ', value: 'Manage Server' },
									{ name: 'Example: ', value: settings.prefix + 'prefix\n\n' + settings.prefix + 'prefix change =' }
								)
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'when':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('The when command is very simple. It just prints out a random sarcastic comment. Just use ' + settings.prefix + 'when to run this command.')
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'muterole':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('The muterole command allows you to add or remove mute ignored roles to the server database.')
								.addFields(
									{ name: 'Required Permissions: ', value: 'Manage Server' },
									{
										name: 'Command Patterns: ',
										value: settings.prefix + 'muterole [add/remove] [@role]\n' + settings.prefix + 'muterole [remove] {optional: all}'
									},
									{
										name: 'Examples: ',
										value: settings.prefix + 'muterole add ' + guild.roles.cache.random().toString() + '\n\n' +
											settings.prefix + 'muterole remove ' + guild.roles.cache.random().toString() + '\n\n' +
											settings.prefix + 'muterole remove all'
									}
								)
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'muteroles':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('The muteroles command is very simple. It lists out current mute ignored roles. Just use ' + settings.prefix + 'muteroles to run this command.')
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'mute':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('The mute command allows you to server mute everyone in a selected voice channel barring mute ignored roles. This works fine with spaces in the name and is case insensitive.')
								.addFields(
									{ name: 'Command Patterns: ', value: settings.prefix + 'mute [voice channel name]' },
									{
										name: 'Examples: ',
										value: settings.prefix + 'mute ' + guild.channels.cache.filter(i => i.type == 'voice').random().name + '\n\n' +
											settings.prefix + 'mute ' + guild.channels.cache.filter(i => i.type == 'voice').random().name
									}
								)
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'unmute':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('The unmute command allows you to server unmute everyone in a selected voice channel barring mute ignored roles. This works fine with spaces in the name and is case insensitive.')
								.addFields(
									{ name: 'Command Patterns: ', value: settings.prefix + 'unmute [voice channel name]' },
									{
										name: 'Examples: ',
										value: settings.prefix + 'unmute ' + guild.channels.cache.filter(i => i.type == 'voice').random().name + '\n\n' +
											settings.prefix + 'unmute ' + guild.channels.cache.filter(i => i.type == 'voice').random().name
									}
								)
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'listen':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('[WIP] This command is a work in progress. Currently it\'s a bit buggy and can cause bot crashes. It will simply connect the bot to the current voice channel you\'re in.')
								.addFields(
									{
										name: 'Required: ',
										value: 'You must be in a voice channel for this to work.' +
											' If the bot is already listening to a channel, it wont move to a new one. You must ' +
											settings.prefix + 'leave first and then ' + settings.prefix + 'listen for it to listen to your current voice channel.'
									}
								)
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'leave':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('[WIP] This command is a work in progress. Currently it\'s a bit buggy and can cause bot crashes. It will simply disconnect the bot from it\'s current voice channel.')
								.addFields(
									{ name: 'Required: ', value: 'You must be in the same voice channel as the bot for this to work.' }
								)
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'translate':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('[WIP] Currently the command works, but the Regex patterns don\'t do anything. This command allows you to list, add, and remove Regex patterns for the translation to ignore.')
								.addFields(
									{ name: 'Required Permissions: ', value: 'Manage Server (for adding and removing. Everyone else can use list the current patterns).' },
									{
										name: 'Command Patterns: ',
										value: settings.prefix + 'translate [add/remove] [pattern]\n\n' +
											settings.prefix + 'translate -patterns-'
									},
									{
										name: 'Examples: ',
										value: settings.prefix + 'translate add /(<:[A-Za-z]+:\d+>)/gi' + '\n\n' +
											settings.prefix + 'translate remove /(<:[A-Za-z]+:\d+>)/gi' + '\n\n' +
											settings.prefix + 'translate patterns'
									}
								)
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'nick':
							//Get all available language codes
							googleTranslate.getSupportedLanguages(function (err, languageCodes) {
								var embeddedHelpMessage = new Discord.MessageEmbed()
									.setColor('#0099ff')
									.setAuthor(bot.user.username, bot.user.avatarURL())
									.setDescription('Nick allows you to translate either you\'re own nickname into any supported language, or everyone\'s granted you have management permissions.')
									.addFields(
										{ name: 'Required Permissions: ', value: 'Manage Server (for translating eveyone\'s nickname).' },
										{
											name: 'Command Patterns: ',
											value: settings.prefix + 'nick [me/all] [language code]'
										},
										{
											name: 'Examples: ',
											value: settings.prefix + 'nick me RU' + '\n\n' +
												settings.prefix + 'nick me DE' + '\n\n' +
												settings.prefix + 'nick all HE'
										},
										{
											name: 'Available Language Codes: ',
											value: languageCodes.join(', ') + ''
										}
									)
									.setTimestamp()
									.setFooter('Thanks, and have a good day');

								//Send embedded message
								channel
									.send(embeddedHelpMessage)
									.catch(error => { console.log('Error. Ignored') });
							});
							return;
						case 'prykie':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('The prykie command allows you to list, add, remove or print out a random prykie quote. Removing a quote needs server management permissions.')
								.addFields(
									{ name: 'Required Permissions: ', value: 'Just for removing quotes; Manage Server is needed.' },
									{
										name: 'Command Patterns: ',
										value: settings.prefix + 'prykie\n\n' +
											settings.prefix + 'prykie [add/remove] [quote]\n\n' +
											settings.prefix + 'prykie -list-'
									},
									{
										name: 'Examples: ',
										value: settings.prefix + 'prykie\n\n' +
											settings.prefix + 'prykie add I love massive black cocks!\n\n' +
											settings.prefix + 'prykie remove I love massive black cocks!\n\n' +
											settings.prefix + 'prykie list'
									}
								)
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'move':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('Use selectors to move people in voice channels to other voice channels. This command has a lot of different options. It works fine with spaces in the name and is case insensitive.')
								.addFields(
									{ name: 'Required Permissions: ', value: 'Move Members' },
									{
										name: 'Command Patterns: ',
										value: settings.prefix + 'move [Selector] [Split/Direct command prefix] [Channel(s)]\n\n' +
											settings.prefix + 'move [Selector] - [Channel]\n\n' +
											settings.prefix + 'move [Selector] = [Channel] & [Channel] & [Channel]'
									},
									{
										name: 'Examples: ',
										value: settings.prefix + 'move ' + guild.channels.cache.filter(i => i.type == 'voice').random().name + ' - ' + guild.channels.cache.filter(i => i.type == 'voice').random().name +
											' (Move everyone in one voice channel to another voice channel)\n\n' +
											settings.prefix + 'move * - ' + guild.channels.cache.filter(i => i.type == 'voice').random().name + ' (Move everyone currently in any voice channel to a specific voice channel)\n\n' +
											settings.prefix + 'move 5 > ' + guild.channels.cache.filter(i => i.type == 'voice').random().name + ' - ' + guild.channels.cache.filter(i => i.type == 'voice').random().name +
											' (Move 5 randomly picked players from one voice channel to another voice channel)\n\n' +
											settings.prefix + 'move ' + guild.channels.cache.filter(i => i.type == 'voice').random().name + ' = ' + guild.channels.cache.filter(i => i.type == 'voice').random().name + ' & ' +
											guild.channels.cache.filter(i => i.type == 'voice').random().name + ' (Equally split everyone in one voice channel into any number of voice channels seperated by &)\n\n' +
											settings.prefix + 'move * = ' + guild.channels.cache.filter(i => i.type == 'voice').random().name + ' & ' + guild.channels.cache.filter(i => i.type == 'voice').random().name +
											' (Split everyone currently in any voice channel into any number of voice channels seperated by &)\n\n' +
											settings.prefix + 'move 5 > ' + guild.channels.cache.filter(i => i.type == 'voice').random().name + ' = ' + guild.channels.cache.filter(i => i.type == 'voice').random().name + ' & ' +
											guild.channels.cache.filter(i => i.type == 'voice').random().name + ' (Equally split 5 randomly picked players from one voice channel into any number of voice channels seperated by &).'
									}
								)
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						case 'f10':
							var embeddedHelpMessage = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(bot.user.username, bot.user.avatarURL())
								.setDescription('This command is a meme. It will instantly ban Prykie and only Prykie. After banning, it will instantly unban and then send a reinvite to the server in a dm.')
								.addFields(
									{ name: 'Required Permissions: ', value: 'Kick Members (for banning other players, you will need Administrative permissions' },
									{ name: 'Info: ', value: 'This is the only command that does not require a prefix. It can just be run with f10 by itself in chat.' },
									{
										name: 'Command Patterns: ',
										value: 'f10\n\nf10 [@mention @mention @mention]'
									},
									{
										name: 'Examples: ',
										value: 'f10\n\nf10 ' + guild.members.cache.random().toString() + guild.members.cache.random().toString()
									}
								)
								.setTimestamp()
								.setFooter('Thanks, and have a good day');

							//Send embedded message
							return channel.send(embeddedHelpMessage);
						default:
							return channel.send(new Discord.MessageEmbed().setDescription('Sorry, ' + command + ' is not a command I can help you with.'));
					}

				} else {
					//All help
					var embeddedHelpMessage = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setAuthor(bot.user.username, bot.user.avatarURL())
						.setDescription('You asked for help? Well here it is. The following commands can be used. You can use *' + settings.prefix + 'help [command]* to view more settings on the command')
						.addFields({
							name: settings.prefix + 'ping',
							value: 'Ping allows you to see the current uptime and current prefix of the server and double checks that the bot is running.'
						}, {
							name: settings.prefix + 'prefix',
							value: 'Prefix allows you to view and edit the prefix of the server granted you have management permissions.'
						}, {
							name: settings.prefix + 'when',
							value: 'Will post a randomly chosen sarcastic quote.'
						}, {
							name: settings.prefix + 'muterole',
							value: 'Muterole allows you to add, remove (all or some) roles to a list that is ignored by the mute command, granted you have management permissions.'
						}, {
							name: settings.prefix + 'muteroles',
							value: 'Lists out the current mute ignored roles.'
						}, {
							name: settings.prefix + 'mute',
							value: 'Mute a voice channel but ignore the mute ignored roles, granted you have mute members permissions.'
						}, {
							name: settings.prefix + 'unmute',
							value: 'Unmute a voice channel completely. This command wont ignore mute ignored roles. So everyone in the voice channel will be server unmuted, granted you have mute members permissions.'
						}, {
							name: settings.prefix + 'listen',
							value: '[WIP] Currently this command wont do much. It\'ll simply connect the bot to your current voice channel.'
						}, {
							name: settings.prefix + 'leave',
							value: '[WIP] Currently this command wont do much. It\'ll simply disconnect the bot from it\'s current voice channel.'
						}, {
							name: settings.prefix + 'translate',
							value: 'List, add or remove translation ignored patterns to the database for your server. Adding or removing needs the management permissions.'
						}, {
							name: settings.prefix + 'nick',
							value: 'Translate your nickname into a specified language code. Use ' + settings.prefix + 'help nick to see all the available language codes.'
						}, {
							name: settings.prefix + 'prykie',
							value: 'Used on it\'s own, it will post a random prykie quote. Otherwise, you can list, add or remove prykie quotes. Removing quotes needs the management permissions.'
						}, {
							name: settings.prefix + 'move',
							value: 'Use a selector to move players from voice channels to voice channels all at once. Easy way to move players around, granted you have move member permissions.'
						}, {
							name: 'f10',
							value: 'Instantly ban, unban and reinvite Prykie from the server, granted you have kick member permissions.',
							inline: true
						}, {
							name: 'f10 [@mention @mention @mention ....]',
							value: 'Instantly ban, unban and reinvite any mentioned players, granted you have administrator permissions.',
							inline: true
						}, {
							name: 'Other Features',
							value: bot.user.username + ' will automatically read all messages sent in any chat and detect message languages. If the bot has over 75% confidence that the language is not english, it will replace your message with an English translated version.'
						})
						.setTimestamp()
						.setFooter('Thanks, and have a good day');

					//Send embedded message
					return channel.send(embeddedHelpMessage);
				}
			case 'prefix': //Prefix options
				msg.delete({ timeout: 0 }); //Delete message
				if (args.length != 0) {
					var option = args[0].toLowerCase();
					args = args.splice(1);

					//Check which option you want
					switch (option) {
						case 'change': //Change bot prefix
							if (member.hasPermission('MANAGE_GUILD')) {
								var query = args[0];
								args = args.splice(1);

								//Check if the query exists
								if (query) {
									var previousPrefix = settings.prefix;

									//Change prefix
									settings.prefix = query;
									//Write to file
									fs.writeFileSync('./configure.json', JSON.stringify(settings));
									bot.user.setActivity('the ' + settings.prefix + ' prefix', { type: 'WATCHING' });
									//Message
									return channel.send(new Discord.MessageEmbed().setDescription('Changed Prefix from: ' + previousPrefix + ' to: ' + settings.prefix));
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('Sorry, I cannot change your prefix to nothing!'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to change the server prefix.'));
							}
						default: //Error on prefix command
							return channel.send(new Discord.MessageEmbed().setDescription('What do you want to change sorry?'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Current Bot Prefix is: ' + settings.prefix));
				}
			case 'when': //When did I ask
				msg.delete({ timeout: 0 }); //Delete message
				var findRandom = dataToUse.quotes[Math.floor(tools.siteRand(dataToUse.quotes.length - 1, 0))];
				//Message
				return channel.send(findRandom);
			case 'muterole': //Add something to the settings
				var roles = msg.mentions.roles;
				msg.delete({ timeout: 0 }); //Delete message
				if (member.hasPermission('MANAGE_GUILD')) {
					if (args.length != 0) {
						var direction = args[0].toLowerCase();
						args = args.splice(1);

						//Check which direction you want the role to go
						switch (direction) {
							case 'add':
								if (roles.size != 0) {
									//Save roles id
									roles.map((value, key) => {
										if (settings.muteroles.filter(e => e === key).length != 0) {
											return channel.send(new Discord.MessageEmbed().setDescription(value.toString() + ' is *already* a mute ignored role.'));
										} else {
											settings.muteroles.push(key);
											//Write to file
											fs.writeFileSync('./configure.json', JSON.stringify(settings));
											//Message
											return channel.send(new Discord.MessageEmbed().setDescription('Added: ' + value.toString() + ' to mute ignored roles'));
										}
									});
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('I did not detect any roles to add/remove...'));
								}
								break;
							case 'remove':
								if (roles.size != 0) {
									//Save roles id
									roles.map((value, key) => {
										if (settings.muteroles.filter(e => e === key).length == 0) {
											channel.send(new Discord.MessageEmbed().setDescription(value.toString() + ' is *not* a mute ignored role.'));
										} else {
											settings.muteroles = settings.muteroles.filter(e => e !== key);
											//Write to file
											fs.writeFileSync('./configure.json', JSON.stringify(settings));
											//Message
											return channel.send(new Discord.MessageEmbed().setDescription('Removed: ' + value.toString() + ' from mute ignored roles'));
										}
									});
								} else {
									if (args.length != 0) {
										var isAll = args[0].toLowerCase();
										args = args.splice(1);

										//Check if the user wants to remove all roles
										switch (isAll) {
											case 'all':
												settings.muteroles = [];
												//Write to file
												fs.writeFileSync('./configure.json', JSON.stringify(settings));
												//Message
												return channel.send(new Discord.MessageEmbed().setDescription('Removed all roles from mute ignored roles'));
											default:
												return channel.send(new Discord.MessageEmbed().setDescription('I\'m afraid I don\'t understand the command...'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('I did not detect a roles to add/remove...'));
									}
								}
								break;
							default:
								return channel.send(new Discord.MessageEmbed().setDescription('Do you want to add a mute ignored role, or remove a mute ignored role?'));
						}
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('I am confused by this command?'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot add or remove mute ignored roles. You need to be a server manager/admin to use these commands.'));
				}
				break;
			case 'muteroles': //List out the mute ignored roles
				msg.delete({ timeout: 0 }); //Delete message
				var output = "";
				settings.muteroles.forEach(e => {
					output = output + guild.roles.cache.find(i => i.id = e).toString() + '\n';
				});
				return channel.send(new Discord.MessageEmbed().setDescription(settings.muteroles.length + ' mute ignored roles.\n' + output));
			case 'mute': //mute channel and ignore mute roles
				msg.delete({ timeout: 0 }); //Delete message
				if (member.hasPermission('MUTE_MEMBERS')) {
					if (args.length != 0) {
						var voiceChannel = args.join(' ');
						args = args.splice(1);

						//Channel name, find the voice channel
						var channelToMute = guild.channels.cache.find(i => i.name.toLowerCase() == voiceChannel.toLowerCase() && i.type == 'voice');
						if (channelToMute) {
							//Grab all players in this voice that aren't ignored
							var playersFoundInVoice = guild.members.cache.filter(i => i.voice.channelID == channelToMute.id && !i._roles.some(r => settings.muteroles.includes(r)));

							//Mute everyone that we found
							playersFoundInVoice.map((value, key) => {
								value.voice.setMute(true);
							});

							return channel.send(new Discord.MessageEmbed().setDescription('Found ' + playersFoundInVoice.size + ' players in ' + channelToMute.toString() + '... muting now...'));
						} else {
							return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + voiceChannel));
						}
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to mute.'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need muting permissions to run this command.'));
				}
			case 'unmute': //Unmute everyone in a voice chat
				msg.delete({ timeout: 0 }); //Delete message
				if (member.hasPermission('MUTE_MEMBERS')) {
					if (args.length != 0) {
						var voiceChannel = args.join(' ');
						args = args.splice(1);

						//Channel name, find the voice channel
						var channelToMute = guild.channels.cache.find(i => i.name.toLowerCase() == voiceChannel.toLowerCase() && i.type == 'voice');
						if (channelToMute) {
							//Grab all players in this voice
							var playersFoundInVoice = guild.members.cache.filter(i => i.voice.channelID == channelToMute.id);

							//Unmute everyone that we found
							playersFoundInVoice.map((value, key) => {
								value.voice.setMute(false);
							});

							return channel.send(new Discord.MessageEmbed().setDescription('Found ' + playersFoundInVoice.size + ' players in ' + channelToMute.toString() + '... unmuting now...'));
						} else {
							return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + voiceChannel));
						}
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to unmute.'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need muting permissions to run this command.'));
				}
			case 'listen': //Join voice chat
				//Grab member voice channel
				var voiceChannel = member.voice.channel;
				var botVoice = guild.members.cache.find(i => i.id == bot.user.id).voice.channel;
				//If you are not in a voice
				if (!voiceChannel) {
					msg.delete({ timeout: 0 }); //Delete message
					return channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first!'));
				} else {
					//Check how many users in channel
					var membersInVoice = guild.members.cache.filter(i => i.voice.channelID == voiceChannel.id && i.user.bot != true);
					//If there are no members in that voice channel
					if (membersInVoice.size == 0) {
						msg.delete({ timeout: 0 }); //Delete message
						return channel.send(new Discord.MessageEmbed().setDescription('I have found no one in ' + voiceChannel.toString() + ' so I didn\'t join it.'));
					} else {
						if (!botVoice) {
							//Mute bot
							guild.members.cache.find(i => i.id == bot.user.id).voice.setMute(true);
							//Join voice channel
							voiceChannel.join().then(connection => {
								msg.delete({ timeout: 0 }); //Delete message

								//For everyuser in the channel
								membersInVoice.map((value, key) => {
									//Create audio stream
									//var audioStream = connection.receiver.createStream(key);
									//connection.play(audioStream, { type: 'opus' });
								});

								return channel.send(new Discord.MessageEmbed().setDescription('Now listening to ' + voiceChannel.toString()));
							}).catch(error => {
								return channel.send(new Discord.MessageEmbed().setDescription('For some reason, I have failed to join this channel. Please try again later or contact the bot developer'))
							});
						} else {
							if (botVoice == voiceChannel) {
								msg.delete({ timeout: 0 }); //Delete message
								return channel.send(new Discord.MessageEmbed().setDescription('I am already listening to your channel. I can\'t be anywhere else!'));
							} else {
								msg.delete({ timeout: 0 }); //Delete message
								return channel.send(new Discord.MessageEmbed().setDescription('I am currently busy listening to ' + botVoice.toString() + '. Ask me later on when I am no longer busy.'));
							}
						}
					}
				}
				break;
			case 'leave': //Leave voice chat
				msg.delete({ timeout: 0 }); //Delete message

				//Grab bot voice channel
				var memberVoice = member.voice.channel;
				var botVoice = guild.members.cache.find(i => i.id == bot.user.id).voice.channel;

				//If bot is not in voice
				if (!memberVoice) {
					return channel.send(new Discord.MessageEmbed().setDescription('You can only execute this command if you are in a voice channel and share the same voice channel as the bot!'));
				} else {
					if (!botVoice) {
						return channel.send(new Discord.MessageEmbed().setDescription('I am not in a voice channel sorry.'));
					} else {
						//If member and bot are not in the same voice
						if (memberVoice !== botVoice) {
							return channel.send(new Discord.MessageEmbed().setDescription('You can only execute this command if you share the same voice channel as the bot!'));
						} else {
							channel.send(new Discord.MessageEmbed().setDescription('I have stopped listening to ' + botVoice.toString()));
							guild.members.cache.find(i => i.id == bot.user.id).voice.setMute(false);
							return botVoice.leave();
						}
					}
				}
			case 'translate': //Translate commands for ignored patterns
				msg.delete({ timeout: 0 }); //Delete message

				if (args.length != 0) {
					var option = args[0].toLowerCase();
					args = args.splice(1);

					//Check which option you want
					switch (option) {
						case 'add': //Add a pattern
							//Check if has perms
							if (member.hasPermission('MANAGE_GUILD')) {
								var query = args[0];
								args = args.splice(1);

								//Check if query exists
								if (query) {
									//Add pattern
									settings["translate-ignored-patterns"].push(query);
									//Write to file
									fs.writeFileSync('./configure.json', JSON.stringify(settings));
									//Message
									return channel.send(new Discord.MessageEmbed().setDescription('Add new pattern to translation ignored patterns: ' + query));
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('I did not see any pattern to add sorry.'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to add or remove translation ignore patterns.'));
							}
						case 'remove': //Remove specific pattern
							//Check if has perms
							if (member.hasPermission('MANAGE_GUILD')) {
								var query = args[0];
								args = args.splice(1);

								//Check if query exists
								if (query) {
									//Find existing
									var existingPattern = settings["translate-ignored-patterns"].find(i => i === query);
									if (existingPattern) {
										//Remove pattern
										settings["translate-ignored-patterns"] = settings["translate-ignored-patterns"].filter(i => i !== query);
										//Write to file
										fs.writeFileSync('./configure.json', JSON.stringify(settings));
										//Message
										return channel.send(new Discord.MessageEmbed().setDescription('Removed ' + query + ' from the translation ignored patterns.'));
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription(query + ' already doesn\'t exist in the database.'));
									}
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('I did not see any pattern to remove sorry.'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to add or remove translation ignore patterns.'));
							}
						case 'patterns': //List out current patterns
							var output = "";
							settings["translate-ignored-patterns"].forEach(e => {
								output = output + '`' + e.toString() + '`\n';
							});
							return channel.send(new Discord.MessageEmbed().setDescription(settings["translate-ignored-patterns"].length + ' translation ignored patterns.\n' + output));
						default:
							return channel.send(new Discord.MessageEmbed().setDescription('Did you want to add or remove a translation pattern?'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('What are you trying to do?'));
				}
			case 'nick':
				msg.delete({ timeout: 0 }); //Delete the message

				//If no option was selected
				if (args.length != 0) {
					//Get option
					var option = args[0].toLowerCase();
					args = args.splice(1);

					//Check which option you want
					switch (option) {
						case 'all':
							if (member.hasPermission('MANAGE_GUILD')) {
								var query = args[0];
								args = args.splice(1);

								//Check if query exists
								if (query) {
									//Check if selected code exists in the supported languages
									googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
										if (languageCodes.find(i => i.language == query.toLowerCase())) {
											//For all members in the guild
											guild.members.cache.map((value, key) => {
												//Get current user nickname.
												var currentUserNickName = (value.nickname ? value.nickname : value.user.username);

												//Translate
												googleTranslate.translate(currentUserNickName, query, function (err, translation) {
													//Change name
													value
														.setNickname(translation.translatedText, 'Translating name from ' + currentUserNickName + ' to ' +
															translation.translatedText + ' in ' + languageCodes.find(i => i.language == query.toLowerCase()).name)
														.catch(error => {
															channel.send(new Discord.MessageEmbed().setDescription(error.toString().split(':')[1] + '. I cannot translate ' + value.toString() + ' nickname.'));
														});
												});
											});
											//Message
											channel.send(new Discord.MessageEmbed().setDescription('I have finished translating ' + guild.members.cache.size() +
												' player\'s nickname\'s into ' + languageCodes.find(i => i.language == query.toLowerCase()).name));
										} else {
											channel.send(new Discord.MessageEmbed().setDescription('Unfortunately, my translation capabilities do not support ' + query + ' as a language.'));
										}
									});
									return;
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('Sorry, what language code did you want to use to translate everyone\'s name to?'))
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need management perms to run this command.'));
							}
						case 'me':
							var query = args[0];
							args = args.splice(1);

							//Check if query exists
							if (query) {
								//Check if selected code exists in the supported languages
								googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
									if (languageCodes.find(i => i.language == query.toLowerCase())) {
										//Get current member nickname.
										var currentUserNickName = (value.nickname ? value.nickname : value.user.username);

										//Translate name
										googleTranslate.translate(currentUserNickName, query, function (err, translation) {
											//Change name
											member
												.setNickname(translation.translatedText, 'Translating name from ' + currentUserNickName + ' to ' +
													translation.translatedText + ' in ' + languageCodes.find(i => i.language == query.toLowerCase()).name)
												.then(() => {
													channel.send(new Discord.MessageEmbed().setDescription('I have translated your nickname from ' + currentUserNickName + ' to ' +
														translation.translatedText + ' in ' + languageCodes.find(i => i.language == query.toLowerCase()).name));
												})
												.catch(error => {
													channel.send(new Discord.MessageEmbed().setDescription(error.toString().split(':')[1] + ', I cannot translate your nickname ' + member.toString() + '.'));
												});
											return;
										});
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('Unfortunately, my translation capabilities do not support ' + query + ' as a language.'));
									}
								});
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, what language code did you want to use to translate your name to?'));
							}
							break;
						default:
							return channel.send(new Discord.MessageEmbed().setDescription('Sorry, did you want to change your own nickname or everyone?'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, what option did you want?'));
				}
				break;
			case 'prykie': //Prykie commands
				msg.delete({ timeout: 0 }); //Delete the message

				//If no option was selected
				if (args.length != 0) {
					//Get option
					var option = args[0].toLowerCase();
					args = args.splice(1);

					//Check which option you want
					switch (option) {
						case 'add': //Add prykie quote
							var query = args.join(' ');

							//Check if query exists
							if (query) {
								//Check if already existing
								if (!dataToUse["prykie-quotes"].find(i => i === query)) {
									//Add quote
									dataToUse["prykie-quotes"].push(query);
									//Write to file
									fs.writeFileSync('./data-to-use.json', JSON.stringify(dataToUse));
									//Message
									return channel.send(new Discord.MessageEmbed().setDescription('Added ' + query + ' to the data base.'));
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription(query + ' already exists in the data base. You can use `' + settings.prefix + 'prykie list` to view the current list of Prykie quotes.'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t write any Prykie quote to add.'));
							}
						case 'remove': //Remove prykie quote
							if (member.hasPermission('MANAGE_GUILD')) {
								var query = args.join(' ');

								//Check if query exists
								if (query) {
									//Find existing
									if (parseInt(query) >= dataToUse["prykie-quotes"].length) {
										var existingQuote = dataToUse["prykie-quotes"][parseInt(query)];
										if (existingQuote) {
											//Remove quote
											dataToUse["prykie-quotes"] = dataToUse["prykie-quotes"].splice(parseInt(query), 1);
											//Write to file
											fs.writeFileSync('./data-to-use.json', JSON.stringify(dataToUse));
											//Message
											return channel.send(new Discord.MessageEmbed().setDescription('Removed `' + existingQuote + '` from the data base.'));
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription('I couldn\'t find this quote for some reason...'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('The ' + tools.ordinal(parseInt(query)) + ' quote does not exist sorry.'));
									}
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select a quote number to remove. You can use `' + settings.prefix + 'prykie list` to view the current list of Prykie quotes.'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to remove a prykie quote.'));
							}
						case 'list': //List all prykie quotes
							var output = "";
							for (var i = 0; i < dataToUse["prykie-quotes"].length; ++i) {
								output = output + i + ' - `' + dataToUse["prykie-quotes"][i] + '`\n';
							}
							return channel.send(new Discord.MessageEmbed().setDescription(dataToUse["prykie-quotes"].length + ' prykie quotes.\n' + output));
						default:
							return channel.send(new Discord.MessageEmbed().setDescription('Did you want to list all/add/remove a prykie quote?'));
					}
				} else { //Set random prykie quote
					msg.delete({ timeout: 0 }); //Delete message
					if (dataToUse["prykie-quotes"].length != 0) {
						var findRandom = dataToUse["prykie-quotes"][Math.floor(tools.siteRand(dataToUse["prykie-quotes"].length - 1, 0))];
						//Message
						return channel.send(findRandom);
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('Sorry, I didn\'t find any prykie quotes to use :('));
					}
				}
			case 'move': //Move everyone from one voice channel to another channel
				msg.delete({ timeout: 0 });
				if (member.hasPermission('MOVE_MEMBERS')) {
					if (args.length != 0) {

						//If the length of the array is over 1, then it's a direct channel - channel
						if (args.join(' ').split('-').length > 1) {
							//Grab new array
							args = args.join(' ').split('-').map(i => i.trim());
							var selector = args[0];
							args = args.splice(1);

							//If complex selector
							if (selector.split('>').length > 1) {
								//Grab complex selector
								var complexSelector = selector.split('>').map(i => i.trim());
								var numberSelector = complexSelector[0];
								complexSelector = complexSelector.splice(1);

								//Check if numberSelector is actually a number
								if (/^\d+$/.test(numberSelector)) {
									//Grab number from string
									var numberOfPlayers = parseInt(numberSelector);
									if (complexSelector.length != 0) {
										//Grab channel selector
										var channelSelector = complexSelector[0];
										complexSelector = complexSelector.splice(1);

										//Channel name, find the voice channel
										var voiceChannelFROM = guild.channels.cache.find(i => i.name.toLowerCase() == channelSelector.toLowerCase() && i.type == 'voice');
										if (voiceChannelFROM) {
											//Grab number of players in this voice
											var playersFoundInVoice = guild.members.cache.filter(i => i.voice.channelID == voiceChannelFROM.id).map((value, key) => value).sort(() => Math.random() - Math.random()).slice(0, numberOfPlayers);

											if (playersFoundInVoice.length != 0) {
												//Check that there's a channel to move to
												if (args.length != 0) {
													var channelToSelector = args[0];
													args = args.splice(1);

													//Get the voice channel to move to with the channel selector as name
													var voiceChannelTO = guild.channels.cache.find(i => i.name.toLowerCase() == channelToSelector.toLowerCase() && i.type == 'voice');
													if (voiceChannelTO) {
														//Move players from voiceChannelFROM to voiceChannelTO
														playersFoundInVoice.forEach(e => {
															e.voice.setChannel(voiceChannelTO)
														});
														//Message
														return channel.send(new Discord.MessageEmbed().setDescription('Moved `' + playersFoundInVoice.length + ' / ' + numberOfPlayers + '` randomly selected players from ' + voiceChannelFROM.toString() + ' to ' + voiceChannelTO.toString()));
													} else {
														return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + channelToSelector));
													}
												} else {
													return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to move ' + playersFoundInVoice.length + ' players to.'));
												}
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription('There\'s no one in ' + voiceChannelFROM.toString() + ' to move sorry.'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + channelSelector));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to move players from.'));
									}
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('Sorry, ' + numberSelector + ' is not a number of players I can operate on.'));
								}
							}//If simple selector
							else {
								//If selecting all or channel
								if (selector == '*') {
									//Grab every player
									var playersFoundAll = guild.members.cache.filter(i => i.voice.channel);

									if (playersFoundAll.size != 0) {
										//Check that there's a channel to move to
										if (args.length != 0) {
											var channelSelector = args[0];
											args = args.splice(1);

											//Get voice channel to move to with the channel selector as name
											var voiceChannelTO = guild.channels.cache.find(i => i.name.toLowerCase() == channelSelector.toLowerCase() && i.type == 'voice');
											if (voiceChannelTO) {
												//Move all the players found everywhere to voiceChannelTO
												playersFoundAll.map((value, key) => {
													value.voice.setChannel(voiceChannelTO);
												});
												//Message
												return channel.send(new Discord.MessageEmbed().setDescription('Moved ' + playersFoundAll.size + ' players to ' + voiceChannelTO.toString()));
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + channelSelector));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to move ' + playersFoundAll.size + ' players to.'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('There\'s no one at all currently in a voice channel for this server.'));
									}
								} else {
									//Channel name, find the voice channel
									var voiceChannelFROM = guild.channels.cache.find(i => i.name.toLowerCase() == selector.toLowerCase() && i.type == 'voice');
									if (voiceChannelFROM) {
										//Grab all players in this voice
										var playersFoundInVoice = guild.members.cache.filter(i => i.voice.channelID == voiceChannelFROM.id);
										if (playersFoundInVoice.size != 0) {
											//Check that there's a channel to move to
											if (args.length != 0) {
												var channelSelector = args[0];
												args = args.splice(1);

												//Get the voice channel to move to with the channel selector as name
												var voiceChannelTO = guild.channels.cache.find(i => i.name.toLowerCase() == channelSelector.toLowerCase() && i.type == 'voice');
												if (voiceChannelTO) {
													//Move players from voiceChannelFROM to voiceChannelTO
													playersFoundInVoice.map((value, key) => {
														value.voice.setChannel(voiceChannelTO);
													});
													//Message
													return channel.send(new Discord.MessageEmbed().setDescription('Moved ' + playersFoundInVoice.size + ' players from ' + voiceChannelFROM.toString() + ' to ' + voiceChannelTO.toString()));
												} else {
													return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + channelSelector));
												}
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to move ' + playersFoundInVoice.size + ' players to.'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription('There\'s no one in ' + voiceChannelFROM.toString() + ' to move sorry.'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + selector));
									}
								}
							}
						} //If the length of the array is over 1, then it's a split channel = channel & channel
						else if (args.join(' ').split('=').length > 1) {
							//Grab new array
							args = args.join(' ').split('=').map(i => i.trim());
							var selector = args[0];
							args = args.splice(1);

							//If complex selector
							if (selector.split('>').length > 1) {
								//Grab complex selector
								var complexSelector = selector.split('>').map(i => i.trim());
								var numberSelector = complexSelector[0];
								complexSelector = complexSelector.splice(1);

								//Check if numberSelector is actually a number
								if (/^\d+$/.test(numberSelector)) {
									//Grab number from string
									var numberOfPlayers = parseInt(numberSelector);
									if (complexSelector.length != 0) {
										//Grab channel selector
										var channelSelector = complexSelector[0];
										complexSelector = complexSelector.splice(1);

										//Channel name, find the voice channel
										var voiceChannelFROM = guild.channels.cache.find(i => i.name.toLowerCase() == channelSelector.toLowerCase() && i.type == 'voice');
										if (voiceChannelFROM) {
											//Grab number of players in this voice
											var playersFoundInVoice = guild.members.cache.filter(i => i.voice.channelID == voiceChannelFROM.id).map((value, key) => value).sort(() => Math.random() - Math.random()).slice(0, numberOfPlayers);
											if (playersFoundInVoice.length != 0) {
												//Check if there's channels to move to
												if (args.length != 0) {
													var channelSelectors = args[0].split('&').map(i => i.trim());
													var selectorSize = channelSelectors.length;
													args = args.splice(1);

													var countOfMovedPlayers = 0
													//For each channel
													channelSelectors.forEach(e => {
														//Get voice channel to move to with the channel selector (e) as name
														var voiceChannelTO = guild.channels.cache.find(i => i.name.toLowerCase() == e.toLowerCase() && i.type == 'voice');
														if (voiceChannelTO) {
															//Get a number of players randomly
															var playersToMoveInVoice = playersFoundInVoice.sort(() => Math.random() - Math.random()).slice(0, (Math.ceil(playersFoundInVoice.length / selectorSize)));
															if (playersToMoveInVoice) {
																playersToMoveInVoice.forEach(e => {
																	e.voice.setChannel(voiceChannelTO);
																});
																//Added counts
																countOfMovedPlayers += playersToMoveInVoice.length;
																//Remove already moved players
																playersFoundInVoice = playersFoundInVoice.filter((value, key) => !playersToMoveInVoice.includes(value));
															} //Ignore broken players
														} else {
															return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + e));
														}
													});
													return channel.send(new Discord.MessageEmbed().setDescription('Split `' + countOfMovedPlayers + ' / ' + numberOfPlayers + '` players out into ' + channelSelectors.join(', and ')));
												} else {
													return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channels to split ' + playersFoundInVoice.length + ' players into.'));
												}
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription('There\'s no one in ' + voiceChannelFROM.toString() + ' to move sorry.'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + channelSelector));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to move players from.'));
									}
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('Sorry, ' + numberSelector + ' is not a number of players I can operate on.'));
								}
							} //If simple selector
							else {
								//If seleting all or channel
								if (selector == '*') {
									//Grab every player
									var playersFoundAll = guild.members.cache.filter(i => i.voice.channel);
									if (playersFoundAll.size != 0) {
										//Check there's channels to move to
										if (args.length != 0) {
											var channelSelectors = args[0].split('&').map(i => i.trim());
											var selectorSize = channelSelectors.length;
											args = args.splice(1);

											var countOfMovedPlayers = 0
											//For each channel
											channelSelectors.forEach(e => {
												//Get voice channel to move to with the channel selector (e) as name
												var voiceChannelTO = guild.channels.cache.find(i => i.name.toLowerCase() == e.toLowerCase() && i.type == 'voice');
												if (voiceChannelTO) {
													//Get a number of players randomly
													var playersToMoveAll = playersFoundAll.map((value, key) => value).sort(() => Math.random() - Math.random()).slice(0, (Math.ceil(playersFoundAll.size / selectorSize)));
													if (playersToMoveAll) {
														playersToMoveAll.forEach(e => {
															e.voice.setChannel(voiceChannelTO);
														});
														//Added counts
														countOfMovedPlayers += playersToMoveInVoice.length;
														//Remove already moved players
														playersFoundAll = playersFoundAll.filter((value, key) => !playersToMoveAll.includes(value));
													} //Ignore broken players
												} else {
													return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + e));
												}
											});
											return channel.send(new Discord.MessageEmbed().setDescription('Split ' + countOfMovedPlayers + ' players out into ' + channelSelectors.join(', and ')));
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channels to split ' + playersFoundAll.size + ' players into.'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('There\'s no one at all currently in a voice channel for this server.'));
									}
								} else {
									//Channel name, find the voice channel
									var voiceChannelFROM = guild.channels.cache.find(i => i.name.toLowerCase() == selector.toLowerCase() && i.type == 'voice');
									if (voiceChannelFROM) {
										//Grab all players in this voice
										var playersFoundInVoice = guild.members.cache.filter(i => i.voice.channelID == voiceChannelFROM.id);
										if (playersFoundInVoice.size != 0) {
											//Check if there's channels to move to
											if (args.length != 0) {
												var channelSelectors = args[0].split('&').map(i => i.trim());
												var selectorSize = channelSelectors.length;
												args = args.splice(1);

												var countOfMovedPlayers = 0
												//For each channel
												channelSelectors.forEach(e => {
													//Get voice channel to move to with the channel selector (e) as name
													var voiceChannelTO = guild.channels.cache.find(i => i.name.toLowerCase() == e.toLowerCase() && i.type == 'voice');
													if (voiceChannelTO) {
														//Get a number of players randomly
														var playersToMoveInVoice = playersFoundInVoice.map((value, key) => value).sort(() => Math.random() - Math.random()).slice(0, (Math.ceil(playersFoundInVoice.size / selectorSize)));
														if (playersToMoveInVoice) {
															playersToMoveInVoice.forEach(e => {
																e.voice.setChannel(voiceChannelTO);
															});
															//Added counts
															countOfMovedPlayers += playersToMoveInVoice.length;
															//Remove already moved players
															playersFoundInVoice = playersFoundInVoice.filter((value, key) => !playersToMoveInVoice.includes(value));
														} //Ignore broken players
													} else {
														return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + e));
													}
												});
												return channel.send(new Discord.MessageEmbed().setDescription('Split ' + countOfMovedPlayers + ' players out into ' + channelSelectors.join(', and ')));
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channels to split ' + playersFoundInVoice.size + ' players into.'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription('There\'s no one in ' + voiceChannelFROM.toString() + ' to move sorry.'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + selector));
									}
								}
							}
						} else {
							return channel.send(new Discord.MessageEmbed().setDescription('Sorry, I do not understand ' + msgContent + '. You can either move a *[select]* to one [channel] with - or a *[selector]* split to multiple channels with ='));
						}
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you didn\'t use any selector. I could not understand ' + msgContent));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need moving powers to run this command.'));
				}
			default: //Error
				return channel.send(new Discord.MessageEmbed().setDescription('Sorry, I do not understand that command...'));
		}
	} else if (msgContent.startsWith('f10') || msgContent.startsWith('F10')) {
		var mentions = msg.mentions.users; //Get all mentions
		msg.delete({ timeout: 0, reason: 'SHHHHHH!!' }); //Delete message

		if (mentions.size != 0) {
			if (member.hasPermission('ADMINISTRATOR')) {
				mentions.map((value, key) => { //For each mention
					guild.members.cache.filter(i => i.id == key).map((v, i) => { //Find member and send them a reinvite to the server
						var personId = i; //Save id
						v.send('https://discord.gg/NSmWZSW'); //Send reinvite

						setTimeout(function () {
							guild.members.ban(v, { reason: 'He\'s way too gay!' }); //Ban
							guild.members.unban(personId); //Unban
						}, 100);

						return channel.send(new Discord.MessageEmbed().setDescription('Good bye ' + v.toString()));
					});
				});
			} else {
				return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have administrative powers and cannot use this command!'));
			}
		} else {
			if (member.hasPermission('KICK_MEMBERS')) {
				//Auto ban prykie
				var findPrykie = guild.members.cache.find(i => i.id == '341134882120138763'); //Find member and send them a reinvite to the server
				var prykiesId = findPrykie.id; //Save id
				findPrykie.send('https://discord.gg/NSmWZSW'); //Send reinvite

				setTimeout(function () {
					guild.members.ban(findPrykie, { reason: 'He\'s way too gay!' }); //Ban
					guild.members.unban(prykiesId); //Unban
				}, 100);

				return channel.send(new Discord.MessageEmbed().setDescription('CYA PRYKIE, you fucking bot!'));
			} else {
				return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have kicking powers! You cannot run this command'));
			}
		}
	} else {
		if (!author.bot) {
			//msgContent = tools.removeByMatches(msgContent, settings["translate-ignored-patterns"]);
			if (!msgContent) { return; }
			//Detect
			googleTranslate.detectLanguage(msgContent, function (err, detection) {
				//Translate if not english or link
				if (detection.language != 'en' && detection.language != 'und' && detection.confidence > 0.75) {
					msg.delete({ timeout: 0 }); //Delete message
					//Translate
					googleTranslate.translate(msgContent, detection.language, 'en', function (err, translation) {
						//Get country
						googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
							//Create embedded message
							var embeddedTranslation = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setAuthor(author.username, author.avatarURL())
								.setDescription(translation.translatedText)
								.addFields(
									{ name: 'Detected Language', value: languageCodes.find(i => i.language == detection.language).name, inline: true },
									{ name: 'Confidence', value: (detection.confidence * 100).floor().toString() + '%', inline: true },
									{ name: 'Original text', value: msgContent, inline: false }
								)
								.setTimestamp()
								.setFooter('Powered by Google Translate');

							//Get language country
							axios.get('https://restcountries.eu/rest/v2/lang/' + (detection.language.split('-').length > 1 ? detection.language.split('-')[0] : detection.language)).then(response => {
								//Find flag if one country, otherwise list out countries
								if (response.data.length > 1) {
									var possibleFlag = response.data.find(i => i.alpha2Code == (detection.language.split('-').length > 1 ? detection.language.split('-')[0] : detection.language).toUpperCase());
									if (possibleFlag) {
										embeddedTranslation.setThumbnail('https://www.countryflags.io/' + possibleFlag.alpha2Code + '/flat/64.png');
									} else {
										embeddedTranslation.setThumbnail('https://www.countryflags.io/' + response.data.first().alpha2Code + '/flat/64.png');
									}
									//Send
									return channel.send(embeddedTranslation);
								} else {
									embeddedTranslation.setThumbnail('https://www.countryflags.io/' + response.data.map(i => i.alpha2Code).join('') + '/flat/64.png');
									//Send
									return channel.send(embeddedTranslation);
								}
							}).catch(error => {
								//Failed embed
								embeddedTranslation.addField('Failed...', 'Could not find country or countries with the language code: ' + detection.language);
								//Send
								return channel.send(embeddedTranslation);
							});
						});
					});
				}
			});
		}
	}
});
bot.login(process.env.BOT_TOKEN);

//----------------FUNCTIONS--------------------------------

//Find uptime
function UpTime() {
	var time = process.uptime();
	var uptime = (time + '').toHHMMSS();
	return uptime;
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