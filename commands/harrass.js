//Import classes
const Discord = require('discord.js');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        var person = message.mentions.members;

        if (message.member.hasPermission('ADMINISTRATOR')) {
            if (args.length != 0 && person.size != 0) {
                if (person.size < 2) {
                    args.shift(); //Shift down past mention

                    if (args.length != 0) {
                        var numberSelector = args.shift();

                        //Check if numberSelector is actually a number
                        if (/^\d+$/.test(numberSelector)) {
                            //Grab number from string
                            var numberOfSpam = parseInt(numberSelector);

                            if (args.length != 0) {
                                //Get message
                                var messageToSpam = args.join(" ");

                                message.channel
                                    .send(new Discord.MessageEmbed().setDescription(`Harrassing ${person.first().toString()} with 0 / ${numberOfSpam} messages.\n\n` +
                                        `Content of message: ***${messageToSpam}***`).setColor('#FFCC00'))
                                    .then((sent) => {
                                        //For loop
                                        for (var i = 0; i < numberOfSpam + 1; ++i) {
                                            person.first().send(`${messageToSpam}`); //Send message

                                            //Edit message
                                            sent.edit(new Discord.MessageEmbed().setDescription(`Harrassing ${person.first().toString()} ` +
                                                `with ${i} / ${numberOfSpam} messages.\n\nContent of message: ***${messageToSpam}***`).setColor('#FFCC00'));
                                        }
                                        //Update after loop
                                        sent.edit(new Discord.MessageEmbed().setDescription(`✅ Finished Harrassing ${person.first().toString()} ` +
                                            `with ${i} / ${numberOfSpam} messages.\n\nContent of message: ***${messageToSpam}***`).setColor('#09b50c'));
                                    });
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I cannot harrass ${person.first().toString()} with an empty message.`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${numberSelector} is not a number.`).setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you didn\'t select the number of spam messages to send.`).setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you can only harrass one person at a time.').setColor('#b50909'));
                }
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you didn\'t select anyone to harrass.').setColor('#b50909'));
            }
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need administrative powers for this command.').setColor('#b50909'));
        }
    } else {
        Helpmessage(bot, message, args);
    }
};

//Functions
function Helpmessage(bot, message, args) {
    var randomPerson = message.guild.members.cache.random();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`Use this command to spam a mentioned member with any number of messages. Useful to get them to listen to you. Only available to administrators.`)
        .addFields(
            { name: 'Required Permissions: ', value: 'Administrator' },
            {
                name: 'Command Patterns: ',
                value: `${bot.config.prefix}harrass [number] [member mention] [message]`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}harrass 10 ${randomPerson.toString()} Hello, wake up. It's wakey wakey time!`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Set embedded message
    message.channel.send(embeddedHelpMessage);
}