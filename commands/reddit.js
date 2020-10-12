//Import
const Discord = require('discord.js');
const moment = require('moment-timezone');

exports.run = (bot, guild, message, args) => {
    //Check that args exist
    if (args.length != 0) {
        //Get command
        var command = args.shift().toLowerCase();

        //Switch on command
        switch (command) {
            case 'subscribe': case 'sub': case 's':
                //Check if has perms
                if (message.member.hasPermission('MANAGE_GUILD')) {
                    //Get reddit name
                    if (args.length != 0) {
                        var redditName = args.shift().toLowerCase();

                        //Check that there is a name
                        if (redditName) {
                            //Get mentions
                            var channelMention = message.mentions.channels;

                            //Check that you have mentioned only 1 channel
                            if (channelMention.size != 0) {
                                if (channelMention.size < 2) {
                                    //Post loading message
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Loading... Please wait...`).setColor('#FFCC00'))
                                        .then((loadingSent) => {
                                            //Check if there exists a reddit at all of this name
                                            bot.reddit.get('/api/search_reddit_names', {
                                                query: `${redditName}`,
                                                exact: true,
                                                include_over_18: true,
                                                include_unadvertisable: true
                                            }).then((sub) => {
                                                //Found sub reddit
                                                //Get all flairs for this sub reddit
                                                bot.reddit.get(`/r/${sub.names[0]}/about`).then(async (details) => {
                                                    //Get full name
                                                    var subTitle = details.data.title;
                                                    var subDescription = details.data.public_description;
                                                    var subIcon = (details.data.icon_img ?
                                                        details.data.icon_img : details.data.community_icon.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/gi)[0]);
                                                    var subHeader = details.data.header_img;
                                                    var subSubscribers = details.data.subscribers;
                                                    var subCreated = moment(details.data.created * 1000);
                                                    var subColour = details.data.primary_color;

                                                    //Get flairs
                                                    var subFlairs;
                                                    try {
                                                        subFlairs = await bot.reddit.get(`/r/${sub.names[0]}/api/link_flair_v2`);
                                                    } catch { }

                                                    //Get redditpost command
                                                    const redditcmd = bot.commands.get("redditpost");
                                                    //If command doesn't exist, exit and do nothing
                                                    if (!redditcmd)
                                                        return loadingSent.edit(new Discord.MessageEmbed().setDescription(`There was a fatal error somewhere in the bot's internal systems. Apologies`).setColor('#FFCC00'));

                                                    //If sub flairs are enabled
                                                    if (subFlairs && subFlairs.length > 0) {
                                                        //Get emojis in loop to add to the number of flairs
                                                        var emojis = emojiRandom(subFlairs.length);
                                                        emojis.push('❌');

                                                        console.log(`What flair filter do you want to add for ${sub.names[0]}?\n` +
                                                            `Unfortunately I am limited with what flairs I can filter by since I may not be a moderator of this subreddit.\n\n` +
                                                            `${subFlairs.map((i, index) => `${emojis[index]} - **${i.text}**`).join('\n')}\n❌ - No Filter`);

                                                        //Create new entry. Edit message
                                                        loadingSent.edit(new Discord.MessageEmbed().setDescription(`What flair filter do you want to add for ${sub.names[0]}?\n` +
                                                            `Unfortunately I am limited with what flairs I can filter by since I may not be a moderator of this subreddit.\n\n` +
                                                            `${subFlairs.map((i, index) => `${emojis[index]} - **${i.text}**`).join('\n')}\n❌ - No Filter`).setColor('#FFCC00'))
                                                            .then((sent) => {
                                                                reactLoop(sent, emojis, 0)
                                                                    .then(() => {
                                                                        //Set up emoji reaction filter
                                                                        const filter = (reaction, user) => {
                                                                            return emojis.includes(reaction.emoji.name) && user.id === message.author.id;
                                                                        }
                                                                        //Create reaction collector
                                                                        const collector = sent.createReactionCollector(filter, { max: 1, time: 20000 });

                                                                        //Await reaction collector on collect
                                                                        collector.on('collect', (reaction, user) => {
                                                                            //Get sub flair
                                                                            var flairName;
                                                                            if (reaction.emoji.name === '❌') //If the reaction is X (should be the final index, at i > subFlairs.length)
                                                                                flairName = '';
                                                                            else //Otherwise get index of reaction for subFlair index (X should never be a problem here)
                                                                                flairName = subFlairs.map(i => i.text)[emojis.indexOf(reaction.emoji.name)];
                                                                            //Stop collector and return flairname as reason
                                                                            collector.stop(flairName);
                                                                        });
                                                                        //Await reaction collector on stop
                                                                        collector.on('end', (c, reason) => {
                                                                            //If not reacted or reason is empty, then no flair given
                                                                            var flairName = (c.size != 0 ? (reason ? reason : '') : '');

                                                                            //Add subbed sub reddit
                                                                            const create_sql = `
                                                                            INSERT INTO server_subbed_reddits (SubName, SubImage, ChannelId, ServerId, Flair_Filter)
                                                                                VALUES ("${sub.names[0]}", "${subIcon}", "${channelMention.first().id}", "${message.guild.id}", "${flairName}")
                                                                            `;
                                                                            bot.con.query(create_sql, (error, results, fields) => {
                                                                                if (error) return console.error(error); //Return error console log

                                                                                //Remove all reactions
                                                                                sent.reactions.removeAll()
                                                                                    .then(() => {
                                                                                        //Edit message
                                                                                        sent.edit(new Discord.MessageEmbed()
                                                                                            .setColor(subColour)
                                                                                            .setAuthor(sub.names[0], subIcon)
                                                                                            .setDescription(`Successfully subscribed **${sub.names[0]}** to ${channelMention.first().toString()} ` +
                                                                                                `${flairName ? `with a flair filter of ${flairName}` : ''}`)
                                                                                            .setImage(subHeader)
                                                                                            .addFields(
                                                                                                { name: 'Subreddit: ', value: `*${subTitle}*` },
                                                                                                { name: 'Description: ', value: `*${subDescription}*` },
                                                                                                { name: 'Subscriber Count: ', value: `*${subSubscribers}*` },
                                                                                                { name: 'Created On: ', value: `*${subCreated.format('lll')}*` }
                                                                                            ));
                                                                                        //Run redditpost command once
                                                                                        redditcmd.run(bot);
                                                                                    }).catch(error => { return; });
                                                                            });
                                                                        });
                                                                    }).catch(() => { return; }); //Most likely the channel was deleted mid react, or the message was deleted
                                                            });
                                                    } else {
                                                        //Create new entry. Send message
                                                        //Add subbed sub reddit
                                                        const create_sql = `
                                                        INSERT INTO server_subbed_reddits (SubName, SubImage, ChannelId, ServerId)
                                                            VALUES ("${sub.names[0]}", "${subIcon}", "${channelMention.first().id}", "${message.guild.id}")
                                                        `;
                                                        bot.con.query(create_sql, (error, results, fields) => {
                                                            if (error) return console.error(error); //Return error console log

                                                            //Send message
                                                            loadingSent.edit(new Discord.MessageEmbed()
                                                                .setColor(subColour)
                                                                .setAuthor(sub.names[0], subIcon)
                                                                .setDescription(`Successfully subscribed **${sub.names[0]}** to ${channelMention.first().toString()}\n` +
                                                                    `**${sub.names[0]}** does not have flair customisation enabled or I am not a moderator for this subreddit. Flair filter is not possible unfortunately.`)
                                                                .setImage(subHeader)
                                                                .addFields(
                                                                    { name: 'Subreddit: ', value: `*${subTitle}*` },
                                                                    { name: 'Description: ', value: `*${subDescription}*` },
                                                                    { name: 'Subscriber Count: ', value: `*${subSubscribers}*` },
                                                                    { name: 'Created On: ', value: `*${subCreated.format('lll')}*` }
                                                                )).then(() => {
                                                                    //Run redditpost command once
                                                                    redditcmd.run(bot);
                                                                });
                                                        });
                                                    }
                                                }).catch((err) => {
                                                    console.error(err);
                                                    loadingSent.edit(new Discord.MessageEmbed().setDescription(`Sorry, I could not find a subreddit with the name of: ${redditName}`).setColor('#b50909'));
                                                });
                                            }).catch((err) => {
                                                loadingSent.edit(new Discord.MessageEmbed().setDescription(`Sorry, I could not find a subreddit with the name of: ${redditName}`).setColor('#b50909'));
                                            });
                                        });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you cannot output one sub reddit to multiple channels.\n` +
                                        `If you want to do this for different flair filters for example; simply run the command again and select a different channel. Or even the same channel.`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you didn't select any channel to post reddit posts to.`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`You did not supply a subreddit for me to subscribe to.`).setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`You did not supply a subreddit for me to subscribe to.`).setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you must have Server Management perms to subscribe a subreddit to ${message.guild.toString()}`).setColor('#b50909'));
                }
                break;
            case 'unsubscribe': case 'unsub': case 'uns': case 'us':
                //Check if member has perms
                if (message.member.hasPermission('MANAGE_GUILD')) {
                    var query = args.shift();

                    //Check if query exists
                    if (query) {
                        //Check if query is actually a number
                        if (/^\d+$/.test(query)) {
                            var numberSelector = parseInt(query);

                            //Look for existing patterns
                            const sql_cmd = `
                            SELECT * FROM server_subbed_reddits
                                WHERE ServerId = "${message.guild.id}"
                            `;
                            bot.con.query(sql_cmd, (error, results, fields) => {
                                if (error) return console.error(error); //Return error console log

                                //Find existing
                                if (results.map(v => v.Id).includes(numberSelector)) {
                                    //Save for message
                                    var existingSubReddit = results.find(i => i.Id == numberSelector);

                                    //Delete existing subreddit
                                    const delete_cmd = `
                                    DELETE FROM server_subbed_reddits
                                        WHERE Id = "${numberSelector}"
                                        AND ServerId = "${message.guild.id}"
                                    `;
                                    bot.con.query(delete_cmd, (error, results, fields) => {
                                        if (error) return console.error(error); //Return error console log

                                        //Message
                                        message.channel.send(new Discord.MessageEmbed()
                                            .setColor('#09b50c')
                                            .setAuthor(existingSubReddit.SubName, existingSubReddit.SubImage)
                                            .setDescription(`Successfully unsubscribed **${existingSubReddit.SubName}** ` +
                                                `${existingSubReddit.Flair_Filter ? `with flair filter of **${existingSubReddit.Flair_Filter}** ` : 'with no flair filter '}` +
                                                `from ${message.guild.channels.cache.get(existingSubReddit.ChannelId).toString()}\n`));
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I couldn\'t find the subscribed subreddit with the Id of **${numberSelector}**`).setColor('#b50909'));
                                }
                            });
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`${query} is not a number I can get an index of.`).setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`I did not see any subscription to remove sorry.`).setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you must have Server Management perms to unsubscribe from a subreddit.`).setColor('#b50909'));
                }
                break;
            case 'list': case 'li': case 'l':
                //Look for existing subreddits
                const sql_cmd = `
                SELECT * FROM server_subbed_reddits
                    WHERE ServerId = "${message.guild.id}"
                `;
                bot.con.query(sql_cmd, (error, results, fields) => {
                    if (error) return console.error(error); //Return error console log

                    //For loop them into an output
                    var output = "";
                    for (var i = 0; i < results.length; i++) {
                        //Create output per sub reddit
                        output += `Id: **${results[i].Id}**, Subreddit: **${results[i].SubName}**${results[i].Flair_Filter ? `, with flair filter of: **${results[i].Flair_Filter}**` : ''}` +
                            ` - ${message.guild.channels.cache.get(results[i].ChannelId).toString()}\n`;
                    }
                    //Send message
                    message.channel.send(new Discord.MessageEmbed().setDescription(`${results.length} Subscribed Subreddits.\n${output}`).setColor('#0099ff'));
                });
                break;
            default:
                Helpmessage(bot, guild, message, args);
                break;
        }
    } else {
        Helpmessage(bot, guild, message, args);
    }
}

//Loop with reaction sending
function reactLoop(message, emojis, i) {
    if (i < emojis.length)
        return message.react(emojis[i])
            .then(() => reactLoop(message, emojis, i + 1))
            .catch((err) => { throw err; }); //Most likely the channel was deleted mid react, or the message was deleted
}

//Functions
function Helpmessage(bot, guild, message, args) {
    //Get random channel
    var randomChannel = message.guild.channels.cache.random();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Reddit command. Allows you to subscribe to different subreddits and send reddit posts to discord channels.')
        .addFields(
            {
                name: 'Note: ',
                value: `Subscribing to a new subreddit will open a filter message where you can react to it,` +
                    ` to filter the sub reddit posts by flair.`
            },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}reddit [subscribe:sub:s / unsubscribe:unsub:uns:us / list:li:l] [sub reddit name] [channel tag]\n` +
                    `${guild.Prefix}reddit subscribe [sub reddit name] [channel tag]\n` +
                    `${guild.Prefix}reddit unsubscribe [subscription Id *(can be found with ${guild.Prefix}reddit list)*]\n` +
                    `${guild.Prefix}reddit list`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}reddit subscribe jokes ${randomChannel.toString()}\n` +
                    `${guild.Prefix}reddit unsubscribe jokes`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}

//List of all emojis
const emojis = [
    '⚫', '🔵', '🟤', '🟢', '🟠', '🟣', '🔴', '⚪', '🟡',
    '🟦', '🟫', '🟩', '🟧', '🟪', '🟥', '⬜', '🟨',
    '🖤', '💙', '🤎', '💚', '🧡', '💜', '🤍', '💛',
    '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'
];

//Get random emojis
function emojiRandom(count) {
    //Shuffle
    var list = emojis;
    return (count > emojis.length ? list : list.splice(0, count));
}