//Import
const Discord = require('discord.js');
//Import functions
require('../message-commands.js')();

exports.run = (bot, guild, message, command, args) => {
    var mentions = message.mentions.members; //Get all mentions

    //Check that args exist
    if (args.length != 0) {
        //Get command
        var command = args.shift().toLowerCase();
        //Get time
        var time = args.shift();
        //Get reason
        var reason = args.join(' ').split('-')[1];

        //Check permissions
        if (CanBan(message)) {
            //Check that you mentioned anyone at all
            if (mentions.size != 0) {
                //Switch case on command
                switch (command) {
                    case 'softs': case 'soft': case 'sf': case 's':
                        //Get reason
                        var reasonAnswer = reason ? `${reason}` : `No Reason Given`;

                        //Soft Ban members with message
                        message.WaffleResponse(
                            `Soft banning 0 / ${mentions.size} members\n**Reason: ${reasonAnswer}**`, MTYPE.Loading
                        ).then((sent) => {
                            var count = 0;
                            var errorCount = 0;

                            mentions.map((value, key) => { //Find for each member and send reinvite
                                //Check role height difference
                                if (message.guild.me.roles.highest.comparePositionTo(value.roles.highest) > 0) {
                                    count++;
                                    //Save id
                                    var personId = key;

                                    //Send reinvite
                                    message.channel.createInvite({ maxAge: 0, maxUses: 1, unique: true, reason: `${reason}` })
                                        .then((invite) => {
                                            value.send(`You where soft banned from ${message.guild.name}\n` +
                                                `Reason: ${reasonAnswer}\nHere is a reinvite ${invite.toString()}`)
                                                .then(() => {
                                                    //Ban and reinvite
                                                    message.guild.members.ban(value, { reason: `${reasonAnswer}` }); //Ban
                                                    message.guild.members.unban(personId); //Unban
                                                }).catch((err) => {
                                                    return; //Ignore error
                                                });
                                        }).catch((err) => {
                                            console.error(err); //Log error
                                        });
                                } else {
                                    errorCount++;
                                }
                                //Update message
                                if ((count + errorCount) == mentions.size) //Update after loop
                                    sent.edit(new Discord.MessageEmbed().setDescription(`✅ Soft banned ${count} / ${mentions.size} members\n` +
                                        `**Reason: ${reasonAnswer}**` +
                                        `${errorCount > 0 ? (`\nI could\'t ban ${errorCount} / ${mentions.size} members due to permissions.`) : ''}`).setColor('#09b50c'));
                                else //Edit message
                                    sent.edit(new Discord.MessageEmbed().setDescription(`Soft banning ${count} / ${mentions.size} members\n` +
                                        `**Reason: ${reasonAnswer}**` +
                                        `${errorCount > 0 ? (`\nI could\'t ban ${errorCount} / ${mentions.size} members due to permissions.`) : ''}`).setColor('#FFCC00'));
                            });
                        })
                        break;
                    case 'hards': case 'hard': case 'hd': case 'h':
                        var timedBan = false;
                        //Check if optional time was entered
                        if (/[\d]+[a-z]{1,2}/gi.test(time)) {
                            //Check if the time string matches the correct format
                            if (!bot.jobsManager.get(message.guild.id).TimeString(time, true)) {
                                return message.WaffleResponse(`Sorry, ${time} is not a correctly formatted time frame. It should be like: 1h30m, or 1M6d`);
                            } else {
                                timedBan = true;
                            }
                        }
                        //Get reason and time
                        var timeAnswer = timedBan ? `For ${time}` : 'Indefinitely';
                        var reasonAnswer = reason ? `${reason}` : `No Reason Given`;

                        //Hard Ban members with message
                        message.WaffleResponse(
                            `Hard banning 0 / ${mentions.size} members ${timeAnswer}\n**Reason: ${reasonAnswer}**\n`, MTYPE.Loading
                        ).then((sent) => {
                            var count = 0;
                            var errorCount = 0;

                            mentions.map((value, key) => { //Find for each member and send message
                                //Check role height difference
                                if (message.guild.me.roles.highest.comparePositionTo(value.roles.highest) > 0) {
                                    count++;
                                    //Save id
                                    var personId = key;

                                    //Send message
                                    value.send(`You where hard banned from ${message.guild.name} ${timeAnswer}\nReason: ${reasonAnswer}`)
                                        .then(() => {
                                            message.guild.members.ban(value, { reason: `${timeAnswer} - ${reasonAnswer}` }); //Ban
                                            //Ban
                                            if (timedBan) {
                                                //Unban after time
                                                //Create job
                                                bot.jobsManager.get(message.guild.id).CreateJob(time, () => {
                                                    console.log('unban');
                                                    message.guild.members.unban(personId); //Unban
                                                    //Stop job
                                                    bot.jobsManager.get(message.guild.id).StopJop(`Ban ${personId}`);
                                                }, `Ban ${personId}`, true);
                                            }
                                        }).catch((err) => {
                                            return; //Ignore error
                                        });
                                } else {
                                    errorCount++;
                                }
                                //Update message
                                if ((count + errorCount) == mentions.size) //Update after loop
                                    sent.edit(new Discord.MessageEmbed().setDescription(`✅ Hard banned ${count} / ${mentions.size} members ${timeAnswer}\n` +
                                        `Reason: ${reasonAnswer}` +
                                        `${errorCount > 0 ? (`\nI could\'t ban ${errorCount} / ${mentions.size} members due to permissions.`) : ''}`).setColor('#09b50c'));
                                else //Edit message
                                    sent.edit(new Discord.MessageEmbed().setDescription(`Hard banning ${count} / ${mentions.size} members ${timeAnswer}\n` +
                                        `Reason: ${reasonAnswer}` +
                                        `${errorCount > 0 ? (`\nI could\'t ban ${errorCount} / ${mentions.size} members due to permissions.`) : ''}`).setColor('#FFCC00'));
                            });
                        });
                        break;
                    default:
                        HelpMessage(bot, guild, message, args);
                        break;
                }
            } else {
                message.WaffleResponse('You didn\'t select anyone to ban');
            }
        } else {
            message.WaffleResponse('Sorry, you need banning powers.');
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
};

function HelpMessage(bot, guild, message, args) {
    //Get random member
    const randomMember = message.guild.members.cache.random();
    //Send
    message.WaffleResponse(
        'Ban command. You can either softban someone which will ban and then unban a member and reinvite them (essentially a quick kick). ' +
        'Or a hard ban which will just ban a member.\n' +
        'When hard banning, you can add an optional time to a revoke. If none is given, ban will be permanent',
        MTYPE.Error,
        [
            { name: 'Required Permissions: ', value: 'Ban members' },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}ban [softs:soft:sf:s] [mention(s)] - [:?reason]\n` +
                    `${guild.Prefix}ban [hards:hard:hd:h] [:?time as 1s/1m/1h/1d/1M] [mention(s)] - [:?reason]`
            },
            {
                name: 'Examples: ', value: `${guild.Prefix}ban hard 1h30m ${randomMember.toString()} - optional reason\n` +
                    `${guild.Prefix}ban hard ${randomMember.toString()} - optional reason\n` +
                    `${guild.Prefix}ban soft ${randomMember.toString()} - optional reason`
            }
        ],
        true, 'Thanks, and have a good day');
}