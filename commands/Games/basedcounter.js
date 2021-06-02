//Import classes
const Discord = require('discord.js');
//Import functions


exports.run = (bot, guild, message, command, args) => {
    if (!message.content) return;

    //Switch on command
    switch (command) {
        case 'count':
            //Search for server
            const based_counter_cmd = `
            SELECT * FROM based_counter
                WHERE ServerId = "${message.guild.id}"
            `;
            bot.con.query(based_counter_cmd, (error, results, fields) => {
                if (error) return console.error(error); //Return error console log

                //Get based counter
                var counter = parseInt(results[0].Based_Counter);
                var outPutChannel = (results[0].Channel_Output_Id ?
                    message.guild.channels.cache.get(results[0].Channel_Output_Id) : message.channel);

                //Update based counter
                const update_based_counter_cmd = `
                UPDATE based_counter
                SET Based_Counter = ${counter + 1}
                WHERE ServerId = "${message.guild.id}"
                `;
                bot.con.query(update_based_counter_cmd, (error, results, fields) => {
                    if (error) return console.error(error); //Throw error and return
                    //Send message
                    message.WaffleResponse(`Based Counter: ${counter + 1}`, MTYPE.Information, null, false, null, outPutChannel, ATYPE.None);
                });
            });
            break;
        default:
            if (args.length != 0) {
                //Get server based counter output name
                const query_cmd = `
                SELECT * FROM based_counter
                    WHERE ServerId = "${message.guild.id}"
                `;
                bot.con.query(query_cmd, (error, results, fields) => {
                    if (error) return console.error(error); //Throw error and return

                    //Get based counter output channel name
                    var basedCounterChannel = (results[0].Channel_Output_Id ?
                        message.guild.channels.cache.get(results[0].Channel_Output_Id).toString() : '**Default**');

                    //Get command
                    var command = args.shift().toLowerCase();
                    //Check which option you want
                    switch (command) {
                        case 'channel':
                            if (args.length != 0) {
                                //Get option
                                var option = args.shift().toLowerCase();
                                //Switch on option
                                switch (option) {
                                    case 'set': case 's': case '=':
                                        //Set the output channel
                                        //Get channel mentions
                                        var channelMentions = message.mentions.channels.map((v, k) => v);

                                        //Check if user has perms
                                        if (IsManager(message)) {
                                            if (channelMentions.length != 0) {
                                                if (channelMentions.length < 2) {
                                                    //Set based counter output channel to selected channel
                                                    //Update the based counter
                                                    const update_cmd = `
                                                    UPDATE based_counter
                                                    SET Channel_Output_Id = "${channelMentions.first().id}"
                                                    WHERE ServerId = "${message.guild.id}"
                                                    `;
                                                    bot.con.query(update_cmd, (error, results, fields) => {
                                                        if (error) return console.error(error); //Throw error and return
                                                        //Message
                                                        message.WaffleResponse(`Changed server based counter output channel from ${basedCounterChannel} to ${channelMentions.first().toString()}`, MTYPE.Success);
                                                    });
                                                } else {
                                                    message.WaffleResponse(`Sorry, I cannot output based counter to more than 1 channel.`);
                                                }
                                            } else {
                                                message.WaffleResponse(`Sorry, you did not specify a channel to output to.`);
                                            }
                                        } else {
                                            message.WaffleResponse(`Sorry, you need to have server management permissions to change the based counter output channel.`);
                                        }
                                        break;
                                    case 'default': case 'def': case 'd':
                                        //Set the output channel to default

                                        //Check if user has perms
                                        if (IsManager(message)) {
                                            //Set based counter output channel to default (NULL)
                                            //Update the based counter
                                            const update_cmd = `
                                            UPDATE based_counter
                                            SET Channel_Output_Id = NULL
                                            WHERE ServerId = "${message.guild.id}"
                                            `;
                                            bot.con.query(update_cmd, (error, results, fields) => {
                                                if (error) return console.error(error); //Throw error and return
                                                //Message
                                                message.WaffleResponse(`Changed server based counter output channel from ${basedCounterChannel} to **Default**`, MTYPE.Success);
                                            });
                                        } else {
                                            message.WaffleResponse(`Sorry, you need to have server management permissions to change the based counter output channel.`);
                                        }
                                        break;
                                    default:
                                        HelpMessage(bot, guild, message, args);
                                        break;
                                }
                            } else {
                                HelpMessage(bot, guild, message, args);
                            }
                            break;
                        default:
                            HelpMessage(bot, guild, message, args);
                            break;
                    }
                });
            } else {
                HelpMessage(bot, guild, message, args);
            }
            break;
    }
}

//Help message
function HelpMessage(bot, guild, message, args) {
    //Reply with help message
    message.WaffleResponse(
        `The based counter auto counts the number of based messages sent over all time.\n` +
        `Setting the output from default will make sure all based replies will post into a specific channel.`,
        MTYPE.Error,
        [
            { name: 'Required Permissions:', value: 'Manage Server' },
            {
                name: 'Example: ', value: `${guild.Prefix}based [channel:chan:c] [set:s:= / default:def:d]\n`
            }
        ],
        true, 'Thanks, and have a good day'
    );
}