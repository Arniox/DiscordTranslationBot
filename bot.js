const googleApiKey = process.env.GOOGLE_API_KEY;

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
				channel.send('Right back at you! Yes, I am alive. Current uptime is: ' +
					UpTime() + '. Current Prefix is: ' + settings.prefix);
				break;
			case 'prefix': //Prefix options
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
									//Message
									channel.send('Changed Prefix from: ' + previousPrefix + ' to: ' + settings.prefix);
									bot.user.setActivity('the ' + settings.prefix + ' prefix', { type: 'WATCHING' });
								} else {
									channel.send('Sorry, I cannot change your prefix to nothing!');
								}
							} else {
								channel.send('Sorry, you need to be a server manager/admin to change the server prefix.');
							}
							break;
						default: //Error on prefix command
							channel.send('What do you want to change sorry?');
							break;
					}
				} else
					channel.send('Current Bot Prefix is: ' + settings.prefix);
				break;
			case 'when': //When did I ask
				var findRandom = dataToUse.quotes[Math.floor(tools.siteRand(dataToUse.quotes.length - 1, 0))];
				//Message
				channel.send(findRandom);
				break;
			case 'muterole': //Add something to the settings
				if (member.hasPermission('MANAGE_GUILD')) {
					if (args.length != 0) {
						var direction = args[0].toLowerCase();
						args = args.splice(1);

						var roles = msg.mentions.roles;

						//Check which direction you want the role to go
						switch (direction) {
							case 'add':
								if (roles.size != 0) {
									//Save roles id
									roles.map((value, key) => {
										if (settings.muteroles.filter(e => e === key).length != 0) {
											channel.send(value.toString() + ' is *already* a mute ignored role.');
										} else {
											settings.muteroles.push(key);
											//Write to file
											fs.writeFileSync('./configure.json', JSON.stringify(settings));
											//Message
											channel.send('Added: ' + value.toString() + ' to mute ignored roles');
										}
									});
								} else {
									channel.send('I did not detect any roles to add/remove...');
								}
								break;
							case 'remove':
								if (roles.size != 0) {
									//Save roles id
									roles.map((value, key) => {
										if (settings.muteroles.filter(e => e === key).length == 0) {
											channel.send(value.toString() + ' is *not* a mute ignored role.');
										} else {
											settings.muteroles = settings.muteroles.filter(e => e !== key);
											//Write to file
											fs.writeFileSync('./configure.json', JSON.stringify(settings));
											//Message
											channel.send('Removed: ' + value.toString() + ' to mute ignored roles');
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
												channel.send('Removed all roles from mute ignored roles');
												break;
											default:
												channel.send('I\'m afraid I don\'t understand the command...');
												break;
										}
									} else {
										channel.send('I did not detect a roles to add/remove...');
									}
								}
								break;
							default:
								channel.send('Do you want to add a mute ignored role, or remove a mute ignored role?');
								break;
						}
					} else {
						channel.send('I am confused by this command?');
					}
				} else {
					channel.send('Sorry, you cannot add or remove mute ignored roles. You need to be a server manager/admin to use these commands.');
				}
				break;
			case 'muteroles': //List out the mute ignored roles
				var output = "";
				settings.muteroles.forEach(e => {
					output = output + guild.roles.cache.find(i => i.id = e).toString();
				});
				channel.send(settings.muteroles.length + ' mute ignored roles ' + output);
				break;
			case 'mute': //mute channel and ignore mute roles
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

							channel.send('Found ' + playersFoundInVoice.size + ' players in ' + channelToMute.toString() + '... Muting now...');
						} else {
							channel.send('Could not find a voice channel with the name ' + voiceChannel);
						}
					}
				} else {
					channel.send('Sorry, you need muting permissions to run this command.');
				}
				break;
			case 'unmute':
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

							channel.send('Found ' + playersFoundInVoice.size + ' players in ' + channelToMute.toString() + '... Unmuted now...');
						} else {
							channel.send('Could not find a voice channel with the name ' + voiceChannel);
						}
					}
				} else {
					channel.send('Sorry, you need muting permissions to run this command.');
				}
				break;
			default: //Error
				channel.send('Sorry, I do not understand that command...');
				break;
		}
	} else if (msgContent.startsWith('f10') || msgContent.startsWith('F10')) {
		var mentions = msg.mentions.users; //Get all mentions
		//msg.delete({ timeout: 0, reason: 'SHHHHHH!!' }); //Delete message

		if (mentions.size != 0) {
			if (member.hasPermission('ADMINISTRATOR')) {
				mentions.map((value, key) => { //For each mention
					guild.members.cache.filter(i => i.id == key).map((v, i) => { //Find member and send them a reinvite to the server
						var personId = i; //Save id
						v.send('https://discord.gg/NSmWZSW'); //Send reinvite

						setTimeout(function () {
							guild.members.ban(v, { reason: 'He\'s way too gay!' }); //Ban
							guild.members.unban(personId); //Unban
						}, 1000);
					});
				});
			} else {
				channel.send('Sorry, you do not have administrative powers and cannot use this command!');
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
				}, 2000);
			} else {
				channel.send('Sorry, you do not have kicking powers! You cannot run this command');
			}
		}
	} else {
		if (!author.bot) {
			//Detect
			googleTranslate.detectLanguage(msgContent, function (err, detection) {
				//Translate if not english or link
				if (detection.language != 'en' && detection.language != 'und') {
					googleTranslate.translate(msgContent, detection.language, 'en', function (err, translation) {
						channel.send(translation.translatedText);
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