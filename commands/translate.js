//Import classes
const googleApiKey = process.env.GOOGLE_API_KEY;
const { ifError } = require('assert');
const Discord = require('discord.js');
const googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });
const fs = require('fs');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        //Get command
        var command = args.shift().toLowerCase();

        //Check for either patterns or channels
        switch (command) {
            case 'pattern':
                //Get the specific command you want to perform
                var specifics = args.shift().toLowerCase();
                switch (specifics) {
                    case 'add': //Add a pattern
                        //Check if has perms
                        if (message.member.hasPermission('MANAGE_GUILD')) {
                            var query = args.join("");

                            //Check if quiery exists
                            if (query) {
                                //Add pattern
                                bot.config.google["translate-ignored-patterns"].push(query);
                                //Write to file
                                fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                                //Message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Added new pattern to translation ignored patterns:\n${query}`).setColor('#09b50c'));
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('I did not see any pattern to add sorry.').setColor('#b50909'));
                            }
                        }
                        break;
                    case 'remove': //Remove a pattern by index
                        //Check if has perms
                        if (message.member.hasPermission('MANAGE_GUILD')) {
                            var query = args.shift();

                            //Check if query exists
                            if (query) {
                                //Check if query is actually a number
                                if (/^\d+$/.test(query)) {
                                    var numberSelector = parseInt(query) - 1;
                                    //Find existing
                                    if (numberSelector < bot.config.google["translate-ignored-patterns"].length && numberSelector > -1) {
                                        var existingPattern = bot.config.google["translate-ignored-patterns"][numberSelector];
                                        if (existingPattern) {
                                            //Remove pattern
                                            bot.config.google["translate-ignored-patterns"].splice(numberSelector, 1);
                                            //Write to file
                                            fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                                            //Message
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`Removed\n***${existingPattern}***\nfrom the translation ignored patterns.`).setColor('#09b50c'));
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I couldn\'t find this quote for some reason...`).setColor('#b50909'));
                                        }
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`The ${Ordinal(numberSelector + 1)} ` +
                                            ` translation ignored pattern does not exist sorry.`).setColor('#b50909'));
                                    }
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`${query} is not a number I can get an index of.`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('I did not see any pattern to remove sorry.').setColor('#b50909'));
                            }
                        }
                        break;
                    case 'list': //List all patterns
                        var output = "";
                        for (var i = 0; i < bot.config.google["translate-ignored-patterns"].length; ++i) {
                            //Create output per pattern
                            output = `${output} Pattern: *${i + 1}*, Desc: *${bot.config.google["translate-ignored-patterns"][i].name}* ` +
                                `- ***${bot.config.google["translate-ignored-patterns"][i].pattern.toString()}***\n`;
                        }
                        message.channel.send(new Discord.MessageEmbed().setDescription(`${bot.config.google["translate-ignored-patterns"].length} translation ignored patterns.\n${output}`).setColor('#0099ff'));
                        break;
                    default:
                        HelpMessage(bot, message, args);
                        break;
                }

                break;
            case 'channel':
                var specifics = args.shift().toLowerCase();
                switch (specifics) {
                    case 'add': //Add a channel
                        break;
                    case 'remove': //Remove a channel by tag
                        break;
                    case 'list': //List all channels
                        break;
                    default:
                        HelpMessage(bot, message, args);
                        break;
                }
                break;
            case 'languages': case 'language':
                new Promise((resolve, reject) => {
                    googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                        if (!err) resolve(languageCodes);
                    });
                }).then((value) => {
                    //Send messages for list of languages
                    var outputLangs = new Discord.MessageEmbed().setDescription(`**Language Codes:**\n**React with ➡️ to view languages names and ⬅️ to go back to codes.**\n\n` +
                        `${value.map(i => i.name).join(', ')}`).setColor('#0099ff');
                    var outputCodes = new Discord.MessageEmbed().setDescription(`**Language Codes:**\n**React with ⬅️ to view languages codes and ➡️ to go back to names.**\n\n` +
                        `${value.map(i => i.language).join(', ')}`).setColor('#0099ff');


                    //Send embedded message
                    message.channel
                        .send(outputCodes)
                        .then((sent) => {
                            sent.react('⬅️')
                                .then(() => sent.react('➡️'))
                                .then(() => {
                                    //Set up emoji reaction filter.
                                    const filter = (reaction, user) => {
                                        return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
                                    };
                                    //Create reaction collector
                                    const collector = sent.createReactionCollector(filter, { max: 1, time: 30000 });

                                    //Await reaction
                                    collector.on('collect', (reaction, user) => {
                                        if (reaction.emoji.name === '➡️') { //Go forward
                                            //Edit to out put languages
                                            sent.edit(outputLangs);
                                        } else if (reaction.emoji.name === '⬅️') { //Go backward
                                            //Edit to out put codes
                                            sent.edit(outputCodes);
                                        }

                                        //Remove reaction by user
                                        sent.reactions.cache.map((v, k) => v).filter(reaction = reaction.users.cache.has(user.id)).first().users.remove(user.id);
                                        //Empty the collector and reset the timer
                                        collector.empty();
                                        collector.resetTimer();
                                    });
                                    //Await end
                                    collector.on('end', r => {
                                        //Remove reactions and then edit edit message
                                        sent.reactions.removeAll()
                                            .then(() => {
                                                sent.edit(new Discord.MessageEmbed().setDescription(`View languages message has been disabled. ` +
                                                    `You can view the list of supported languages again with: ***${bot.config.prefix}translate languages***`).setColor('#09b50c'));
                                            }).catch((error) => { return; });
                                    });
                                })
                        })
                }).catch((err) => {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`${err}`).setColor('#b50909'));
                });
                break;
            default:
                HelpMessage(bot, message, args);
                break;
        }
    } else {
        HelpMessage(bot, message, args);
    }
};

//Functions
function HelpMessage(bot, message, args) {
    var randomChannel = message.guild.channels.cache.random();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('This command allows you to list, add and remove translation ignored channels and translation ignored RegEx patterns. Also allows you to list out the languages supported.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Manage Server (for adding and removing. Everyone else can use the list commands).' },
            {
                name: 'Command Patterns: ',
                value: `${bot.config.prefix}translate [pattern/channel] [add/remove/list] {number (Remove by index)}\n\n` +
                    `${bot.config.prefix}translate [languages/language]`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}translate pattern add /(<:[A-Za-z]+:\d+>)/gi\n\n` +
                    `${bot.config.prefix}translate pattern remove 1\n\n` +
                    `${bot.config.prefix}translate pattern list\n\n` +
                    `${bot.config.prefix}translate channel add ${randomChannel.toString()}\n\n` +
                    `${bot.config.prefix}translate channel remove ${randomChannel.toString()}\n\n` +
                    `${bot.config.prefix}translate channel list\n\n` +
                    `${bot.config.prefix}translate [languages/language]\n\n`
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