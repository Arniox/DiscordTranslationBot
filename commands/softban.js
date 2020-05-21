//Import classes
const Discord = require('discord.js');

exports.run = (bot, message, args) => {
    var mentions = message.mentions.members; //Get all mentions
    if (mentions.size != 0) {
        if (message.member.hasPermission('ADMINISTRATOR')) {
            message.channel
                .send(new Discord.MessageEmbed().setDescription(`Softbanning 0 / ${mentions.size} members\n\nI couldn\'t ban 0 / ${mentions.size} members.`).setColor('#FFCC00'))
                .then((sent) => {
                    var count = 0;
                    var errorCount = 0;

                    mentions.map((value, key) => { //Find for each member and send reinvite
                        //Check role height difference
                        if (message.guild.me.roles.highest.comparePositionTo(value.roles.highest) > 0) {
                            count++;
                            //Save id
                            var personId = key;
                            //Send invite
                            value
                                .send('https://discord.gg/NSmWZSW')
                                .then(() => {
                                    message.guild.members.ban(value, { reason: 'Soft ban.' }) //Ban
                                    message.guild.members.unban(personId); //Unban
                                    //Edit message
                                });
                        } else {
                            errorCount++;
                        }

                        //Edit message
                        if (errorCount + count == mentions.size)
                            sent.edit(new Discord.MessageEmbed().setDescription(`✅ Softbanned ${count} / ${mentions.size} members\n\nI could\'t ban ${errorCount} / ${mentions.size} members.`).setColor('#09b50c'));
                        else
                            sent.edit(new Discord.MessageEmbed().setDescription(`Softbanning ${count} / ${mentions.size} members\n\nI could\'t ban ${errorCount} / ${mentions.size} members.`).setColor('#FFCC00'));
                    });
                });
            return;
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have administrative powers and cannot use this command!').setColor('#b50909'));
        }
    } else {
        HelpMessage(bot, message, args);
    }
};

function HelpMessage(bot, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Selected members will get banned and then instantly unbanned and sent a reinvite to the server. If you have server settings set up to auto ' +
            'delete messages on a ban, this is a good way to clear a players messages.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Administrator (banning multiple players at once needs max permissions).' },
            { name: 'Command Patterns: ', value: `${bot.config.prefix}softban [mention]+` },
            {
                name: 'Examples: ', value: `${bot.config.prefix}softban ${message.guild.members.cache.random().toString()}\n\n` +
                    `${bot.config.prefix}softban ${message.guild.members.cache.random().toString()}${message.guild.members.cache.random().toString()}`
            },
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}