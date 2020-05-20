//Import classes
const Discord = require('discord.js');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        var command = args.shift().toLowerCase();

        //Check which option you want
        switch (option) {
            case 'change': //Change bot prefix
                if (message.member.hasPermission('MANAGE_GUILD')) {
                    var query = args.shift();

                    //Check if the query exists
                    if (query) {
                        var previousPrefix = bot.config.prefix;

                        //Change prefix
                        bot.config.prefix = query;
                        //Write to file
                        fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                        bot.user.setActivity(`the ${bot.config.prefix} prefix`, { type: 'WATCHING' });
                        //Message
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Changed Prefix from: ${previousPrefix} to: ${bot.config.prefix}`).setColor('#09b50c'));
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I cannot change your prefix to nothing!').setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to change the server prefix.').setColor('#b50909'));
                }
            case 'current':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Bot Prefix is: ${bot.config.prefix}`).setColor('#0099ff'));
                break;
            default: //Error on prefix command
                HelpMessage(bot, message, args);
                break;
        }

    } else {
        HelpMessage(bot, message, args);
    }
};

//Help message
function HelpMessage(bot, message, args) {
    //Reply with help message
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`You can use prefix by running *${bot.config.prefix}prefix current* to list the current prefix, or *${bot.config.prefix}prefix change [new prefix]* to change the prefix.`)
        .addFields(
            { name: 'Required Permissions: ', value: 'Manage Server' },
            { name: 'Example: ', value: `${bot.config.prefix}prefix current\n\n${bot.config.prefix}prefix change =` }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}