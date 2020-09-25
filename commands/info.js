const Discord = require('discord.js');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        //Get all message mentions first
        var channelMentions = message.mentions.channels;
        //Get command
        var command = args.shift().toLowerCase();

        //Switch on command
        switch (command) {
            case 'servers':
                if (args.length != 0) {
                    //Get detail
                    var detail = args.shift().toLowerCase();
                    //Switch on detail
                    switch (detail) {
                        case 'count':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`${bot.user.username} is part of ${bot.guilds.cache.count()} discord servers.`).setColor('#0099ff'));
                            break;
                        case 'names': case 'name':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`${bot.guilds.cache.map((value, key) => value.name).join(', ')}`).setColor('#0099ff'));
                            break;
                    }
                } else {
                    HelpMessage(bot, message, args);
                }
                break;
            case 'total':
                break;
            case 'countme':
                break;
            case 'list':
                break;
            case 'count':
                break;
            default:
                HelpMessage(bot, message, args);
                break;
        }
    } else {
        HelpMessage(bot, message, args);
    }
}

//Functions
function HelpMessage(bot, message, args) {
    var randomChannel = message.guild.channels.cache.random();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`Info command allows you to get many different informatics on the bot and it's servers.`)
        .addFields(
            {
                name: 'Command Patterns: ',
                value: `**:? stands for optional in all command patterns proceeding.**\n\n` +
                    `${bot.config.prefix}info [command] [detail] [:?optional excess text]\n\n` +
                    `${bot.config.prefix}info servers [detail] *gets details on the servers that ${bot.user.username} is in*\n\n` +
                    `${bot.config.prefix}info total [detail] *gets the total counts of [details] for all servers that ${bot.user.username} is in*\n\n` +
                    `${bot.config.prefix}info countme [detail] *gets the total counts of [details] for ${message.guild.toString()}*\n\n` +
                    `${bot.config.prefix}info list [detail] *gets a list of all the [details] for ${message.guild.toString()}*\n\n` +
                    `${bot.config.prefix}info count [detail] [channel tag] *counts the total [detail] in [tagged channel]*\n\n`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}info servers count\n\n` +
                    `${bot.config.prefix}info servers names\n\n` +
                    `${bot.config.prefix}info total members\n\n` +
                    `${bot.config.prefix}info total emojis\n\n` +
                    `${bot.config.prefix}info total channels\n\n` +
                    `${bot.config.prefix}info total voice :?channels\n\n` +
                    `${bot.config.prefix}info total text :?channels\n\n` +
                    `${bot.config.prefix}info total categories\n\n` +
                    `${bot.config.prefix}info total news :?channels\n\n` +
                    `${bot.config.prefix}info total store :?channels\n\n` +
                    `${bot.config.prefix}info countme members\n\n` +
                    `${bot.config.prefix}info countme emojis\n\n` +
                    `${bot.config.prefix}info countme channels\n\n` +
                    `${bot.config.prefix}info countme voice :?channels\n\n` +
                    `${bot.config.prefix}info countme text :?channels\n\n` +
                    `${bot.config.prefix}info countme categories\n\n` +
                    `${bot.config.prefix}info countme news :?channels\n\n` +
                    `${bot.config.prefix}info countme store :?channels\n\n` +
                    `${bot.config.prefix}info list members\n\n` +
                    `${bot.config.prefix}info list emojis\n\n` +
                    `${bot.config.prefix}info list channels\n\n` +
                    `${bot.config.prefix}info list voice :?channels\n\n` +
                    `${bot.config.prefix}info list text :?channels\n\n` +
                    `${bot.config.prefix}info list categories\n\n` +
                    `${bot.config.prefix}info list news :?channels\n\n` +
                    `${bot.config.prefix}info list store :?channels\n\n` +
                    `${bot.config.prefix}info count messages ${randomChannel.toString()}\n\n`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //set embedded message
    message.channel.send(embeddedHelpMessage);
}