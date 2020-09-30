//Import classes
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        if (message.member.hasPermission('MOVE_MEMBERS')) {
            //If the length of the array is over 1, then it's a direct channel - channel
            if (args.join(' ').split('-').length > 1) {
                //Grab new array
                args = args.join(' ').split('-').map(i => i.trim());
                var selector = args.shift();

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
                            var voiceChannelFROM = message.guild.channels.cache.find(i => i.name.toLowerCase() == channelSelector.toLowerCase() && i.type == 'voice');
                            if (voiceChannelFROM) {
                                //Grab number of players in this voice
                                var playersFoundInVoice = message.guild.members.cache.filter(i => i.voice.channelID == voiceChannelFROM.id).map((value, key) => value).sort(() => Math.random() - Math.random()).slice(0, numberOfPlayers);

                                if (playersFoundInVoice.length != 0) {
                                    //Check that there's a channel to move to
                                    if (args.length != 0) {
                                        var channelToSelector = args[0];
                                        args = args.splice(1);

                                        //Get the voice channel to move to with the channel selector as name
                                        var voiceChannelTO = message.guild.channels.cache.find(i => i.name.toLowerCase() == channelToSelector.toLowerCase() && i.type == 'voice');
                                        if (voiceChannelTO) {
                                            //send message promise
                                            message.channel
                                                .send(new Discord.MessageEmbed().setDescription(`Moved 0 / ${playersFoundInVoice.length} ${(playersFoundInVoice.length != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
                                                    `members from ${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#FFCC00'))
                                                .then((sent) => {
                                                    var countOfMovedPlayers = 0;

                                                    //Move players from voiceChannelFROM to voiceChannelTO
                                                    playersFoundInVoice.forEach(e => {
                                                        countOfMovedPlayers++; //Count moved players

                                                        e.voice.setChannel(voiceChannelTO);
                                                        //Edit message
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`Moved ${countOfMovedPlayers} / ${playersFoundInVoice.length} ` +
                                                            `${(playersFoundInVoice.length != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
                                                            `members from ${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#FFCC00'));
                                                    });
                                                    //Update after loop
                                                    sent.edit(new Discord.MessageEmbed().setDescription(`✅ Moved ${countOfMovedPlayers} / ${playersFoundInVoice.length} ` +
                                                        `${(playersFoundInVoice.length != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
                                                        `members from ${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#09b50c'));
                                                });
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${channelToSelector}`).setColor('#b50909'));
                                        }
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channel to move ${playersFoundInVoice.length} players to.`).setColor('#b50909'));
                                    }
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`There\'s no one in ${voiceChannelFROM.toString()} to move sorry.`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${channelSelector}`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to move players from.').setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${numberSelector} is not a number of players I can operate on.`).setColor('#b50909'));
                    }
                }//If simple selector
                else {
                    //If selecting all or channel
                    if (selector == '*') {
                        //Grab every player
                        var playersFoundAll = message.guild.members.cache.filter(i => i.voice.channel);

                        if (playersFoundAll.size != 0) {
                            //Check that there's a channel to move to
                            if (args.length != 0) {
                                var channelSelector = args.shift();

                                //Get voice channel to move to with the channel selector as name
                                var voiceChannelTO = message.guild.channels.cache.find(i => i.name.toLowerCase() == channelSelector.toLowerCase() && i.type == 'voice');
                                if (voiceChannelTO) {
                                    //send message promise
                                    message.channel
                                        .send(new Discord.MessageEmbed().setDescription(`Moved 0 / ${playersFoundAll.size} members to ${voiceChannelTO.toString()}`).setColor('#FFCC00'))
                                        .then((sent) => {
                                            var countOfMovedPlayers = 0;

                                            //Move all the players found everywhere to voiceChannelTO
                                            playersFoundAll.map((value, key) => {
                                                countOfMovedPlayers++; //Count moved players

                                                value.voice.setChannel(voiceChannelTO);
                                                //Edit message
                                                sent.edit(new Discord.MessageEmbed().setDescription(`Moved ${countOfMovedPlayers} / ${playersFoundAll.size} members ` +
                                                    `to ${voiceChannelTO.toString()}`).setColor('#FFCC00'));
                                            });
                                            //Update after loop
                                            sent.edit(new Discord.MessageEmbed().setDescription(`✅ Moved ${countOfMovedPlayers} / ${playersFoundAll.size} members ` +
                                                `to ${voiceChannelTO.toString()}`).setColor('#09b50c'));
                                        });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${channelSelector}`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channel to move ${playersFoundAll.size} players to.`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('There\'s no one at all currently in a voice channel for this server.').setColor('#b50909'));
                        }
                    } else {
                        //Channel name, find the voice channel
                        var voiceChannelFROM = message.guild.channels.cache.find(i => i.name.toLowerCase() == selector.toLowerCase() && i.type == 'voice');
                        if (voiceChannelFROM) {
                            //Grab all players in this voice
                            var playersFoundInVoice = message.guild.members.cache.filter(i => i.voice.channelID == voiceChannelFROM.id);
                            if (playersFoundInVoice.size != 0) {
                                //Check that there's a channel to move to
                                if (args.length != 0) {
                                    var channelSelector = args.shift();

                                    //Get the voice channel to move to with the channel selector as name
                                    var voiceChannelTO = message.guild.channels.cache.find(i => i.name.toLowerCase() == channelSelector.toLowerCase() && i.type == 'voice');
                                    if (voiceChannelTO) {
                                        //send message promise
                                        message.channel
                                            .send(new Discord.MessageEmbed().setDescription(`Moved 0 / ${playersFoundInVoice.size} members from ` +
                                                `${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#FFCC00'))
                                            .then((sent) => {
                                                var countOfMovedPlayers = 0;

                                                //Move players from voiceChannelFROM to voiceChannelTO
                                                playersFoundInVoice.map((value, key) => {
                                                    countOfMovedPlayers++; //Count moved players

                                                    value.voice.setChannel(voiceChannelTO);
                                                    //Edit message
                                                    sent.edit(new Discord.MessageEmbed().setDescription(`Moved ${countOfMovedPlayers} / ${playersFoundInVoice.size} members from ` +
                                                        `${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#FFCC00'));
                                                });
                                                //Update ater loop
                                                sent.edit(new Discord.MessageEmbed().setDescription(`✅ Moved ${countOfMovedPlayers} / ${playersFoundInVoice.size} members from ` +
                                                    `${voiceChannelFROM.toString()} to ${voiceChannelTO.toString()}`).setColor('#09b50c'));
                                            });
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${channelSelector}`).setColor('#b50909'));
                                    }
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channel to move ${playersFoundInVoice.size} members to.`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`There\'s no one in ${voiceChannelFROM.toString()} to move sorry.`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${selector}`).setColor('#b50909'));
                        }
                    }
                }
            } //If the length of the array is over 1, then it's a split channel = channel & channel
            else if (args.join(' ').split('=').length > 1) {
                //Grab new array
                args = args.join(' ').split('=').map(i => i.trim());
                var selector = args.shift();

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
                            var voiceChannelFROM = message.guild.channels.cache.find(i => i.name.toLowerCase() == channelSelector.toLowerCase() && i.type == 'voice');
                            if (voiceChannelFROM) {
                                //Grab number of players in this voice
                                var playersFoundInVoice = message.guild.members.cache.filter(i => i.voice.channelID == voiceChannelFROM.id).map((value, key) => value).sort(() => Math.random() - Math.random()).slice(0, numberOfPlayers);
                                if (playersFoundInVoice.length != 0) {
                                    //Check if there's channels to move to
                                    if (args.length != 0) {
                                        var channelSelectors = args.shift().split('&').map(i => i.trim());
                                        var selectorSize = channelSelectors.length;
                                        var playerSize = playersFoundInVoice.length;

                                        //send message promise
                                        message.channel
                                            .send(new Discord.MessageEmbed().setDescription(`Split 0 / ${playerSize} ${(playerSize != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
                                                ` members from ${voiceChannelFROM.toString()} out into:\n`).setColor('#FFCC00'))
                                            .then((sent) => {
                                                var countOfMovedPlayers = 0;
                                                var channelNameOutput = "";

                                                //For each channel
                                                channelSelectors.forEach(e => {
                                                    //Get voice channel to move to with the channel selector (e) as name
                                                    var voiceChannelTO = message.guild.channels.cache.find(i => i.name.toLowerCase() == e.toLowerCase() && i.type == 'voice');
                                                    if (voiceChannelTO) {
                                                        channelNameOutput = `${channelNameOutput}${voiceChannelTO.toString()}\n`;

                                                        //Get a number of players randomly
                                                        var playersToMoveInVoice = playersFoundInVoice.sort(() => Math.random() - Math.random()).slice(0, (Math.ceil(playerSize / selectorSize)));
                                                        if (playersToMoveInVoice) {
                                                            playersToMoveInVoice.forEach(e => {
                                                                countOfMovedPlayers++; //Count moved players

                                                                e.voice.setChannel(voiceChannelTO);
                                                                //Edit message
                                                                sent.edit(new Discord.MessageEmbed().setDescription(`Split ${countOfMovedPlayers} / ${playerSize} ${(playerSize != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
                                                                    `members from ${voiceChannelFROM.toString()} out into:\n${channelNameOutput}`).setColor('#FFCC00'));
                                                            });
                                                            //Remove already moved players
                                                            playersFoundInVoice = playersFoundInVoice.filter(e => !playersToMoveInVoice.map(j => j.id).includes(e.id));
                                                        } //Ignore broken players
                                                    } else {
                                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${e}`).setColor('#b50909'));
                                                    }
                                                });
                                                //Update after loop
                                                sent.edit(new Discord.MessageEmbed().setDescription(`✅ Split ${countOfMovedPlayers} / ${playerSize} ${(playerSize != numberOfPlayers ? `(down from ${numberOfPlayers})` : '')} ` +
                                                    ` members from ${voiceChannelFROM.toString()} out into:\n${channelNameOutput}`).setColor('#09b50c'));
                                            });
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channels to split ${playersFoundInVoice.length} members into.`).setColor('#b50909'));
                                    }
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`There\'s no one in ${voiceChannelFROM.toString()} to move sorry.`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${channelSelector}`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select any voice channel to move players from.').setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${numberSelector} is not a number of players I can operate on.`).setColor('#b50909'));
                    }
                } //If simple selector
                else {
                    //If seleting all or channel
                    if (selector == '*') {
                        //Grab every player
                        var playersFoundAll = message.guild.members.cache.filter(i => i.voice.channel);
                        if (playersFoundAll.size != 0) {
                            //Check there's channels to move to
                            if (args.length != 0) {
                                var channelSelectors = args.shift().split('&').map(i => i.trim());
                                var selectorSize = channelSelectors.length;
                                var playerSize = playersFoundAll.size;

                                //send message promise
                                message.channel
                                    .send(new Discord.MessageEmbed().setDescription(`Split 0 / ${playerSize} members out into:\n`).setColor('#FFCC00'))
                                    .then((sent) => {
                                        var countOfMovedPlayers = 0;
                                        var channelNameOutput = "";

                                        //For each channel
                                        channelSelectors.forEach(e => {
                                            //Get voice channel to move to with the channel selector (e) as name
                                            var voiceChannelTO = message.guild.channels.cache.find(i => i.name.toLowerCase() == e.toLowerCase() && i.type == 'voice');
                                            if (voiceChannelTO) {
                                                channelNameOutput = `${channelNameOutput}${voiceChannelTO.toString()}\n`;

                                                //Get a number of players randomly
                                                var playersToMoveAll = playersFoundAll.map((value, key) => value).sort(() => Math.random() - Math.random()).slice(0, (Math.ceil(playerSize / selectorSize)));
                                                if (playersToMoveAll) {
                                                    playersToMoveAll.forEach(e => {
                                                        countOfMovedPlayers++; //Count moved players

                                                        e.voice.setChannel(voiceChannelTO);
                                                        //Edit message
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`Split ${countOfMovedPlayers} / ${playerSize} members out into:\n${channelNameOutput}`).setColor('#FFCC00'));
                                                    });
                                                    //Remove already moved players
                                                    playersFoundAll = playersFoundAll.filter((value, key) => !playersToMoveAll.map(e => e.id).includes(key));
                                                } //Ignore broken players
                                            } else {
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${e}`).setColor('#b50909'));
                                            }
                                        });
                                        //Update after loop
                                        sent.edit(new Discord.MessageEmbed().setDescription(`✅ Split ${countOfMovedPlayers} / ${playerSize} members out into:\n${channelNameOutput}`).setColor('#09b50c'));
                                    });
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channels to split ${playersFoundAll.size} members into.`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('There\'s no one at all currently in a voice channel for this server.').setColor('#b50909'));
                        }
                    } else {
                        //Channel name, find the voice channel
                        var voiceChannelFROM = message.guild.channels.cache.find(i => i.name.toLowerCase() == selector.toLowerCase() && i.type == 'voice');
                        if (voiceChannelFROM) {
                            //Grab all players in this voice
                            var playersFoundInVoice = message.guild.members.cache.filter(i => i.voice.channelID == voiceChannelFROM.id);

                            if (playersFoundInVoice.size != 0) {
                                //Check if there's channels to move to
                                if (args.length != 0) {
                                    var channelSelectors = args.shift().split('&').map(i => i.trim());
                                    var selectorSize = channelSelectors.length;
                                    var playerSize = playersFoundInVoice.size;

                                    //send message promise
                                    message.channel
                                        .send(new Discord.MessageEmbed().setDescription(`Split 0 / ${playerSize} members from ${voiceChannelFROM.toString()} out into:\n`).setColor('#FFCC00'))
                                        .then((sent) => {
                                            var countOfMovedPlayers = 0;
                                            var channelNameOutput = "";

                                            //For each channel
                                            channelSelectors.forEach(e => {
                                                //Get voice channel to move to with the channel selector (e) as name
                                                var voiceChannelTO = message.guild.channels.cache.find(i => i.name.toLowerCase() == e.toLowerCase() && i.type == 'voice');
                                                if (voiceChannelTO) {
                                                    channelNameOutput = `${channelNameOutput}${voiceChannelTO.toString()}\n`;

                                                    //Get a number of players randomly
                                                    var playersToMoveInVoice = playersFoundInVoice.map((value, key) => value).sort(() => Math.random() - Math.random()).slice(0, (Math.ceil(playerSize / selectorSize)));

                                                    if (playersToMoveInVoice) {
                                                        playersToMoveInVoice.forEach(e => {
                                                            countOfMovedPlayers++; //Count moved players

                                                            e.voice.setChannel(voiceChannelTO);
                                                            //Edit message
                                                            sent.edit(new Discord.MessageEmbed().setDescription(`Split ${countOfMovedPlayers} / ${playerSize} members from ${voiceChannelFROM.toString()} ` +
                                                                `out into:\n${channelNameOutput}`).setColor('#FFCC00'));
                                                        });
                                                        //Remove already moved players
                                                        playersFoundInVoice = playersFoundInVoice.filter((value, key) => !playersToMoveInVoice.map(e => e.id).includes(key));
                                                    }//Ignore broken players
                                                } else {
                                                    //Error message
                                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${e}`).setColor('#b50909'));
                                                }
                                            });
                                            //Update after loop
                                            sent.edit(new Discord.MessageEmbed().setDescription(`✅ Split ${countOfMovedPlayers} / ${playerSize} members from ${voiceChannelFROM.toString()} ` +
                                                `out into:\n${channelNameOutput}`).setColor('#09b50c'));
                                        });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select any voice channels to split ${playersFoundInVoice.size} members into.`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`There\'s no one in ${voiceChannelFROM.toString()} to move sorry.`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${selector}`).setColor('#b50909'));
                        }
                    }
                }
            } else {
                HelpMessage(bot, guild, message, args);
            }
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need moving powers to run this command.').setColor('#b50909'));
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
};

//Functions
function HelpMessage(bot, guild, message, args) {
    var randomChannel1 = message.guild.channels.cache.filter(i => i.type == 'voice').random().name;
    var randomChannel2 = message.guild.channels.cache.filter(i => i.type == 'voice').random().name;
    var randomChannel3 = message.guild.channels.cache.filter(i => i.type == 'voice').random().name;

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Use selectors to move people in voice channels to other voice channels. This command has a lot of different options. It works fine with spaces in the name and is case insensitive.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Move Members' },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}move [Selector] [Split/Direct command prefix] [Channel(s)]\n\n` +
                    `${guild.Prefix}move [Selector] - [Channel]\n\n` +
                    `${guild.Prefix}move [Selector] = [Channel] & [Channel] & [Channel]`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}move ${randomChannel1} - ${randomChannel2} (Move everyone in one voice channel to another voice channel)\n\n` +
                    `${guild.Prefix}move * - ${randomChannel1} (Move everyone currently in any voice channel to a specific voice channel)\n\n` +
                    `${guild.Prefix}move 5 > ${randomChannel1} - ${randomChannel2} (Move 5 randomly picked players from one voice channel to another voice channel)\n\n` +
                    `${guild.Prefix}move ${randomChannel1} = ${randomChannel2} & ${randomChannel3} (Equally split everyone in one voice channel into any number of voice channels seperated by &)\n\n` +
                    `${guild.Prefix}move * = ${randomChannel1} & ${randomChannel2} (Split everyone currently in any voice channel into any number of voice channels seperated by &)\n\n` +
                    `${guild.Prefix}move 5 > ${randomChannel1} = ${randomChannel2} & ${randomChannel3}` +
                    ` (Equally split 5 randomly picked players from one voice channel into any number of voice channels seperated by &).`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}