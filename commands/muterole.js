//Import classes
const Discord = require('discord.js');
const fs = require('fs');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        var roles = message.mentions.roles;
        var direction = args.shift().toLowerCase();

        //Check which direction you want the role to go
        switch (direction) {
            case 'add':
                if (message.member.hasPermission('MANAGE_GUILD')) {
                    if (roles.size != 0) {
                        //Save roles id
                        roles.map((value, key) => {
                            if (bot.config.muteroles.filter(e => e === key).length != 0) {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`${value.toString()} is *already* a mute ignored role.`).setColor('#b50909'));
                            } else {
                                bot.config.muteroles.push(key);
                                //Write to file
                                fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                                //Message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Added: ${value.toString()} to mute ignored roles`).setColor('#09b50c'));
                            }
                        });
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('I did not detect any roles to add/remove...').setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot add or remove mute ignored roles. You need to be a server manager/admin to use these commands.').setColor('#b50909'));
                }
                break;
            case 'remove':
                if (message.member.hasPermission('MANAGE_GUILD')) {
                    if (roles.size != 0) {
                        //Save roles id
                        roles.map((value, key) => {
                            if (bot.config.muteroles.filter(e => e === key).length == 0) {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`${value.toString()} is *not* a mute ignored role.`).setColor('#b50909'));
                            } else {
                                bot.config.muteroles = bot.config.muteroles.filter(e => e !== key);
                                //Write to file
                                fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                                //Message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Removed: ${value.toString()} from mute ignored roles`).setColor('#09b50c'));
                            }
                        });
                    } else {
                        if (args.length != 0) {
                            var isAll = args.shift().toLowerCase();

                            //Check if the user wants to remove all roles
                            switch (isAll) {
                                case 'all':
                                    bot.config.muteroles = [];
                                    //Write to file
                                    fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                                    //Message
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Removed all roles from mute ignored roles').setColor('#09b50c'));
                                    break
                                default:
                                    message.channel.send(new Discord.MessageEmbed().setDescription('I\'m afraid I don\'t understand the command...').setColor('#b50909'));
                                    break;
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('I did not detect a roles to add/remove...').setColor('#b50909'));
                        }
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot add or remove mute ignored roles. You need to be a server manager/admin to use these commands.').setColor('#b50909'));
                }
                break;
            case 'list':
                var output = "";
                bot.config.muteroles.forEach(e => {
                    output = output + message.guild.roles.cache.find(i => i.id = e).toString() + '\n';
                });
                message.channel.send(new Discord.MessageEmbed().setDescription(`${bot.config.muteroles.length} mute ignored roles.\n` + output).setColor('#0099ff'));
                break;
            default:
                HelpMessage(bot, message, args);
                break;
        }
    } else {
        HelpMessage(bot, message, args);
    }
};

function HelpMessage(bot, message, args) {
    var randomRole = message.guild.roles.cache.random().toString();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('The muterole command allows you to add, list, or remove mute ignored roles to the server database.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Manage Server' },
            {
                name: 'Command Patterns: ',
                value: `${bot.config.prefix}muterole [add/remove] [@role]\n\n` +
                    `${bot.config.prefix}muterole remove {optional: all}\n\n` +
                    `${bot.config.prefix}muterole list`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}muterole add ${randomRole}\n\n` +
                    `${bot.config.prefix}muterole remove ${randomRole}\n\n` +
                    `${bot.config.prefix}muterole remove all\n\n` +
                    `${bot.config.prefix}muterole list`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}