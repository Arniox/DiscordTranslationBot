//Import
const Discord = require('discord.js');
//Import functions

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
                                message.WaffleResponse(`Deleting ${numToDelete} messages...`, MTYPE.Information, null, false, null, currentChannel)
                                    .then((newMessage) => {
                                        //Delete sent message after 4 seconds
                                        newMessage.delete({ timeout: 4000 });
                                    }).catch(() => {
                                        return console.log('I think a channel was deleted during a clean command.');
                                    });
                            })();
                        } else {
                            message.WaffleResponse(`Sorry, ${value} is not a valid number.`);
                        }
                    } else {
                        message.WaffleResponse(`Sorry, how many messages did you want me to clean?`);
                    }
                } else {
                    message.WaffleResponse(`Sorry, you do not have message management permissions.`);
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
    //Send embedded message
    message.WaffleResponse(
        `Clean command allows you to clean up a channels messages by bulk.`,
        MTYPE.Error,
        [
            { name: 'Required Permissions: ', value: 'Manage Messages' },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}clean [number of messages]`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}clean ${randNum}`
            }
        ],
        true, 'Thanks, and have a good day'
    );
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