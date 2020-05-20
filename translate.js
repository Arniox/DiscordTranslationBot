//Import classes
const Discord = require('discord.js');
const fs = require('fs');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        var command = args.shift().toLowerCase();

        //Check which option you want
        switch (command) {
            case 'add': //Add a pattern
                //Check if has perms
                if (message.member.hasPermission('MANAGE_GUILD')) {
                    var query = args.join("");

                    //Check if query exists
                    if (query) {
                        //Add pattern
                        bot.config["translate-ignored-patterns"].push(query);
                        //Write to file
                        fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                        //Message
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Add new pattern to translation ignored patterns:\n${query}`).setColor('#09b50c'));
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('I did not see any pattern to add sorry.').setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to add or remove translation ignore patterns.').setColor('#b50909'));
                }
                break;
            case 'remove': //Remove specific pattern
                //Check if has perms
                if (message.member.hasPermission('MANAGE_GUILD')) {
                    var query = args.shift();

                    //Check if query exists
                    if (query) {
                        //Check if query is actually a number
                        if (/^\d+$/.test(query)) {
                            var numberSelector = parseInt(query) + 1;
                            //Find existing
                            if (numberSelector >= bot.config["translate-ignored-patterns"].length) {
                                var existingPattern = bot.config["translate-ignored-patterns"][numberSelector];
                                if (existingPattern) {
                                    //Remove pattern
                                    bot.config["translate-ignored-patterns"] = bot.config["translate-ignored-patterns"].splice(numberSelector, 1);
                                    //Write to file
                                    fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                                    //Message
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Removed\n***${existingPattern}***\nfrom the translation ignored patterns.`).setColor('#09b50c'));
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I couldn\'t find this quote for some reason...`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`The ${Ordinal(numberSelector)} ` +
                                    ` translation ignored pattern does not exist sorry.`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`${query} is not a number I can get an index of.`).setColor('#b50909'))
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('I did not see any pattern to remove sorry.').setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to add or remove translation ignore patterns.').setColor('#b50909'));
                }
                break;
            case 'patterns': //List out current patterns
                var output = "";
                for (var i = 0; i < bot.config["translate-ignored-patterns"].length; ++i) {
                    output = `${output} Pattern ${i + 1} - ***${bot.config["translate-ignored-patterns"][i].toString()}***\n`;
                }
                message.channel.send(new Discord.MessageEmbed().setDescription(`${bot.config["translate-ignored-patterns"].length} translation ignored patterns.\n${output}`).setColor('#0099ff'));
                break;
            default:
                message.channel.send(new Discord.MessageEmbed().setDescription('Did you want to add or remove a translation pattern?').setColor('#b50909'));
                break;
        }
    } else {
        HelpMessage(bot, message, args);
    }
};

//Functions
function HelpMessage(bot, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('[WIP] Currently the command works, but the Regex patterns don\'t do anything. This command allows you to list, add, and remove Regex patterns for the translation to ignore.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Manage Server (for adding and removing. Everyone else can use list the current patterns).' },
            {
                name: 'Command Patterns: ',
                value: `${bot.config.prefix}translate [add/remove] [pattern / (Remove by index)]\n\n${bot.config.prefix}translate patterns`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}translate add /(<:[A-Za-z]+:\d+>)/gi\n\n` +
                    `${bot.config.prefix}translate remove 1\n\n` +
                    `${bot.config.prefix}translate patterns`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}

//Ordinal
function Ordinal(number) {
    var ones = number % 10;
    var tens = (number / 10).floor() % 10;
    var stuff = "";

    if (tens == 1) {
        stuff = "th";
    } else {
        switch (ones) {
            case 1:
                stuff = "st";
                break;
            case 2:
                stuff = "nd";
                break;
            case 3:
                stuff = "rd";
                break;
            default:
                stuff = "th";
        }
    }

    return number.toString() + stuff;
}