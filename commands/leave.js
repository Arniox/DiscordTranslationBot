//Import classes
const Discord = require('discord.js');

exports.run = (bot, message, args) => {
    //Grab bot voice channel
    var memberVoice = message.member.voice.channel;
    var botVoice = message.guild.me.voice.channel;

    //If bot is not in voice
    if (!memberVoice) {
        message.channel.send(new Discord.MessageEmbed().setDescription('You can only execute this command if you are in a voice channel and share the same voice channel as the bot!').setColor('#b50909'));
    } else {
        if (!botVoice) {
            message.channel.send(new Discord.MessageEmbed().setDescription('I am not in a voice channel sorry.').setColor('#b50909'));
        } else {
            //If member and bot are not in the same voice
            if (memberVoice !== botVoice) {
                message.channel.send(new Discord.MessageEmbed().setDescription('You can only execute this command if you share the same voice channel as the bot!').setColor('#b50909'));
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription(`I have stopped listening to ${botVoice.toString()}`).setColor('#09b50c'));
                message.guild.me.voice.setMute(false);
                botVoice.leave();
            }
        }
    }

    //Add later when outputting to a file is option 
    //HelpMessage(bot, message, args);
};

function HelpMessage(bot, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('[WIP] This command is a work in progress. Currently it\'s a bit buggy and can cause bot crashes. It will simply disconnect the bot from it\'s current voice channel.')
        .addFields(
            { name: 'Required: ', value: 'You must be in the same voice channel as the bot for this to work.' }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}