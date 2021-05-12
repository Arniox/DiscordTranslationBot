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
        //Get reason
        var reason = args.join(' ').split(',')[1];

        //Check permissions
        if (CanBan(message)) {
            //Check that you mentioned anyone at all
            if (mentions.size != 0) {
                //Switch case on command
                switch (command) {
                    case 'softs': case 'soft': case 'sf': case 's':
                        //Soft Ban members with message
                        message.WaffleResponse(
                            `Soft banning 0 / ${mentions.size} members\n**Reason: ${reason ? reason : 'non given'}**`, MTYPE.Loading
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
                                                `Reason: ${reason ? reason : 'non given'}\nHere is a reinvite ${invite.toString()}`)
                                                .then(() => {
                                                    //Ban and reinvite
                                                    message.guild.members.ban(value, { reason: `${reason ? reason : 'non given'}` }); //Ban
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
                                        `**Reason: ${reason ? reason : 'non given'}**` +
                                        `${errorCount > 0 ? (`\nI could\'t ban ${errorCount} / ${mentions.size} members due to permissions.`) : ''}`).setColor('#09b50c'));
                                else //Edit message
                                    sent.edit(new Discord.MessageEmbed().setDescription(`Soft banning ${count} / ${mentions.size} members\n` +
                                        `**Reason: ${reason ? reason : 'non given'}**` +
                                        `${errorCount > 0 ? (`\nI could\'t ban ${errorCount} / ${mentions.size} members due to permissions.`) : ''}`).setColor('#FFCC00'));
                            });
                        })
                        break;
                    case 'hards': case 'hard': case 'hd': case 'h':
                        //Hard Ban members with message
                        message.WaffleResponse(
                            `Hard banning 0 / ${mentions.size} members\n**Reason: ${reason ? reason : 'non given'}**\n`, MTYPE.Loading
                        ).then((sent) => {
                            var count = 0;
                            var errorCount = 0;

                            mentions.map((value, key) => { //Find for each member and send message
                                //Check role height difference
                                if (message.guild.me.roles.highest.comparePositionTo(value.roles.highest) > 0) {
                                    count++;
                                    //Send message
                                    value.send(`You where hard banned from ${message.guild.name}\n` +
                                        `Reason: ${reason ? reason : 'non given'}`)
                                        .then(() => {
                                            //Ban
                                            message.guild.members.ban(value, { reason: `${reason ? reason : 'non given'}` }); //Ban
                                        }).catch((err) => {
                                            return; //Ignore error
                                        });
                                } else {
                                    errorCount++;
                                }
                                //Update message
                                if ((count + errorCount) == mentions.size) //Update after loop
                                    sent.edit(new Discord.MessageEmbed().setDescription(`✅ Hard banned ${count} / ${mentions.size} members\n` +
                                        `Reason: ${reason ? reason : 'non given'}` +
                                        `${errorCount > 0 ? (`\nI could\'t ban ${errorCount} / ${mentions.size} members due to permissions.`) : ''}`).setColor('#09b50c'));
                                else //Edit message
                                    sent.edit(new Discord.MessageEmbed().setDescription(`Hard banning ${count} / ${mentions.size} members\n` +
                                        `Reason: ${reason ? reason : 'non given'}` +
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
        'Ban command. You can either softban someone which will ban and then unban a member and reinvite them. Or a hard ban which will just ban a member.',
        MTYPE.Error,
        [
            { name: 'Required Permissions: ', value: 'Ban members' },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}ban [softs:soft:sf:s / hards:hard:hd:h] [mention(s)], [:?reason]`
            },
            {
                name: 'Examples: ', value: `${guild.Prefix}ban hard ${randomMember.toString()}, optional reason\n` +
                    `${guild.Prefix}ban soft ${randomMember.toString()}, optional reason`
            }
        ],
        true, 'Thanks, and have a good day');
}