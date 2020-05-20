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
settings.bancommand = CreateCommand(3);
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
											return channel.send(new Discord.MessageEmbed().setDescription(`${value.toString()} is * already * a mute ignored role.`).setColor('#b50909'));
										} else {
											settings.muteroles.push(key);
											//Write to file
											fs.writeFileSync('./configure.json', JSON.stringify(settings));
											//Message
											return channel.send(new Discord.MessageEmbed().setDescription(`Added: ${value.toString()} to mute ignored roles`).setColor('#09b50c'));
										}
									});
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('I did not detect any roles to add/remove...').setColor('#b50909'));
								}
								break;
							case 'remove':
								if (roles.size != 0) {
									//Save roles id
									roles.map((value, key) => {
										if (settings.muteroles.filter(e => e === key).length == 0) {
											channel.send(new Discord.MessageEmbed().setDescription(`${value.toString()} is * not * a mute ignored role.`).setColor('#b50909'));
										} else {
											settings.muteroles = settings.muteroles.filter(e => e !== key);
											//Write to file
											fs.writeFileSync('./configure.json', JSON.stringify(settings));
											//Message
											return channel.send(new Discord.MessageEmbed().setDescription(`Removed: ${value.toString()} from mute ignored roles`).setColor('#09b50c'));
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
												return channel.send(new Discord.MessageEmbed().setDescription('Removed all roles from mute ignored roles').setColor('#09b50c'));
											default:
												return channel.send(new Discord.MessageEmbed().setDescription('I\'m afraid I don\'t understand the command...').setColor('#b50909'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('I did not detect a roles to add/remove...').setColor('#b50909'));
									}
								}
								break;
							default:
								return channel.send(new Discord.MessageEmbed().setDescription('Do you want to add a mute ignored role, or remove a mute ignored role?').setColor('#b50909'));
						}
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('I am confused by this command?').setColor('#b50909'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot add or remove mute ignored roles. You need to be a server manager/admin to use these commands.').setColor('#b50909'));
				}
				break;
			case 'muteroles': //List out the mute ignored roles
				msg.delete({ timeout: 0 }); //Delete message
				var output = "";
				settings.muteroles.forEach(e => {
					output = output + guild.roles.cache.find(i => i.id = e).toString() + '\n';
				});
				return channel.send(new Discord.MessageEmbed().setDescription(`${settings.muteroles.length} mute ignored roles.\n` + output).setColor('#0099ff'));
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

							//send message promise
							channel
								.send(new Discord.MessageEmbed().setDescription(`Muting 0 / ${playersFoundInVoice.size} members in ${channelToMute.toString()}`).setColor('#FFCC00'))
								.then((sent) => {
									var countofMutedPlayers = 0;

									//Mute everyone that we found
									playersFoundInVoice.map((value, key) => {
										countofMutedPlayers++; //Count muted players

										value.voice.setMute(true);
										//Edit message
										if (countofMutedPlayers == playersFoundInVoice.size)
											sent.edit(new Discord.MessageEmbed().setDescription(`✅ Muted ${countofMutedPlayers} / ${playersFoundInVoice.size} members ` +
												`in ${channelToMute.toString()}`).setColor('#09b50c'));
										else
											sent.edit(new Discord.MessageEmbed().setDescription(`Muting ${countofMutedPlayers} / ${playersFoundInVoice.size} members ` +
												`in ${channelToMute.toString()}`).setColor('#FFCC00'));
									});
								});
							return;
						} else {
							return channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${voiceChannel} `).setColor('#b50909'));
						}
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to mute.').setColor('#b50909'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need muting permissions to run this command.').setColor('#b50909'));
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

							//send message promise
							channel
								.send(new Discord.MessageEmbed().setDescription(`Unmuting 0 / ${playersFoundInVoice.size} members in ${channelToMute.toString()}`).setColor('#FFCC00'))
								.then((sent) => {
									var countOfUnmutedPlayers = 0;

									//Unmute everyone that we found
									playersFoundInVoice.map((value, key) => {
										countOfUnmutedPlayers++; //Count unmuted players

										value.voice.setMute(false);
										//Edit message
										if (countOfUnmutedPlayers == playersFoundInVoice.size)
											sent.edit(new Discord.MessageEmbed().setDescription(`✅ Unmuted ${countOfUnmutedPlayers} / ${playersFoundInVoice.size} members in ${channelToMute.toString()}`).setColor('#09b50c'));
										else
											sent.edit(new Discord.MessageEmbed().setDescription(`Unmuting ${countOfUnmutedPlayers} / ${playersFoundInVoice.size} members in ${channelToMute.toString()}`).setColor('#FFCC00'));
									});
								});
							return;
						} else {
							return channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${voiceChannel}`).setColor('#b50909'));
						}
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to unmute.').setColor('#b50909'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need muting permissions to run this command.').setColor('#b50909'));
				}
			case 'listen': //Join voice chat
				//Grab member voice channel
				var voiceChannel = member.voice.channel;
				var botVoice = guild.me.voice.channel;
				//If you are not in a voice
				if (!voiceChannel) {
					msg.delete({ timeout: 0 }); //Delete message
					return channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first!').setColor('#b50909'));
				} else {
					//Check how many users in channel
					var membersInVoice = guild.members.cache.filter(i => i.voice.channelID == voiceChannel.id && i.user.bot != true);
					//If there are no members in that voice channel
					if (membersInVoice.size == 0) {
						msg.delete({ timeout: 0 }); //Delete message
						return channel.send(new Discord.MessageEmbed().setDescription(`I have found no one in ${voiceChannel.toString()} so I didn\'t join it.`).setColor('#b50909'));
					} else {
						if (!botVoice) {
							//Mute bot
							guild.me.voice.setMute(true);
							//Join voice channel
							voiceChannel
								.join()
								.then(connection => {
									msg.delete({ timeout: 0 }); //Delete message

									//For everyuser in the channel
									membersInVoice.map((value, key) => {
										//Create audio stream
										//var audioStream = connection.receiver.createStream(key);
										//connection.play(audioStream, { type: 'opus' });
									});

									channel.send(new Discord.MessageEmbed().setDescription(`Now listening to ${voiceChannel.toString()}`).setColor('#09b50c'));
								}).catch(error => {
									channel.send(new Discord.MessageEmbed().setDescription('For some reason, I have failed to join this channel. Please try again later or contact the bot developer').setColor('#b50909'))
								});
							return;
						} else {
							if (botVoice == voiceChannel) {
								msg.delete({ timeout: 0 }); //Delete message
								return channel.send(new Discord.MessageEmbed().setDescription('I am already listening to your channel. I can\'t be anywhere else!').setColor('#b50909'));
							} else {
								msg.delete({ timeout: 0 }); //Delete message
								return channel.send(new Discord.MessageEmbed().setDescription(`I am currently busy listening to ${botVoice.toString()}. Ask me later on when I am no longer busy.`).setColor('#b50909'));
							}
						}
					}
				}
				break;
			case 'leave': //Leave voice chat
				msg.delete({ timeout: 0 }); //Delete message

				//Grab bot voice channel
				var memberVoice = member.voice.channel;
				var botVoice = guild.me.voice.channel;

				//If bot is not in voice
				if (!memberVoice) {
					return channel.send(new Discord.MessageEmbed().setDescription('You can only execute this command if you are in a voice channel and share the same voice channel as the bot!').setColor('#b50909'));
				} else {
					if (!botVoice) {
						return channel.send(new Discord.MessageEmbed().setDescription('I am not in a voice channel sorry.').setColor('#b50909'));
					} else {
						//If member and bot are not in the same voice
						if (memberVoice !== botVoice) {
							return channel.send(new Discord.MessageEmbed().setDescription('You can only execute this command if you share the same voice channel as the bot!').setColor('#b50909'));
						} else {
							channel.send(new Discord.MessageEmbed().setDescription(`I have stopped listening to ${botVoice.toString()}`).setColor('#09b50c'));
							guild.me.voice.setMute(false);
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
								var query = args.join("");
								args = args.splice(1);

								//Check if query exists
								if (query) {
									//Add pattern
									settings["translate-ignored-patterns"].push(query);
									//Write to file
									fs.writeFileSync('./configure.json', JSON.stringify(settings));
									//Message
									return channel.send(new Discord.MessageEmbed().setDescription(`Add new pattern to translation ignored patterns:\n${query}`).setColor('#09b50c'));
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('I did not see any pattern to add sorry.').setColor('#b50909'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to add or remove translation ignore patterns.').setColor('#b50909'));
							}
						case 'remove': //Remove specific pattern
							//Check if has perms
							if (member.hasPermission('MANAGE_GUILD')) {
								var query = args[0];
								args = args.splice(1);

								//Check if query exists
								if (query) {
									//Check if query is actually a number
									if (/^\d+$/.test(query)) {
										var numberSelector = parseInt(query) + 1;
										//Find existing
										if (numberSelector >= settings["translate-ignored-patterns"].length) {
											var existingPattern = settings["translate-ignored-patterns"][numberSelector];
											if (existingPattern) {
												//Remove pattern
												settings["translate-ignored-patterns"] = settings["translate-ignored-patterns"].splice(numberSelector, 1);
												//Write to file
												fs.writeFileSync('./configure.json', JSON.stringify(settings));
												//Message
												return channel.send(new Discord.MessageEmbed().setDescription(`Removed\n***${existingPattern}***\nfrom the translation ignored patterns.`).setColor('#09b50c'));
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription(`I couldn\'t find this quote for some reason...`).setColor('#b50909'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription(`The ${tools.ordinal(numberSelector)} ` +
												` translation ignored pattern does not exist sorry.`).setColor('#b50909'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription(`${query} is not a number I can get an index of.`).setColor('#b50909'))
									}
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('I did not see any pattern to remove sorry.').setColor('#b50909'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to add or remove translation ignore patterns.').setColor('#b50909'));
							}
						case 'patterns': //List out current patterns
							var output = "";
							for (var i = 0; i < settings["translate-ignored-patterns"].length; ++i) {
								output = `${output} Pattern ${i + 1} - ***${settings["translate-ignored-patterns"][i].toString()}***\n`;
							}
							return channel.send(new Discord.MessageEmbed().setDescription(`${settings["translate-ignored-patterns"].length} translation ignored patterns.\n${output}`).setColor('#0099ff'));
						default:
							return channel.send(new Discord.MessageEmbed().setDescription('Did you want to add or remove a translation pattern?').setColor('#b50909'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('What are you trying to do?').setColor('#b50909'));
				}
			case 'nick':
				var mentions = msg.mentions.members //Get all mentions
				msg.delete({ timeout: 0 }); //Delete message

				//If no option was selected
				if (args.length != 0) {
					//Get option
					var option = args[0].toLowerCase();
					args = args.splice(1);

					//Check which option you want
					switch (option) {
						case 'all':
							//Check if correct perms
							if (member.hasPermission('MANAGE_GUILD')) {
								var query = args[0];
								args = args.splice(1);

								//Check if query exists
								if (query) {
									//Check if selected code exists in the supported languages
									googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
										if (languageCodes.find(i => i.language == query.toLowerCase())) {
											//Grab members
											var members = guild.members.cache.filter(i => i.user.bot != true && !settings["nick-ignored-playerids"].includes(i.id));

											//Message
											channel.send(new Discord.MessageEmbed().setDescription(`Translating ${members.size} members nickname\'s into ${languageCodes.find(i => i.language == query.toLowerCase()).name}` +
												`...\n This may take up to ${members.size} seconds on a good day...\n` +
												`${guild.members.cache.filter(i => i.user.bot != true && settings["nick-ignored-playerids"].includes(i.id)).size} nickname ignored members.`).setColor('#0099ff'));
											channel
												.send(new Discord.MessageEmbed().setDescription(`Done 0 / ${members.size}`).setColor('#FFCC00'))
												.then((sent) => {
													var count = 0;

													//For all members in the guild
													members.map((value, key) => {
														//Get current user nickname.
														var currentUserNickName = (value.nickname != null && typeof (value.nickname) !== undefined && value.nickname !== '' ? value.nickname : value.user.username);

														//Translate
														googleTranslate.translate(currentUserNickName, query, function (err, translation) {
															//Increase count
															count++
															//Check if the bot has perms
															if (guild.me.roles.highest.comparePositionTo(value.roles.highest) > 0) {
																//Change name
																value.setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName} to ` +
																	`${translation.translatedText.substring(0, 32)} in ${languageCodes.find(i => i.language == query.toLowerCase()).name}`);

																//Edit message
																if (count == members.size) {
																	sent.edit(new Discord.MessageEmbed().setDescription(`✅ Done ${count} / ${members.size}`).setColor('#09b50c'));
																} else {
																	sent.edit(new Discord.MessageEmbed().setDescription(`Done ${count} / ${members.size}`).setColor('#FFCC00'));
																}
															} else {
																channel.send(new Discord.MessageEmbed().setDescription(`I had a problem translating ${value.toString()}\'s` +
																	` nickname due to Missing Permissions.`).setColor('#b50909'));
															}
														});
													});
												});
										} else {
											channel.send(new Discord.MessageEmbed().setDescription(`Unfortunately, my translation capabilities do not support ${query} as a language.`).setColor('#b50909'));
										}
									});
									return;
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('Sorry, what language code did you want to use to translate everyone\'s name to?').setColor('#b50909'))
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need management perms to run this command.').setColor('#b50909'));
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
										var currentUserNickName = (member.nickname != null && typeof (member.nickname) !== undefined && member.nickname !== '' ? member.nickname : author.username);

										//Translate name
										googleTranslate.translate(currentUserNickName, query, function (err, translation) {
											//Change name
											member
												.setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName} to ${translation.translatedText.substring(0, 32)}` +
													` in ${languageCodes.find(i => i.language == query.toLowerCase()).name}`)
												.then(() => {
													channel.send(new Discord.MessageEmbed().setDescription(`I have translated your nickname from ${currentUserNickName} to ${translation.translatedText}` +
														` in ${languageCodes.find(i => i.language == query.toLowerCase()).name}`).setColor('#09b50c'));
												})
												.catch(error => {
													channel.send(new Discord.MessageEmbed().setDescription(`${error.toString().split(':')[1]}, I cannot translate your nickname ${member.toString()}.`).setColor('#b50909'));
												});
											return;
										});
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription(`Unfortunately, my translation capabilities do not support ${query} as a language.`).setColor('#b50909'));
									}
								});
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, what language code did you want to use to translate your name to?').setColor('#b50909'));
							}
							break;
						case 'ignore':
							var option = args[0];
							args = args.splice(1);

							//Check if option exists
							if (option) {
								//Check option
								switch (option) {
									case 'list':
										//List out members
										var membersList = guild.members.cache
											.filter((value, key) => settings["nick-ignored-playerids"].includes(key))
											.map((value, key) => value.toString());

										return channel.send(new Discord.MessageEmbed().setDescription(`${membersList.length} members are being nickname ignored.\n${membersList.join('\n')}`).setColor('#0099ff'));
									default:
										return channel.send(new Discord.MessageEmbed().setDescription('Sorry, I am not sure what you want to do?').setColor('#b50909'));
								}
							} else {
								//Check if you already exist in the database
								if (!settings["nick-ignored-playerids"].find(i => i === member.id)) {
									//Add user to database
									settings["nick-ignored-playerids"].push(member.id);
									//Write file
									fs.writeFileSync('./configure.json', JSON.stringify(settings));
									//Message
									return channel.send(new Discord.MessageEmbed().setDescription(`I have added you, ${member.toString()} to the nickname ignored members.`).setColor('#09b50c'));
								} else {
									//Remove user from database
									settings["nick-ignored-playerids"] = settings["nick-ignored-playerids"].filter(i => i !== member.id);
									//Write file
									fs.writeFileSync('./configure.json', JSON.stringify(settings));
									//Message
									return channel.send(new Discord.MessageEmbed().setDescription(`I have removed you, ${member.toString()} from the nick name ignored members.`).setColor('#09b50c'));
								}
							}
						case 'someone':
							//Check perms
							if (member.hasPermission('MANAGE_NICKNAMES')) {
								if (mentions.size != 0) {
									if (mentions.size == 1) {
										mentions.map((value, key) => {
											//Check that they are not a nickname ignored member
											if (!settings["nick-ignored-playerids"].includes(key)) {
												//Get query
												args = args.splice(1); //Remove mention
												var query = args[0];
												args = args.splice(1);

												//Check if query exists
												if (query) {
													//Check if selected code exists in the supported languages
													googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
														if (languageCodes.find(i => i.language == query.toLowerCase())) {
															//Get current member nicknane,
															var currentUserNickName = (value.nickname != null && typeof (value.nickname) !== undefined && value.nickname !== '' ? value.nickname : value.user.username);

															//Translate name
															googleTranslate.translate(currentUserNickName, query, function (err, translation) {
																//Change name
																value
																	.setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName} to ${translation.translatedText.substring(0, 32)}` +
																		` in ${languageCodes.find(i => i.language == query.toLowerCase()).name}`)
																	.then(() => {
																		channel.send(new Discord.MessageEmbed().setDescription(`I have translated ${value.toString()}\'s nickname from ${currentUserNickName} to ` +
																			`${translation.translatedText} in ${languageCodes.find(i => i.language == query.toLowerCase()).name}`).setColor('#09b50c'))
																	})
																	.catch(error => {
																		channel.send(new Discord.MessageEmbed().setDescription(`${error.toString().split(':')[1]}, I cannot translate ${value.toString()}\'s nickname.`).setColor('#b50909'))
																	});
																return;
															});
														} else {
															return channel.send(new Discord.MessageEmbed().setDescription(`Unfortunately, my translation capabilities` +
																` do not support ${query} as a language.`).setColor('#b50909'));
														}
													});
												} else {
													return channel.send(new Discord.MessageEmbed().setDescription(`Sorry, what language code did you want to` +
														` use to translate ${value.toString()}\'s nickname to?`).setColor('#b50909'));
												}
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription(`${value.toString()} has chosen to ignore his nickname from translation.` +
													` You cannot change his nickname unfortunately. Sorry.`).setColor('#b50909'));
											}

										});
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you can only translate one person at a time.').setColor('#b50909'));
									}
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you didn\'t select anyone to nickname.').setColor('#b50909'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need nickname managment permissions to run this command.').setColor('#b50909'));
							}

							break;
						default:
							return channel.send(new Discord.MessageEmbed().setDescription(`Sorry, did you want to change your own nickname or everyones? You can also use ` +
								`${settings.prefix}nick ignore to exclude yourself from being nicknamed when someone runs the all command. Or run ` +
								`${settings.prefix}nick ignore list to view nickname ignored members.`).setColor('#b50909'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, what option did you want?').setColor('#b50909'));
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
									return channel.send(new Discord.MessageEmbed().setDescription(`Added ${query} to the data base.`).setColor('#09b50c'));
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription(`${query} already exists in the data base. You can use *${settings.prefix}` +
										`prykie list* to view the current list of Prykie quotes.`).setColor('#b50909'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t write any Prykie quote to add.').setColor('#b50909'));
							}
						case 'remove': //Remove prykie quote
							if (member.hasPermission('MANAGE_GUILD')) {
								var query = args.join(' ');

								//Check if query exists
								if (query) {
									//Check if query is actually a number
									if (/^\d+$/.test(query)) {
										var numberSelector = parseInt(query) + 1;
										//Find existing
										if (numberSelector >= dataToUse["prykie-quotes"].length) {
											var existingQuote = dataToUse["prykie-quotes"][numberSelector];
											if (existingQuote) {
												//Remove quote
												dataToUse["prykie-quotes"] = dataToUse["prykie-quotes"].splice(numberSelector, 1);
												//Write to file
												fs.writeFileSync('./data-to-use.json', JSON.stringify(dataToUse));
												//Message
												return channel.send(new Discord.MessageEmbed().setDescription(`Removed***\n${existingQuote}***\nfrom the data base.`).setColor('#09b50c'));
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription('I couldn\'t find this quote for some reason...').setColor('#b50909'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription(`The ${tools.ordinal(numberSelector)} quote does not exist sorry.`).setColor('#b50909'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription(`${query} is not a number I can get an index of.`).setColor('#b50909'));
									}
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select a quote number to remove. You can use *${settings.prefix}` +
										`prykie list* to view the current list of Prykie quotes.`).setColor('#b50909'));
								}
							} else {
								return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to remove a prykie quote.').setColor('#b50909'));
							}
						case 'list': //List all prykie quotes
							var output = "";
							for (var i = 0; i < dataToUse["prykie-quotes"].length; ++i) {
								output = `${output} Quote ${i + 1} - ***${dataToUse["prykie-quotes"][i]}***\n`;
							}
							return channel.send(new Discord.MessageEmbed().setDescription(`${dataToUse["prykie-quotes"].length} prykie quotes.\n${output}`).setColor('#0099ff'));
						default:
							return channel.send(new Discord.MessageEmbed().setDescription('Did you want to list all/add/remove a prykie quote?').setColor('#b50909'));
					}
				} else { //Set random prykie quote
					msg.delete({ timeout: 0 }); //Delete message
					if (dataToUse["prykie-quotes"].length != 0) {
						var findRandom = dataToUse["prykie-quotes"][Math.floor(tools.siteRand(dataToUse["prykie-quotes"].length - 1, 0))];
						//Message
						return channel.send(findRandom);
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('Sorry, I didn\'t find any prykie quotes to use :(').setColor('#b50909'));
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
														//send message promise
														channel
															.send(new Discord.MessageEmbed().setDescription(`Moved 0 / ${playersFoundInVoice.length} ${(playersFoundInVoice.length != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
																`members from ${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#FFCC00'))
															.then((sent) => {
																var countOfMovedPlayers = 0;

																//Move players from voiceChannelFROM to voiceChannelTO
																playersFoundInVoice.forEach(e => {
																	countOfMovedPlayers++; //Count moved players

																	e.voice.setChannel(voiceChannelTO);
																	//Edit message
																	if (countOfMovedPlayers == playersFoundInVoice.length)
																		sent.edit(new Discord.MessageEmbed().setDescription(`✅ Moved ${countOfMovedPlayers} / ${playersFoundInVoice.length} ` +
																			`${(playersFoundInVoice.length != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
																			`members from ${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#09b50c'));
																	else
																		sent.edit(new Discord.MessageEmbed().setDescription(`Moved ${countOfMovedPlayers} / ${playersFoundInVoice.length} ` +
																			`${(playersFoundInVoice.length != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
																			`members from ${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#FFCC00'));
																});
															});
														return;
													} else {
														return channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${channelToSelector}`).setColor('#b50909'));
													}
												} else {
													return channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channel to move ${playersFoundInVoice.length} players to.`).setColor('#b50909'));
												}
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription(`There\'s no one in ${voiceChannelFROM.toString()} to move sorry.`).setColor('#b50909'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${channelSelector}`).setColor('#b50909'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to move players from.').setColor('#b50909'));
									}
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${numberSelector} is not a number of players I can operate on.`).setColor('#b50909'));
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
												//send message promise
												channel
													.send(new Discord.MessageEmbed().setDescription(`Moved 0 / ${playersFoundAll.size} members to ${voiceChannelTO.toString()}`).setColor('#FFCC00'))
													.then((sent) => {
														var countOfMovedPlayers = 0;

														//Move all the players found everywhere to voiceChannelTO
														playersFoundAll.map((value, key) => {
															countOfMovedPlayers++; //Count moved players

															value.voice.setChannel(voiceChannelTO);
															//Edit message
															if (countOfMovedPlayers == playersFoundAll.size)
																sent.edit(new Discord.MessageEmbed().setDescription(`✅ Moved ${countOfMovedPlayers} / ${playersFoundAll.size} members ` +
																	`to ${voiceChannelTO.toString()}`).setColor('#09b50c'));
															else
																sent.edit(new Discord.MessageEmbed().setDescription(`Moved ${countOfMovedPlayers} / ${playersFoundAll.size} members ` +
																	`to ${voiceChannelTO.toString()}`).setColor('#FFCC00'));
														});
													});
												return;
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${channelSelector}`).setColor('#b50909'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channel to move ${playersFoundAll.size} players to.`).setColor('#b50909'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('There\'s no one at all currently in a voice channel for this server.').setColor('#b50909'));
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
													//send message promise
													channel
														.send(new Discord.MessageEmbed().setDescription(`Moved 0 / ${playersFoundInVoice.size} members from ` +
															`${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#FFCC00'))
														.then((sent) => {
															var countOfMovedPlayers = 0;

															//Move players from voiceChannelFROM to voiceChannelTO
															playersFoundInVoice.map((value, key) => {
																countOfMovedPlayers++; //Count moved players

																value.voice.setChannel(voiceChannelTO);
																//Edit message
																if (countOfMovedPlayers == playersFoundInVoice.size)
																	sent.edit(new Discord.MessageEmbed().setDescription(`✅ Moved ${countOfMovedPlayers} / ${playersFoundInVoice.size} members from ` +
																		`${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#09b50c'));
																else
																	sent.edit(new Discord.MessageEmbed().setDescription(`Moved ${countOfMovedPlayers} / ${playersFoundInVoice.size} members from ` +
																		`${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#FFCC00'));
															});

														});
													return;
												} else {
													return channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${channelSelector}`).setColor('#b50909'));
												}
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channel to move ${playersFoundInVoice.size} members to.`).setColor('#b50909'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription(`There\'s no one in ${voiceChannelFROM.toString()} to move sorry.`).setColor('#b50909'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${selector}`).setColor('#b50909'));
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
													var playerSize = playersFoundInVoice.length;
													args = args.splice(1);

													//send message promise
													channel
														.send(new Discord.MessageEmbed().setDescription(`Split 0 / ${playerSize} ${(playerSize != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
															` members from ${voiceChannelFROM.toString()} out into:\n`).setColor('#FFCC00'))
														.then((sent) => {
															var countOfMovedPlayers = 0;
															var channelNameOutput = "";

															//For each channel
															channelSelectors.forEach(e => {
																//Get voice channel to move to with the channel selector (e) as name
																var voiceChannelTO = guild.channels.cache.find(i => i.name.toLowerCase() == e.toLowerCase() && i.type == 'voice');
																if (voiceChannelTO) {
																	channelNameOutput = `${channelNameOutput}${voiceChannelTO.toString()}\n`;

																	//Get a number of players randomly
																	var playersToMoveInVoice = playersFoundInVoice.sort(() => Math.random() - Math.random()).slice(0, (Math.ceil(playerSize / selectorSize)));
																	if (playersToMoveInVoice) {
																		playersToMoveInVoice.forEach(e => {
																			countOfMovedPlayers++; //Count moved players

																			e.voice.setChannel(voiceChannelTO);
																			//Edit message
																			if (countOfMovedPlayers == playerSize)
																				sent.edit(new Discord.MessageEmbed().setDescription(`✅ Split ${countOfMovedPlayers} / ${playerSize} ${(playerSize != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
																					` members from ${voiceChannelFROM.toString()} out into:\n${channelNameOutput}`).setColor('#09b50c'));
																			else
																				sent.edit(new Discord.MessageEmbed().setDescription(`Split ${countOfMovedPlayers} / ${playerSize} ${(playerSize != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
																					`members from ${voiceChannelFROM.toString()} out into:\n${channelNameOutput}`).setColor('#FFCC00'));
																		});
																		//Remove already moved players
																		playersFoundInVoice = playersFoundInVoice.filter(e => !playersToMoveInVoice.map(j => j.id).includes(e.id));
																	} //Ignore broken players
																} else {
																	channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${e}`).setColor('#b50909'));
																}
															});
														});
													return;
												} else {
													return channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channels to split ${playersFoundInVoice.length} members into.`).setColor('#b50909'));
												}
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription(`There\'s no one in ${voiceChannelFROM.toString()} to move sorry.`).setColor('#b50909'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${channelSelector}`).setColor('#b50909'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to move players from.').setColor('#b50909'));
									}
								} else {
									return channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${numberSelector} is not a number of players I can operate on.`).setColor('#b50909'));
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
											var playerSize = playersFoundAll.size;
											args = args.splice(1);

											//send message promise
											channel
												.send(new Discord.MessageEmbed().setDescription(`Split 0 / ${playerSize} members out into:\n`).setColor('#FFCC00'))
												.then((sent) => {
													var countOfMovedPlayers = 0;
													var channelNameOutput = "";

													//For each channel
													channelSelectors.forEach(e => {
														//Get voice channel to move to with the channel selector (e) as name
														var voiceChannelTO = guild.channels.cache.find(i => i.name.toLowerCase() == e.toLowerCase() && i.type == 'voice');
														if (voiceChannelTO) {
															channelNameOutput = `${channelNameOutput}${voiceChannelTO.toString()}\n`;

															//Get a number of players randomly
															var playersToMoveAll = playersFoundAll.map((value, key) => value).sort(() => Math.random() - Math.random()).slice(0, (Math.ceil(playerSize / selectorSize)));
															if (playersToMoveAll) {
																playersToMoveAll.forEach(e => {
																	countOfMovedPlayers++; //Count moved players

																	e.voice.setChannel(voiceChannelTO);
																	//Edit message
																	if (countOfMovedPlayers == playerSize)
																		sent.edit(new Discord.MessageEmbed().setDescription(`✅ Split ${countOfMovedPlayers} / ${playerSize} members out into:\n${channelNameOutput}`).setColor('#09b50c'));
																	else
																		sent.edit(new Discord.MessageEmbed().setDescription(`Split ${countOfMovedPlayers} / ${playerSize} members out into:\n${channelNameOutput}`).setColor('#FFCC00'));
																});
																//Remove already moved players
																playersFoundAll = playersFoundAll.filter((value, key) => !playersToMoveAll.map(e => e.id).includes(key));
															} //Ignore broken players
														} else {
															channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${e}`).setColor('#b50909'));
														}
													});
												});
											return;
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channels to split ${playersFoundAll.size} members into.`).setColor('#b50909'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription('There\'s no one at all currently in a voice channel for this server.').setColor('#b50909'));
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
												var playerSize = playersFoundInVoice.size;
												args = args.splice(1);

												//send message promise
												channel
													.send(new Discord.MessageEmbed().setDescription(`Split 0 / ${playerSize} members from ${voiceChannelFROM.toString()} out into:\n`).setColor('#FFCC00'))
													.then((sent) => {
														var countOfMovedPlayers = 0;
														var channelNameOutput = "";

														//For each channel
														channelSelectors.forEach(e => {
															//Get voice channel to move to with the channel selector (e) as name
															var voiceChannelTO = guild.channels.cache.find(i => i.name.toLowerCase() == e.toLowerCase() && i.type == 'voice');
															if (voiceChannelTO) {
																channelNameOutput = `${channelNameOutput}${voiceChannelTO.toString()}\n`;

																//Get a number of players randomly
																var playersToMoveInVoice = playersFoundInVoice.map((value, key) => value).sort(() => Math.random() - Math.random()).slice(0, (Math.ceil(playerSize / selectorSize)));

																if (playersToMoveInVoice) {
																	playersToMoveInVoice.forEach(e => {
																		countOfMovedPlayers++; //Count moved players

																		e.voice.setChannel(voiceChannelTO);
																		//Edit message
																		if (countOfMovedPlayers == playerSize)
																			sent.edit(new Discord.MessageEmbed().setDescription(`✅ Split ${countOfMovedPlayers} / ${playerSize} members from ${voiceChannelFROM.toString()} ` +
																				`out into:\n${channelNameOutput}`).setColor('#09b50c'));
																		else
																			sent.edit(new Discord.MessageEmbed().setDescription(`Split ${countOfMovedPlayers} / ${playerSize} members from ${voiceChannelFROM.toString()} ` +
																				`out into:\n${channelNameOutput}`).setColor('#FFCC00'));
																	});
																	//Remove already moved players
																	playersFoundInVoice = playersFoundInVoice.filter((value, key) => !playersToMoveInVoice.map(e => e.id).includes(key));
																}//Ignore broken players
															} else {
																//Error message
																channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${e}`).setColor('#b50909'));
															}
														});
													});
												return;
											} else {
												return channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channels to split ${playersFoundInVoice.size} members into.`).setColor('#b50909'));
											}
										} else {
											return channel.send(new Discord.MessageEmbed().setDescription(`There\'s no one in ${voiceChannelFROM.toString()} to move sorry.`).setColor('#b50909'));
										}
									} else {
										return channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${selector}`).setColor('#b50909'));
									}
								}
							}
						} else {
							return channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I do not understand ${msgContent}. You can either move a *[select]* to one [channel] with - or a *[selector]* split to multiple channels with =`).setColor('#b50909'));
						}
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you didn\'t use any selector. I could not understand ${msgContent}`).setColor('#b50909'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need moving powers to run this command.').setColor('#b50909'));
				}
			case 'softban':
				var mentions = msg.mentions.members; //Get all mentions
				msg.delete({ timeout: 0 }); //Delete message

				if (member.hasPermission('ADMINISTRATOR')) {
					if (mentions.size != 0) {
						channel
							.send(new Discord.MessageEmbed().setDescription(`Softbanning 0 / ${mentions.size} members\n\nI couldn\'t ban 0 / ${mentions.size} members.`).setColor('#FFCC00'))
							.then((sent) => {
								var count = 0;
								var errorCount = 0;

								mentions.map((value, key) => { //Find for each member and send reinvite
									//Check role height difference
									if (guild.me.roles.highest.comparePositionTo(value.roles.highest) > 0) {
										count++;
										//Save id
										var personId = key;
										//Send invite
										value
											.send('https://discord.gg/NSmWZSW')
											.then(() => {
												guild.members.ban(value, { reason: 'Soft ban.' }) //Ban
												guild.members.unban(personId); //Unban
												//Edit message
											});
									} else {
										errorCount++;
									}

									//Edit message
									if (errorCount + count == mentions.size)
										sent.edit(new Discord.MessageEmbed().setDescription(`✅ Softbanned ${count} / ${mentions.size} members\n\nI could\'t ban ${errorCount} / ${mentions.size} members.`).setColor('#09b50c'));
									else
										sent.edit(new Discord.MessageEmbed().setDescription(`Softbanning ${count} / ${mentions.size} members\n\nI could\'t ban ${errorCount} / ${mentions.size} members.`).setColor('#FFCC00'));
								});
							});
						return;
					} else {
						return channel.send(new Discord.MessageEmbed().setDescription('You didn\'t mention anyone for me to ban sorry.').setColor('#b50909'));
					}
				} else {
					return channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have administrative powers and cannot use this command!').setColor('#b50909'));
				}
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