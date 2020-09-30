//Import classes
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        var person = message.mentions.members;

        if (message.member.hasPermission('MOVE_MEMBERS')) {
            if (args.length != 0 && person.size != 0) {
                if (person.size < 2) {
                    args.shift(); //Shift down past mention

                    if (args.length != 0) {
                        //Check whether you want to spam them or spam move them.
                        var spamSelector = args.shift();
                        if (spamSelector == 'move') {
                            //Check that the user is in a voice channel.
                            if (person.first().voice.channel) {
                                //Spam move the member.
                                //Grab random channel from voices
                                var currentChannel = person.first().voice.channel;
                                var channelsTo = [Sample(message.guild.channels.cache.filter(i => i.type == 'voice').map((value, key) => value)), currentChannel];

                                //Send message
                                message.channel
                                    .send(new Discord.MessageEmbed().setDescription(`Spam Moving ${person.first().toString()}. React with ⏸️ to stop spam moving the user.`).setColor('#FFCC00'))
                                    .then((sent) => {
                                        sent.react('⏸️')
                                            .then(() => {
                                                //Set up emoji reaction filter.
                                                const filter = (reaction, user) => {
                                                    return ['⏸️'].includes(reaction.emoji.name) && user.id === message.author.id;
                                                };
                                                //Create reaction collector
                                                const collector = sent.createReactionCollector(filter, { max: 1, time: 500000 });

                                                //Await reaction
                                                //stop collector and then remove reactions and then edit message
                                                collector.on('collect', r => { collector.stop(`Stopped spam moving ${person.first().toString()}`); });
                                                collector.on('end', (c, reason) => {
                                                    person.first().voice.setChannel(currentChannel);
                                                    //Remove reactions and then edit message
                                                    sent.reactions.removeAll()
                                                        .then(() => {
                                                            sent.edit(new Discord.MessageEmbed().setDescription(`${reason}`).setColor('#09b50c'));
                                                        }).catch((error) => { console.error('Failed to clear reactions: ', error) });
                                                });

                                                //While loop and wait for collector to finish
                                                next(collector, person, channelsTo);
                                            });
                                    });
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${person.first().toString()} is not currently in a voice channel.`).setColor('#b50909'));
                            }
                        } else {
                            //Check if message.member has admin power
                            if (message.member.hasPermission('MANAGE_GUILD')) {
                                //Check if spamSelector is actually a number
                                if (/^\d+$/.test(spamSelector)) {
                                    //Grab number from string
                                    var numberOfSpam = parseInt(spamSelector);

                                    if (args.length != 0) {
                                        //Get message
                                        var messageToSpam = args.join(" ");

                                        message.channel
                                            .send(new Discord.MessageEmbed().setDescription(`Harrassing ${person.first().toString()} with 0 / ${numberOfSpam} messages.\n\n` +
                                                `Content of message: ***${messageToSpam}***`).setColor('#FFCC00'))
                                            .then((sent) => {
                                                //For loop
                                                for (var i = 0; i < numberOfSpam; ++i) {
                                                    person.first().send(`${messageToSpam}`); //Send message

                                                    //Edit message
                                                    sent.edit(new Discord.MessageEmbed().setDescription(`Harrassing ${person.first().toString()} ` +
                                                        `with ${i} / ${numberOfSpam} messages.\n\nContent of message: ***${messageToSpam}***`).setColor('#FFCC00'));
                                                }
                                                //Update after loop
                                                sent.edit(new Discord.MessageEmbed().setDescription(`✅ Finished Harrassing ${person.first().toString()} ` +
                                                    `with ${i} / ${numberOfSpam} messages.\n\nContent of message: ***${messageToSpam}***`).setColor('#09b50c'));
                                            });
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I cannot harrass ${person.first().toString()} with an empty message.`).setColor('#b50909'));
                                    }
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${spamSelector} is not a number.`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need administrative powers for this command.').setColor('#b50909'));
                            }
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you didn\'t select the number of spam messages to send.`).setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you can only harrass one person at a time.').setColor('#b50909'));
                }
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you didn\'t select anyone to harrass.').setColor('#b50909'));
            }
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need move members powers for this command.').setColor('#b50909'));
        }
    } else {
        Helpmessage(bot, guild, message, args);
    }
};

//Functions
function Helpmessage(bot, guild, message, args) {
    var randomPerson = message.guild.members.cache.random();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`Use this command to harrass a specific person. You can either spam them with messages or spam move them between two channels. Useful to get them to listen to you. Only available to high permissions.`)
        .addFields(
            { name: 'Required Permissions: ', value: 'Server Manager, Administrator' },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}harrass [member mention] [number] [message]\n\n` +
                    `${guild.Prefix}harrass [member mention] move`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}harrass ${randomPerson.toString()} 10 Hello, wake up. It's wakey wakey time!\n\n` +
                    `${guild.Prefix}harrass ${randomPerson.toString()} move`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Set embedded message
    message.channel.send(embeddedHelpMessage);
}

//function for random item from array
function Sample(aarr) {
    return aarr[Math.floor(Math.random() * aarr.length)];
}

//function for looping move harrass
function next(collector, person, channelsTo) {
    var intr = setInterval(async function () {
        //Await for person to be moved to slow down the while loop and then reverse channel array
        await person.first().voice.setChannel(channelsTo[0])
            .catch((e) => {
                collector.stop(`${person.first().toString()} has disconnected so spam move was stopped.`);
            });
        channelsTo.reverse();
        //Clear interval if collector has ended
        if (collector.ended) clearInterval(intr);
    }, 1050);
}