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
                    var query = args.shift(); //Cut down command to only 3 characters

                    //Check if the query exists
                    if (query) {
                        var previousBanCommand = bot.config.bancommand;

                        //Change bancommand
                        bot.config.bancommand = query.split("").splice(0, 3).join('');
                        //Reset bancommand tries
                        bot.config["bancommand-tries"].attempted = "";
                        bot.config["bancommand-tries"]["current-attempted-length"] = 0;
                        bot.config["bancommand-tries"].tries = 0;
                        bot.config["bancommand-tries"]["total-tries"] = 0;
                        //Save old command
                        bot.config["previous-bancommand"].push(previousBanCommand);
                        //Write to file
                        fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                        //Message prykie
                        message.guild.members.cache
                            .find(i => i.id == '341134882120138763')
                            .send(new Discord.MessageEmbed().setDescription(`${message.author.username}, an Admin, has changed the ban command` +
                                ` manually to ${bot.config.bancommand}. Don\'t tell anyone.`).setColor('#FFCC00'));
                        //Message
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Changed Prykie ban command from: ${previousBanCommand} to: ${bot.config.bancommand}`).setColor('#09b50c'));
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I cannot change the Prykie ban command to nothing!').setColor('#b50909'));
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
        if (message.member.hasPermission('ADMINISTRATOR')) {
            var messageEmbedded = new Discord.MessageEmbed()
                .setDescription(`Bancommand info for Prykie ban command:`)
                .addFields(
                    {
                        name: 'Command:',
                        value: `Current Random Prykie Command: ***${bot.config.bancommand}***`
                    },
                    {
                        name: 'Previous Command: ',
                        value: `The previous command used was ***${(bot.config["previous-bancommand"].length != 0 ?
                            bot.config["previous-bancommand"][bot.config["previous-bancommand"].length - 1] :
                            "nothing")}***`,
                        inline: true
                    },
                    {
                        name: 'Command History: ',
                        value: `***${bot.config["previous-bancommand"].length != 0 ? `${bot.config["previous-bancommand"].join(', ')}` : 'No Command History'}***`,
                        inline: true
                    },
                    {
                        name: 'Previous Command Winner: ',
                        value: `The person who figured out the last command ***(${(bot.config["previous-bancommand"].length != 0 ?
                            bot.config["previous-bancommand"][bot.config["previous-bancommand"].length - 1] :
                            "nothing")})*** was ***${(bot.config["previous-bancommand-winner"] != "" ? bot.config["previous-bancommand-winner"] : "noone")}***`
                    },
                    {
                        name: 'Hinted Player:',
                        value: `Last random hinted player that was online at the time was: ***${(bot.config["hinted-member"] != "" ? bot.config["hinted-member"] : "noone")}***`
                    },
                    {
                        name: 'Attempts',
                        value: `${bot.config["bancommand-tries"]["total-tries"]} total attemps and \`${20 - bot.config["bancommand-tries"].tries}\` tries left before the next hint.`,
                        inline: true
                    },
                    {
                        name: 'Players have tried:',
                        value: `So far, the closest guess is up to ***${(bot.config["bancommand-tries"].attempted != "" ? bot.config["bancommand-tries"].attempted : "no guesses yet")}***`
                    }
                )
                .setColor('#0099ff');

            message.channel.send(messageEmbedded);
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have administrative powers and cannot use this command!').setColor('#b50909'));
        }
    }
};

function HelpMessage(bot, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Lets admins view and change the currently randomly generated Prykie ban command. It is always a three (3) letter/number command with no prefix.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Administrator' },
            {
                name: 'Command Patterns: ',
                value: `${bot.config.prefix}bancommand\n\n${bot.config.prefix}bancommand [change] [new 3 character ban command]`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}bancommand\n\n` +
                    `${bot.config.prefix}bancommand change ${CreateCommand(3, bot)}\n\n` +
                    `${bot.config.prefix}bancommand change ${CreateCommand(10, bot)}` +
                    ` (This will automatically cut away the rest of the command change the command to the first 3 characters).`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Set embedded message
    message.channel.send(embeddedHelpMessage);
}

//Get random string of length
function CreateCommand(length) {
    var result = '',
        characters = dataToUse["strings-to-chose-for-ban-command"],
        charactersLength = characters.length;
    for (var i = 0; i < length; ++i)
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}