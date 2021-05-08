//Import
const Discord = require('discord.js');
const message = require('../events/message.js');
//Import functions
require('../message-commands.js')();

exports.run = (bot, guild, message, command, args) => {
    message.delete()
        .then(() => {
            if (args.length != 0) {
                //Check permissions
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

                            (async () => {
                                //Await bulk delete
                                await new Promise(async (resolve, reject) => {
                                    await bulkDeleteSequentially(currentChannel, numToDelete);
                                    resolve();
                                });
                                //Send message to say finished
                                currentChannel.send(new Discord.MessageEmbed().setDescription(`Deleting ${numToDelete} messages...`).setColor('#0099ff'))
                                    .then((newMessage) => {
                                        //Delete sent message after 4 seconds
                                        newMessage.delete({ timeout: 4000 });
                                    }).catch(() => {
                                        return console.log('I think a channel was deleted during a clean command.');
                                    });
                            })();
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
        });
}

//Functions
function HelpMessage(bot, guild, message, args) {
    //Random number
    var randNum = (Math.random() * 1000).round();

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
async function bulkDeleteSequentially(thisChannel, value) {
    //If bulk delete is under 100 then just run once
    if (value <= 100) {
        //Create options and update to next message id
        const options = { limit: value };

        //Await fetch messages and delete
        const messages = await thisChannel.messages.fetch(options);

        //For each message, delete them
        await messages.map(async function (v, k) {
            await v.delete(); //Delete message
        });
    } else {
        var sum = value;
        var last_id;
        //Count up by value
        while (true) {
            //Create options
            const options = { limit: (sum > 100 ? 100 : sum) }
            if (last_id) {
                options.before = last_id;
            }

            //Await fetch messages and delete
            const messages = await thisChannel.messages.fetch(options);

            //For each message, delete them
            await messages.map(async function (v, k) {
                await v.delete(); //Delete message
            });

            //Remove 100 from sum
            sum -= 100;
            last_id = messages.last().id;

            //Break if sum is bellow zero
            if (sum < 0) break;
        }
    }
}