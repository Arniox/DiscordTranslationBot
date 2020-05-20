//Import classes
const Discord = require('discord.js');
const fs = require('fs');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        //Get option
        var command = args.shift().toLowerCase();

        //Check which option you want
        switch (command) {
            case 'add': //Add prykie quote
                var query = args.join(' ');

                //Check if query exists
                if (query) {
                    //Check if already existing
                    if (!bot.datatouse["prykie-quotes"].find(i => i === query)) {
                        //Add quote
                        bot.datatouse["prykie-quotes"].push(query);
                        //Write to file
                        fs.writeFileSync('./data-to-use.json', JSON.stringify(bot.datatouse));
                        //Message
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Added ${query} to the data base.`).setColor('#09b50c'));
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`${query} already exists in the data base. You can use *${bot.config.prefix}` +
                            `prykie list* to view the current list of Prykie quotes.`).setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('You didn\'t write any Prykie quote to add.').setColor('#b50909'));
                }
                break;
            case 'remove': //Remove prykie quote
                if (message.member.hasPermission('MANAGE_GUILD')) {
                    var query = args.join(' ');

                    //Check if query exists
                    if (query) {
                        //Check if query is actually a number
                        if (/^\d+$/.test(query)) {
                            var numberSelector = parseInt(query) - 1;
                            //Find existing
                            if (numberSelector < bot.datatouse["prykie-quotes"].length && numberSelector > -1) {
                                var existingQuote = bot.datatouse["prykie-quotes"][numberSelector];
                                if (existingQuote) {
                                    //Remove quote
                                    bot.datatouse["prykie-quotes"] = bot.datatouse["prykie-quotes"].splice(numberSelector, 1);
                                    //Write to file
                                    fs.writeFileSync('./data-to-use.json', JSON.stringify(bot.datatouse));
                                    //Message
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Removed***\n${existingQuote}***\nfrom the data base.`).setColor('#09b50c'));
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('I couldn\'t find this quote for some reason...').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`The ${Ordinal(numberSelector)} quote does not exist sorry.`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`${query} is not a number I can get an index of.`).setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`You didn\'t select a quote number to remove. You can use *${bot.config.prefix}` +
                            `prykie list* to view the current list of Prykie quotes.`).setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to be a server manager/admin to remove a prykie quote.').setColor('#b50909'));
                }
                break;
            case 'list': //List all prykie quotes
                var output = "";
                for (var i = 0; i < bot.datatouse["prykie-quotes"].length; ++i) {
                    output = `${output} Quote ${i + 1} - ***${bot.datatouse["prykie-quotes"][i]}***\n`;
                }
                message.channel.send(new Discord.MessageEmbed().setDescription(`${bot.datatouse["prykie-quotes"].length} prykie quotes.\n${output}`).setColor('#0099ff'));
                break;
            default:
                HelpMessage(bot, message, args);
                break;
        }
    } else {
        if (bot.datatouse["prykie-quotes"].length != 0) {
            var findRandom = bot.datatouse["prykie-quotes"][Math.floor(SiteRand(bot.datatouse["prykie-quotes"].length - 1, 0))];
            //Message
            message.channel.send(findRandom);
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I didn\'t find any prykie quotes to use :(').setColor('#b50909'));
        }
    }
};

//Functionms
function HelpMessage(bot, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('The prykie command allows you to list, add, remove or print out a random prykie quote. Removing a quote needs server management permissions.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Just for removing quotes; Manage Server is needed.' },
            {
                name: 'Command Patterns: ',
                value: `${bot.config.prefix}prykie\n\n` +
                    `${bot.config.prefix}prykie [add/remove] [quote]\n\n` +
                    `${bot.config.prefix}prykie list`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}prykie\n\n` +
                    `${bot.config.prefix}prykie add I love massive black cocks!\n\n` +
                    `${bot.config.prefix}prykie remove I love massive black cocks!\n\n` +
                    `${bot.config.prefix}prykie list`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}

//Random
function SiteRand(high, low) {
    return Math.random() * (high - low) + low;
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