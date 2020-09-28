//Import classes
const googleApiKey = process.env.GOOGLE_API_KEY;
const Discord = require('discord.js');
const googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });
const fs = require('fs');

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        //Get command
        var command = args.shift().toLowerCase();

        //If this guild is not allowed to use translation commands
        if (guild.Allowed_Translation == 1) {
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

                                //Check if query exists
                                if (query) {
                                    //look for an existing pattern of the exact same kind
                                    const sql_cmd = `
                                    SELECT * FROM translation_ignored_patterns
                                        WHERE ServerId = "${message.guild.id}"
                                    `;
                                    bot.con.query(sql_cmd, (error, results, fields) => {
                                        if (error) return console.error(error); //Return error console log

                                        //Check if pattern already exists
                                        if (!results.map(v => v.Pattern).includes(query)) {
                                            //Create new entry. Send message
                                            message.channel
                                                .send(new Discord.MessageEmbed().setDescription(`What description do you want to add for the translation ignored pattern:\n***${query}***`).setColor('#FFCC00'))
                                                .then((sent) => {
                                                    //Message filter and collector
                                                    const filter = m => m.member.id == message.member.id && m.content;
                                                    const collector = sent.channel.createMessageCollector(filter, { time: 20000 });

                                                    //Await message collector on collect
                                                    collector.on('collect', m => {
                                                        m.delete({ timeout: 100 }); //Delete message

                                                        //Add pattern
                                                        const create_cmd = `
                                                        INSERT INTO translation_ignored_patterns (Reason, Pattern, ServerId)
                                                            VALUES ("${m.content}", "${query}", "${message.guild.id}")
                                                        `;
                                                        bot.con.query(create_cmd, (error, results, fields) => {
                                                            if (error) return console.error(error); //Return error console log

                                                            //Edit message
                                                            sent.edit(new Discord.MessageEmbed().setDescription(`Successfull added new pattern to translation ignored patterns:\n***${query}***`).setColor('#09b50c'));
                                                            collector.stop();
                                                        });
                                                    });
                                                    //Await message collector on end
                                                    collector.on('end', m => {
                                                        //Do not add pattern
                                                        if (m.size == 0)
                                                            //Edit message
                                                            sent.edit(new Discord.MessageEmbed().setDescription(`No pattern description for ***${query}*** was provided in 20s. Pattern was not added to translation ignored patterns.`).setColor('#b50909'));
                                                    });
                                                })
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`Pretty sure ***${query}*** is already a translation ignored pattern.`).setColor('#FFCC00'));
                                        }
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('I did not see any pattern to add sorry.').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have manage server permissions.').setColor('#b50909'));
                            }
                            break;
                        case 'remove': //Remove a pattern by id
                            //Check if has perms
                            if (message.member.hasPermission('MANAGE_GUILD')) {
                                var query = args.shift();

                                //Check if query exists
                                if (query) {
                                    //Check if query is actually a number
                                    if (/^\d+$/.test(query)) {
                                        var numberSelector = parseInt(query);

                                        //Look for existing patterns
                                        const sql_cmd = `
                                        SELECT * FROM translation_ignored_patterns
                                            WHERE ServerId = "${message.guild.id}"
                                        `;
                                        bot.con.query(sql_cmd, (error, results, fields) => {
                                            if (error) return console.error(error); //Return error console log

                                            //Find existing
                                            if (results.map(v => v.Id).includes(numberSelector)) {
                                                //Save for message
                                                var existingPattern = results.find(i => i.Id == numberSelector).Pattern;

                                                //Delete existing pattern
                                                const delete_cmd = `
                                                DELETE FROM translation_ignored_patterns
                                                    WHERE Id = "${numberSelector}"
                                                    AND ServerId = "${message.guild.id}"
                                                `;
                                                bot.con.query(delete_cmd, (error, results, fields) => {
                                                    if (error) return console.error(error); //Return error console log

                                                    //Message
                                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Removed\n***${existingPattern}***\nfrom the translation ignored patterns.`).setColor('#09b50c'));
                                                });
                                            } else {
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`I couldn\'t find the pattern with the Id of ${numberSelector}`).setColor('#b50909'));
                                            }
                                        });
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`${query} is not a number I can get an index of.`).setColor('#b50909'));
                                    }
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('I did not see any pattern to remove sorry.').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have manage server permissions.').setColor('#b50909'));
                            }
                            break;
                        case 'list': //List all patterns
                            //Look for existing patterns
                            const sql_cmd = `
                            SELECT * FROM translation_ignored_patterns
                                WHERE ServerId = "${message.guild.id}"
                            `;
                            bot.con.query(sql_cmd, (error, results, fields) => {
                                if (error) return console.error(error); //Return error console log

                                //For loop them into an output
                                var output = "";
                                for (var i = 0; i < results.length; i++) {
                                    //Create output per pattern
                                    output += `Id: *${results[i].Id}*, Desc: *${results[i].Reason}* - ***${results[i].Pattern.toString()}***\n`;
                                }
                                //Send message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`${results.length} translation ignored patterns.\n${output}`).setColor('#0099ff'));
                            });
                            break;
                        default:
                            HelpMessage(bot, guild, message, args);
                            break;
                    }
                    break;
                case 'channel':
                    var specifics = args.shift().toLowerCase();
                    switch (specifics) {
                        case 'add': //Add a channel
                            //Check if has perms
                            if (message.member.hasPermission('MANAGE_GUILD')) {
                                //Get mentions
                                var channelMentions = message.mentions.channels.map((v, k) => v);

                                //Check if channel exists
                                if (channelMentions.size != 0) {

                                    //Message
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`**Adding 0 / ${channelMentions.size} new channel(s) to translation ignored channels:**`).setColor('#FFCC00'))
                                        .then((sent) => {
                                            //Count channels added and count channels not added
                                            var channelsAdded = { "string": "", "count": 0 };
                                            var channelsNot = { "string": "", "count": 0 };
                                            var overallCount = 0;

                                            //Look for existing channels
                                            const sql_cmd = `
                                            SELECT * FROM translation_ignored_channels
                                                WHERE ServerId = "${message.guild.id}"
                                            `;
                                            bot.con.query(sql_cmd, (error, results, fields) => {
                                                if (error) return console.error(error); //Return error console log

                                                //Check each mentioned channel
                                                channelMentions.forEach((c) => {
                                                    //Count
                                                    overallCount++;

                                                    //Check if exists in the database
                                                    if (!results.map(v => v.ChannelId).includes(c.id)) {
                                                        //Add channel to database
                                                        const add_sql = `
                                                        INSERT INTO translation_ignored_channels (ChannelId, ServerId)
                                                            VALUES ("${c.id}", "${message.guild.id}")
                                                        `;
                                                        bot.con.query(add_sql, (error, results, fields) => {
                                                            if (error) return console.error(error); //Return error console log
                                                        });
                                                        //Edit message
                                                        channelsAdded.string += `${c.toString()}\n`;
                                                        channelsAdded.count++;
                                                    } else {
                                                        //Edit message
                                                        channelsNot.string += `${c.toString()}\n`;
                                                        channelsNot.count++;
                                                    }
                                                    //Edit
                                                    if (overallCount == channelMentions.length) //Finish after loop
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`✅ **Adding ${channelsAdded.count} / ${channelMentions.length} new channel(s) to translation ignored channels:**\n` +
                                                            `${channelsAdded.string}\n**${channelsNot.count} where not added because they where already being translated ignored:**\n${channelsNot.string}`).setColor('#09b50c'))
                                                    else
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`**Adding ${channelsAdded.count} / ${channelMentions.length} new channel(s) to translation ignored channels:**\n` +
                                                            `${channelsAdded.string}\n**${channelsNot.count} where not added because they where already being translated ignored:**\n${channelsNot.string}`).setColor('#FFCC00'));
                                                });
                                            });
                                        });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you did not supply a channel(s).').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have manage server permissions.').setColor('#b50909'));
                            }
                            break;
                        case 'remove': //Remove a channel by tag
                            //Check if has perms
                            if (message.member.hasPermission('MANAGE_GUILD')) {
                                //Get mentioned channels
                                var channelMentions = message.mentions.channels.map((v, k) => v);

                                //Check if channels where mentioned
                                if (channelMentions.size != 0) {

                                    //Message
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`**Removing 0 / ${channelMentions.size}** channel(s) from the translation ignored channels:**`).setColor('#FFCC00'))
                                        .then((sent) => {
                                            //Count channels added and count channels not added
                                            var channelsRemoved = { "string": "", "count": 0 };
                                            var channelsNot = { "string": "", "count": 0 };
                                            var overallCount = 0;

                                            //Look for existing channels
                                            const sql_cmd = `
                                            SELECT * FROM translation_ignored_channels
                                                WHERE ServerId = "${message.guild.id}"
                                            `;
                                            bot.con.query(sql_cmd, (error, results, fields) => {
                                                if (error) return console.error(error); //Return error console log

                                                //Check each mentioned channel
                                                channelMentions.forEach((c) => {
                                                    //Count
                                                    overallCount++;

                                                    //Check if exists in the database
                                                    if (results.map(v => v.ChannelId).includes(c.id)) {
                                                        //Remove channel from database
                                                        const remove_sql = `
                                                        DELETE FROM translation_ignored_channels
                                                            WHERE ChannelId = "${c.id}"
                                                            AND ServerId = "${message.guild.id}"
                                                        `;
                                                        bot.con.query(remove_sql, (error, results, fields) => {
                                                            if (error) return console.error(error); //Return error console log
                                                        });
                                                        //Edit message
                                                        channelsRemoved.string += `${c.toString()},\n`;
                                                        channelsRemoved.count++;
                                                    } else {
                                                        //Add to the output for channels not removed
                                                        channelsNot.string += `${c.toString()},\n`;
                                                        channelsNot.count++;
                                                    }
                                                    //Edit
                                                    if (overallCount == channelMentions.length) //Finish after loop
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`✅ **Removed ${channelsRemoved.count} / ${channelMentions.length} channel(s) from the translation ignored channels:**\n` +
                                                            `${channelsRemoved.string}\n**${channelsNot.count} where not removed because they where already not in the translation ignored list:**\n${channelsNot.string}`).setColor('#09b50c'));
                                                    else
                                                        //Message
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`**Removing ${channelsRemoved.count} / ${channelMentions.length} channel(s) from the translation ignored channels:**\n` +
                                                            `${channelsRemoved.string}\n**${channelsNot.count} where not removed because they where already not in the translation ignored list:**\n${channelsNot.string}`).setColor('#FFCC00'));
                                                });
                                            });
                                        });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you did not supply a channel(s).').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you do not have manage server permissions.').setColor('#b50909'));
                            }
                            break;
                        case 'list': //List all channels
                            //Get list of channels
                            const sql_cmd = `
                            SELECT * FROM translation_ignored_channels
                                WHERE ServerId = "${message.guild.id}"
                            `;
                            bot.con.query(sql_cmd, (error, results, fields) => {
                                if (error) return console.error(error); //Return error console log

                                //Send Message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`**${results.length} translation ignored channels.**\n` +
                                    `${message.guild.channels.cache.map((v, k) => v).filter(i => results.map(v => v.ChannelId).includes(i.id)).map(v => v.toString()).join(',\n')}`).setColor('#0099ff'));
                            });
                            break;
                        default:
                            HelpMessage(bot, guild, message, args);
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
                        var outputLangs = new Discord.MessageEmbed().setDescription(`** Language Names:**\n ** React with ➡️ to view languages names and ⬅️ to go back to codes.**\n\n` +
                            `${value.map(i => i.name).join(', ')} `).setColor('#0099ff');
                        var outputCodes = new Discord.MessageEmbed().setDescription(`** Language Codes:**\n ** React with ⬅️ to view languages codes and ➡️ to go back to names.**\n\n` +
                            `${value.map(i => i.language).join(', ')} `).setColor('#0099ff');

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
                                            sent.reactions.cache.map((v, k) => v).filter(reaction => reaction.users.cache.has(user.id)).first().users.remove(user.id);
                                            //Empty the collector and reset the timer
                                            collector.empty();
                                            collector.resetTimer();
                                        });
                                        //Await end
                                        collector.on('end', r => {
                                            //Remove reactions and then edit edit message
                                            sent.reactions.removeAll()
                                                .then(() => {
                                                    sent.edit(new Discord.MessageEmbed().setDescription(`${value.map(i => i.language).join(', ')} \n\n` +
                                                        `You can view the list of supported languages again with: ***${guild.Prefix} translate languages*** `).setColor('#09b50c'));
                                                }).catch((error) => { return; });
                                        });
                                    });
                            });
                    }).catch((err) => {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`${err} `).setColor('#b50909'));
                    });
                    break;
                default:
                    HelpMessage(bot, guild, message, args);
                    break;
            }
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, your discord server is dissallowed to use translation commands. This is a premium service.`).setColor('#b50909'));
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
};

//Functions
function HelpMessage(bot, guild, message, args) {
    var randomChannel = message.guild.channels.cache.random();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('This command allows you to list, add and remove translation ignored channels and translation ignored RegEx patterns. Also allows you to list out the languages supported.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Manage Server (for adding and removing. Everyone else can use the list commands).' },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix} translate[pattern / channel][add / remove / list] {
                            (pattern / tagged channel(s)) / number (Remove by index)}\n\n` +
                    `${guild.Prefix}translate [languages/language]`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}translate pattern add /(<:[A-Za-z]+:\d+>)/gi\n\n` +
                    `${guild.Prefix}translate pattern remove 1\n\n` +
                    `${guild.Prefix}translate pattern list\n\n` +
                    `${guild.Prefix}translate channel add ${randomChannel.toString()} *You can tag multiple to add*\n\n` +
                    `${guild.Prefix}translate channel remove ${randomChannel.toString()}\n\n` +
                    `${guild.Prefix}translate channel list\n\n` +
                    `${guild.Prefix}translate [languages/language]\n\n`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}