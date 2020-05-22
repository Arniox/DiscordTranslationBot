//Import classes
const Discord = require('discord.js');
const fs = require('fs');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        var command = args.shift().toLowerCase();

        //Check which option
        switch (command) {
            case 'change':
                if (message.member.hasPermission('ADMINISTRATOR')) {
                    var query = args.shift(); //Cut down command to only 10 characters
                    if (query.length < 10) {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`The bancommand must be at least 10 characters.` +
                            ` ${query} is only ${query.length} characters long.`).setColor('#b50909'));
                    } else {
                        //Check if the query exists
                        if (query) {
                            var previousBanCommand = bot.config.bancommand.bancommand;

                            //Change bancommand
                            bot.config.bancommand.bancommand = query.split("").splice(0, 10).join('');
                            //Reset bancommand tries
                            bot.config.bancommand["bancommand-tries"].attempted = "";
                            bot.config.bancommand["bancommand-tries"]["current-attempted-length"] = 0;
                            bot.config.bancommand["bancommand-tries"].tries = 0;
                            bot.config.bancommand["bancommand-tries"]["total-tries"] = 0;
                            //Save old command
                            bot.config.bancommand["previous-bancommand"].push(previousBanCommand);
                            //Write to file
                            fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                            //Message prykie
                            message.guild.members.cache
                                .find(i => i.id == '341134882120138763')
                                .send(new Discord.MessageEmbed().setDescription(`${message.author.username}, an Admin, has changed the ban command` +
                                    ` manually to ${bot.config.bancommand.bancommand}. Don\'t tell anyone.`).setColor('#FFCC00'));
                            //Message
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Changed Prykie ban command from: ${previousBanCommand} to: ${bot.config.bancommand.bancommand}`).setColor('#09b50c'));
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I cannot change the Prykie ban command to nothing!').setColor('#b50909'));
                        }
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have administrative powers and cannot use this command!').setColor('#b50909'));
                }
                break;
            default:
                HelpMessage(bot, message, args);
                break;
        }
    } else {
        if (message.member.hasPermission('ADMINISTRATOR') || message.member.id == '341134882120138763') {
            var messageEmbedded = new Discord.MessageEmbed()
                .setDescription(`Bancommand info for Prykie ban command:`)
                .addFields(
                    {
                        name: 'Command:',
                        value: `Current Random Prykie Command: ***${bot.config.bancommand.bancommand}***`
                    },
                    {
                        name: 'Previous Command: ',
                        value: `The previous command used was ***${(bot.config.bancommand["previous-bancommand"].length != 0 ?
                            bot.config.bancommand["previous-bancommand"][bot.config.bancommand["previous-bancommand"].length - 1] :
                            "nothing")}***`,
                        inline: true
                    },
                    {
                        name: 'Command History: ',
                        value: `***${bot.config.bancommand["previous-bancommand"].length != 0 ? `${bot.config.bancommand["previous-bancommand"].join(', ')}` : 'No Command History'}***`,
                        inline: true
                    },
                    {
                        name: 'Previous Command Winner: ',
                        value: `The person who figured out the last command ***(${(bot.config.bancommand["previous-bancommand"].length != 0 ?
                            bot.config.bancommand["previous-bancommand"][bot.config.bancommand["previous-bancommand"].length - 1] :
                            "nothing")})*** was ***${(bot.config.bancommand["previous-bancommand-winner"] != "" ? bot.config.bancommand["previous-bancommand-winner"] : "noone")}***`
                    },
                    {
                        name: 'Hinted Player:',
                        value: `Last random hinted player that was online at the time was: ` +
                            `***${(bot.config.bancommand["hinted-member"] != "" ? bot.config.bancommand["hinted-member"] : "noone")}***`
                    },
                    {
                        name: 'Attempts',
                        value: `***${bot.config.bancommand["bancommand-tries"]["total-tries"]}*** total attemps and ` +
                            `***${20 - bot.config.bancommand["bancommand-tries"].tries}*** tries left before the next hint.`,
                        inline: true
                    },
                    {
                        name: 'Players have tried:',
                        value: `So far, the closest guess is up to ` +
                            `***${(bot.config.bancommand["bancommand-tries"].attempted != "" ? bot.config.bancommand["bancommand-tries"].attempted : "no guesses yet")}***`
                    }
                )
                .setColor('#0099ff');

            message.channel.send(messageEmbedded);
            //Send to prykie as well
            message.guild.members.cache.find(i => i.id == '341134882120138763').send(messageEmbedded);
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have administrative powers and cannot use this command!').setColor('#b50909'));
        }
    }
};

function HelpMessage(bot, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Lets admins view and change the currently randomly generated Prykie ban command. It is always a three (10) letter/number command with no prefix.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Administrator' },
            {
                name: 'Command Patterns: ',
                value: `${bot.config.prefix}bancommand\n\n${bot.config.prefix}bancommand [change] [new 10 character ban command]`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}bancommand\n\n` +
                    `${bot.config.prefix}bancommand change ${CreateCommand(10, bot)}\n\n` +
                    `${bot.config.prefix}bancommand change ${CreateCommand(20, bot)}` +
                    ` (This will automatically cut away the rest of the command change the command to the first 10 characters).\n\n` +
                    `${bot.config.prefix}bancommand change ${CreateCommand(4, bot)}` +
                    ` (This will not work and will give you an error. The command must be 10 characters long).`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Set embedded message
    message.channel.send(embeddedHelpMessage);
}

//Get random string of length
function CreateCommand(length, bot) {
    var result = '',
        characters = bot.datatouse["strings-to-chose-for-ban-command"],
        charactersLength = characters.length;
    for (var i = 0; i < length; ++i)
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}