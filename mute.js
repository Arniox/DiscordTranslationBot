//Import classes
const Discord = require('discord.js');

exports.run = (bot, message, args) => {
    if (args.length != 0) {

    } else {
        HelpMessage(bot, message, args);
    }
};

function HelpMessage(bot, message, args) {
    var randomChannel = message.guild.channels.cache.filter(i => i.type == 'voice').random().name;

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('The mute command allows you to server mute everyone in a selected voice channel barring mute ignored roles. This works fine with spaces in the name and is case insensitive.')
        .addFields(
            { name: 'Command Patterns: ', value: `${bot.config.prefix}mute [voice channel name]` },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}mute ${randomChannel}`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}