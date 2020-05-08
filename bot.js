const googleApiKey = process.env.GOOGLE_API_KEY;

//const { OpusEncoder } = require('@discordjs/opus');
const axios = require('axios');
var Discord = require('discord.js');
var settings = require('./configure.json');
var dataToUse = require('./data-to-use.json');
var tools = require('./extra-functions');
var countryData = require('./country-data.json');
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
							break;
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
											channel.send(new Discord.MessageEmbed().setDescription(value.toString() + ' is *already* a mute ignored role.'));
										} else {
											settings.muteroles.push(key);
											//Write to file
											fs.writeFileSync('./configure.json', JSON.stringify(settings));
											//Message
											return channel.send(new Discord.MessageEmbed().setDescription('Added: ' + value.toString() + ' to mute ignored roles'));
										}
									});
								} else {
									return channel.send('I did not detect any roles to add/remove...');
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
					output = output + guild.roles.cache.find(i => i.id = e).toString();
				});
				return channel.send(new Discord.MessageEmbed().setDescription(settings.muteroles.length + ' mute ignored roles ' + output));
			case 'mute': //mute channel and ignore mute roles
				msg.delete({ timeout: 0 }); //Delete message
				if (member.hasPermission('MUTE_MEMBERS')) {
					if (args.length != 0) {
						var voiceChannel = args[0].replace('_', ' ');
						args = args.splice(1);

						//Channel name, find the voice channel
						var channelToMute = guild.channels.cache.find(i => i.name == voiceChannel && i.type == 'voice');
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
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need muting permissions to run this command.'));
				}
				break;
			case 'unmute':
				msg.delete({ timeout: 0 }); //Delete message
				if (member.hasPermission('MUTE_MEMBERS')) {
					if (args.length != 0) {
						var voiceChannel = args[0].replace('_', ' ');
						args = args.splice(1);

						//Channel name, find the voice channel
						var channelToMute = guild.channels.cache.find(i => i.name == voiceChannel && i.type == 'voice');
						if (channelToMute) {
							//Grab all players in this voice that aren't ignored
							var playersFoundInVoice = guild.members.cache.filter(i => i.voice.channelID == channelToMute.id && !i._roles.some(r => settings.muteroles.includes(r)));

							//Unmute everyone that we found
							playersFoundInVoice.map((value, key) => {
								value.voice.setMute(false);
							});

							return channel.send(new Discord.MessageEmbed().setDescription('Found ' + playersFoundInVoice.size + ' players in ' + channelToMute.toString() + '... unmuting now...'));
						} else {
							return channel.send(new Discord.MessageEmbed().setDescription('Could not find a voice channel with the name ' + voiceChannel));
						}
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need muting permissions to run this command.'));
				}
				break;
			case 'listen':
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
								channel.send(new Discord.MessageEmbed().setDescription('Now listening to ' + voiceChannel.toString()));
								msg.delete({ timeout: 0 }); //Delete message

								//For everyuser in the channel
								membersInVoice.map((value, key) => {
									//Create audio stream
									//var audioStream = connection.receiver.createStream(key);
									//connection.play(audioStream, { type: 'opus' });
								});

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
			case 'leave':
				msg.delete({ timeout: 0 }); //Delete message

				//Grab bot voice channel
				var memberVoice = member.voice.channel;
				var botVoice = guild.members.cache.find(i => i.id == bot.user.id).voice.channel;

				//If bot is not in voice
				if (!botVoice) {
					return channel.send(new Discord.MessageEmbed().setDescription('I am not in a voice channel sorry.'));
				} else {
					//If member and bot are not in the same voice
					if (memberVoice !== botVoice) {
						return channel.send(new Discord.MessageEmbed().setDescription('You can only execute this command if you share the same voice channel as the bot!'));
					} else {
						channel.send(new Discord.MessageEmbed().setDescription('I have stopped listening to ' + botVoice.toString()));
						guild.members.cache.find(i => i.id == bot.user.id).voice.setMute(true);
						return botVoice.leave();
					}
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

						channel.send(new Discord.MessageEmbed().setDescription('Good bye ' + v.toString()));
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
			//Detect
			googleTranslate.detectLanguage(msgContent, function (err, detection) {
				//Translate if not english or link
				if (detection.language != 'en' && detection.language != 'und' && detection.confidence > 0.75) {
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
								console.log(response.data.length);

								//Find flag if one country, otherwise list out contries
								if (response.data.length > 1) {
									console.log('Countries that use ' + languageCodes.find(i => i.language == detection.language).name);
									console.log(response.data.map(i => i.name).join(','));

									//Add all the countries
									embeddedTranslation.addField(
										'Countries that use ' + languageCodes.find(i => i.language == detection.language).name,
										response.data.map(i => i.name).join(',')
									);
								} else {
									console.log('Country that use ' + languageCodes.find(i => i.language == detection.language).name);
									console.log(response.data.name);

									//Set thumbnail
									embeddedTranslation.setThumbnail('https://www.countryflags.io/' + response.data.alpha2Code + '/flat/64.png');
									//Add all the one country
									embeddedTranslation.addField(
										'Countries that use ' + languageCodes.find(i => i.language == detection.language).name,
										response.data.name
									);
								}
							}).catch(error => {
								console.log('Failed...', 'Could not find country or countries with the language code: ');
								console.log(detection.language);
								//Failed embed
								embeddedTranslation.addField(
									'Failed...', 'Could not find country or countries with the language code: ' + detection.language
								);
							});

							//Send
							return channel.send(embeddedTranslation);
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