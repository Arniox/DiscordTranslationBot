//Import classes
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    if (args.length > 0) {
        var command = args.shift().toLowerCase();
        //Check which option you want
        switch (command) {
            //Change bot prefix
            case 'change': case 'ch': case '=':
                if (message.member.hasPermission('MANAGE_GUILD')) {
                    var query = args.shift();

                    //Check if the query exists
                    if (query) {
                        var previousPrefix = guild.Prefix;

                        //Update new prefix
                        const update_cmd = `
                        UPDATE servers
                        SET Prefix = "${query}"
                        WHERE ServerId = "${message.guild.id}"
                        `;
                        bot.con.query(update_cmd, (error, results, fields) => {
                            if (error) return console.error(error); //Throw error and return
                            //Message
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Changed Prefix from: ${previousPrefix} to: ${query}`).setColor('#09b50c'));
                        });
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I cannot change your prefix to nothing!').setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to change the server prefix.').setColor('#b50909'));
                }
                break;
            case 'current': case 'curr': case 'cur': case 'c':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Bot Prefix is: ${guild.Prefix}`).setColor('#0099ff'));
                break;
            default: //Error on prefix command
                HelpMessage(bot, guild, message, args);
                break;
        }
    } else {
        message.channel.send(new Discord.MessageEmbed().setDescription(`Current Bot Prefix is: ${guild.Prefix}`).setColor('#0099ff'));
    }
};

//Help message
function HelpMessage(bot, guild, message, args) {
    //Reply with help message
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`You can use prefix by running *${guild.Prefix}prefix current* to list the current prefix, or *${guild.Prefix}prefix change [new prefix]* to change the prefix.`)
        .addFields(
            { name: 'Required Permissions: ', value: 'Manage Server' },
            {
                name: 'Example: ', value: `${guild.Prefix}prefix [:?current:curr:cur:c]\n` +
                    `${guild.Prefix}prefix [change:ch:=] !`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}