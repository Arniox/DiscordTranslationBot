//Import
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    bot.generateInvite(['ADMINISTRATOR', 'SEND_MESSAGES', 'MANAGE_GUILD', 'MENTION_EVERYONE'])
        .then((link) => {
            message.channel.send(new Discord.MessageEmbed().setDescription(`[Here is my invite link!](${link})`).setColor('#09b50c'));
        });
}