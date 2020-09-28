//Import classes
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    var mentions = message.mentions.members; //Get all mentions

    //Check that args exist
    if (args.length != 0) {
        //Get command
        var command = args.shift().toLowerCase();
        //Get reason
        var reason = args.join(' ').split(',')[1];

        //Check permissions
        if (message.member.hasPermission('BAN_MEMBERS')) {
            //Check that you mentioned anyone at all
            if (mentions.size != 0) {
                //Switch case on command
                switch (command) {
                    case 'soft':
                        //Soft Ban members with message
                        message.channel
                            .send(new Discord.MessageEmbed().setDescription(`Soft banning 0 / ${mentions.size} members\n\n` +
                                `I couldn\'t ban 0 / ${mentions.size} members due to permissions.`).setColor('#FFCC00'))
                            .then((sent) => {
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
                                                value.send(`You where soft banned from ${message.guild.name}. Reason: ${reason}. Here is a reinvite ${invite.toString()}`)
                                                    .then(() => {
                                                        //Ban and reinvite
                                                        message.guild.members.ban(value, { reason: `${reason}` }); //Ban
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
                                    if ((count + errorCount) == members.size) //Edit message
                                        sent.edit(new Discord.MessageEmbed().setDescription(`Soft banning ${count} / ${mentions.size} members\n\n` +
                                            `I couldn\'t ban ${errorCount} / ${mentions.size} members due to permissions.`).setColor('#FFCC00'));
                                    else //Update after loop
                                        sent.edit(new Discord.MessageEmbed().setDescription(`✅ Soft banned ${count} / ${mentions.size} members\n\n` +
                                            `I could\'t ban ${errorCount} / ${mentions.size} members due to permissions.`).setColor('#09b50c'));
                                });
                            })
                        break;
                    case 'hard':
                        //Hard Ban members with message
                        message.channel
                            .send(new Discord.MessageEmbed().setDescription(`Hard banning 0 / ${mentions.size} members\n\n` +
                                `I couldn\'t ban 0 / ${mentions.size} members due to permissions.`).setColor('#FFCC00'))
                            .then((sent) => {
                                var count = 0;
                                var errorCount = 0;

                                mentions.map((value, key) => { //Find for each member and send message
                                    //Check role height difference
                                    if (message.guild.me.roles.highest.comparePositionTo(value.roles.highest) > 0) {
                                        count++;
                                        //Send message
                                        value.send(`You where hard banned from ${message.guild.name}. Reason: ${reason}.`)
                                            .then(() => {
                                                //Ban
                                                message.guild.memebers.ban(value, { reason: `${reason}` }); //Ban
                                            }).catch((err) => {
                                                return; //Ignore error
                                            });
                                    } else {
                                        errorCount++;
                                    }
                                    //Update message
                                    if ((count + errorCount) == members.size) //Edit message
                                        sent.edit(new Discord.MessageEmbed().setDescription(`Hard banning ${count} / ${mentions.size} members\n\n` +
                                            `I couldn'\t ban ${errorCount} / ${mentions.size} members due to permissions.`).setColor('#FFCC00'));
                                    else //Update after loop
                                        sent.edit(new Discord.MessageEmbed().setDescription(`✅ Hard banned ${count} / ${mentions.size} members\n\n` +
                                            `I couldn\'t ban ${errorCount} / ${mentions.size} members due to permissions.`).setColor('#09b50c'));
                                });
                            });
                        break;
                    default:
                        HelpMessage(bot, guild, message, args);
                        break;
                }
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('You didn\'t select anyone to ban.').setColor('#b50909'));
            }
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need banning powers.').setColor('#b50909'));
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
};

function HelpMessage(bot, guild, message, args) {
    var randomMember = message.guild.memebers.cache.random();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Ban command. You can either softban someone which will ban and then unban a member and reinvite them. Or a hard ban which will just ban a member.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Ban members' },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}ban [soft/hard] [mention(s)], [:?reason]`
            },
            {
                name: 'Examples: ', value: `${guild.Prefix}ban hard ${randomMember.toString()}, optional reason\n\n` +
                    `${guild.Prefix}ban soft ${randomMember.toString()}, optional reason`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}