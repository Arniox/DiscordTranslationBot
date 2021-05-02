//Import
const Discord = require('discord.js');
//Import functions
require('../message-commands.js')();

exports.run = (bot, guild, message, command, args) => {
    if (args.lengthj != 0) {
        //Check permissiuons
        if (CanManageMessages(message)) {
            //Get current channel
            var currentChannel = message.channel;

            //Get value
            if (args.length != 0) {
                //Get value
                var value = args.shift();
                //Check if value is actually a number
                if (/^\d+$/.test(value)) {
                    //Grab number from string
                    var numToDelete = parseInt(value);

                    async () => {
                        //Await bulk delete
                        await bulkDeleteSequentially(message.channel, message, numToDelete);
                        //Send message to say finished
                        thisChannel.send(new Discord.MessageEmbed().setDescription(`Deleted ${numToDelete} messages...`).setColor('#0099ff'))
                            .then((newMessage) => {
                                //Delete sent message after 4 seconds
                                newMessage.delete({ timeout: 4000 });
                            });
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${value} is not a valid number.`).setColor('#b50909'));
                }
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, how many messages did you want me to clean?`).setColor('#b50909'));
            }
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you do not have message management permissions.`).setColor('#b50909'));
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
}

//Functions
function HelpMessage(bot, guild, message, args) {
    //Random number
    var randNum = Math.random() * 1000

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`Clean command allows you to clean up a channels messages by bulk.`)
        .addFields(
            { name: 'Required Permissions: ', value: 'Manage Messages' },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}clean [number of messages]`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}clean ${randNum}`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}

//Bulk Delete all messages
async function bulkDeleteSequentially(thisChannel, message, value) {
    //If bulk delete is under 100 then just run once
    if (value <= 100) {
        await thisChannel.bulkDelete(value, true).catch((error) => { throw error; });
    } else {
        var sum = value;
        //Count up by value
        while (true) {
            //Bulk delete
            await thisChannel.bulkDelete(sum, true).catch((error) => { throw error; });
            //Remove 100 from sum
            sum -= 100;
            //Break if sum is bellow zero
            if (sum < 0) break;
        }


    }
}