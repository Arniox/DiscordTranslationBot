//Import
const Discord = require('discord.js');
//Import functions


exports.run = (bot, guild, message, command, args) => {
    if (args.length != 0) {
        var person = message.mentions.members;
        var channel = message.mentions.channels;

        //Check if 1 person is mentioned
        if (person.size != 0 && channel.size == 0) {
            if (person.size < 2) {
                args.shift(); //Shift down past mention

                if (args.length != 0) {
                    //Check whether you want to spam them or spam move them.
                    var spamSelector = args.shift().toLowerCase();

                    //Switch case on spamSelector
                    switch (spamSelector) {
                        case 'move': case 'mov': case 'mo': case 'mv': case 'm':
                            //Check moving permissions
                            if (CanMoveMembers(message)) {
                                //Check that the user is in a voice channel.
                                if (person.first().voice.channel) {
                                    //Spam move the member.
                                    //Grab random channel from voices
                                    var currentChannel = person.first().voice.channel;
                                    var channelsTo = [Sample(message.guild.channels.cache.filter(i => i.type == 'voice').map((value, key) => value)), currentChannel];

                                    //Send message
                                    message.WaffleResponse(`Spam Moving ${person.first().toString()}. React with ⏸️ to stop spam moving the user.`, MTYPE.Loading)
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
                                                        //Catch error if user is not in voice
                                                        person.first().voice.setChannel(currentChannel).catch(() => { });
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
                                    message.WaffleResponse(`Sorry, ${person.first().toString()} is not currently in a voice channel.`);
                                }
                            } else {
                                message.WaffleResponse('Sorry, you need move members powers for this command.');
                            }
                            break;
                        default:
                            //Check if message.member has admin power
                            if (IsManager(message)) {
                                //Check if spamSelector is actually a number or time
                                if (/^\d+$/.test(spamSelector)) {
                                    //Grab number from string
                                    var numberOfSpam = parseInt(spamSelector);
                                    //Check if number is too big
                                    if (numberOfSpam <= 1000) {
                                        if (args.length != 0) {
                                            //Get message
                                            var messageToSpam = args.join(' ');

                                            message.WaffleResponse(`Harrassing ${person.first().toString()} with 0 / ${numberOfSpam} messages.\n\n` +
                                                `Content of message: ***${messageToSpam}***`, MTYPE.Loading)
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
                                            message.WaffleResponse(`Sorry, I cannot harrass ${person.first().toString()} with an empty message.`);
                                        }
                                    } else {
                                        message.WaffleResponse(`Sorry ${numberOfSpam} is too large of a number.`);
                                    }
                                } else if (/[\d]+[a-zA-Z]{1,2}/gi.test(spamSelector)) {
                                    //Spam selector was a time selector
                                    //Grab time from string and check if time string matches the correct format
                                    if (!bot.jobsManager.get(message.guild.id).TimeString(time, false)) {
                                        return message.WaffleResponse(`Sorry, ${spamSelector} is not a correctly formatted time frame. It should be like: 1h30m, or 1m6d`);
                                    }

                                    //Get message
                                    var messageToSpam = args.join(' ');
                                    //Set up message
                                    message.WaffleResponse(`I will now spam ${person.first().toString()} every ${spamSelector}.\n\nContent of message: ***${messageToSpam}***`, MTYPE.Success)
                                        .then((sent) => {
                                            //Create job
                                            bot.jobsManager.get(message.guild.id).CreateJob(spamSelector, () => {
                                                //Send message
                                                person.first().send(`${messageToSpam}`);
                                            }, `Harrass ${person.first().id}|${message.guild.id}`, false);
                                        });
                                } else {
                                    message.WaffleResponse(`Sorry, ${spamSelector} is not a valid selector.`);
                                }
                            } else {
                                message.WaffleResponse('Sorry, you need administrative powers for this command.');
                            }
                            break;
                    }
                } else {
                    message.WaffleResponse(`Sorry, you didn\'t select the number of spam messages to send.`);
                }
            } else {
                message.WaffleResponse('Sorry, you can only harrass one person at a time.');
            }
        } else if (person.size == 0 && channel.size != 0) {
            //Harrassing channel
        } else {
            message.WaffleResponse(`Sorry, you didn't select any person or channel to harrass`);
        }
    } else {
        Helpmessage(bot, guild, message, args);
    }
};

//Functions
function Helpmessage(bot, guild, message, args) {
    //Get random person
    const randomPerson = message.guild.members.cache.random();
    //Send
    message.WaffleResponse(
        `Use this command to harrass a specific person. You can either spam them with messages or spam move them between two channels. ` +
        `Useful to get them to listen to you. Only available to high permissions.`,
        MTYPE.Error,
        [
            { name: 'Required Permissions: ', value: 'Server Manager, Administrator' },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}harrass [member mention] [number] [message]\n` +
                    `${guild.Prefix}harrass [member mention] [move:mov:mo:mv:m]`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}harrass ${randomPerson.toString()} 10 Hello, wake up. It's wakey wakey time!\n` +
                    `${guild.Prefix}harrass ${randomPerson.toString()} move`
            }
        ],
        true, 'Thanks, and have a good day');
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
        //Reset timer to go on infintely
        collector.resetTimer();
        //Clear interval if collector has ended
        if (collector.ended) clearInterval(intr);
    }, 1050);
}