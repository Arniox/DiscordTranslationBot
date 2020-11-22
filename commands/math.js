//Import requirments
const Discord = require('discord.js');
const { help } = require('mathjs');
//Import functions
require('../message-commands.js')();

exports.run = (bot, guild, message, command, args) => {
    if (args.length != 0) {
        var query = args.shift();
        //Check if query exists
        if (query) {
            //Check if query is actually a number
            if (/^\d+$/.test(query)) {
                //Do not need to convert query to number
                //Send message
                ListMessage(message, `Answer:\n`, '#09b50c', MessageToArray(() => {
                    return message.content.toWordsConverted().replace(',', '\n');
                }), 20);
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${query} is not a number.`).setColor('#b50909'));
            }
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription(`Cannot covert an empty number sorry.`).setColor('#b50909'));
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
}

//Help message
function HelpMessage(bot, guild, message, args) {
    var randomNumber = (Math.random() * 50000).floor();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('The math command allows you to print a number in its word format. More features may come later')
        .addField(
            { name: 'Command Patterns: ', value: `${guild.Prefix}math [number]` },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}math ${randomNumber}`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}