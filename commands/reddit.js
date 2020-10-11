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
                                                    var subIcon = details.data.icon_img;
                                                    var subHeader = details.data.header_img;
                                                    var subSubscribers = details.data.subscribers;
                                                    var subCreated = moment(details.data.created * 1000);

                                                    //Get flairs
                                                    var subFlairs;
                                                    try {
                                                        subFlairs = await bot.reddit.get(`/r/${sub.names[0]}/api/link_flair_v2`);
                                                    } catch { }

                                                    //If sub flairs are enabled
                                                    if (subFlairs && subFlairs.length > 0) {
                                                        //Get emojis in loop to add to the number of flairs
                                                        var emojis = emojiRandom(subFlairs.length);
                                                        emojis.push('❌');

                                                        //Create new entry. Edit message
                                                        loadingSent.edit(new Discord.MessageEmbed().setDescription(`What flair filter do you want to add for ${sub.names[0]}\n\n` +
                                                            `${subFlairs.map((i, index) => `${emojis[index]} - **${i.text}**`).join('\n')}\n❌ - No Filter`).setColor('#FFCC00'))
                                                            .then(async (sent) => {
                                                                new Promise((resolve, reject) => {
                                                                    //Auto react
                                                                    for (emoji of emojis) await sent.react(emoji);
                                                                    resolve(sent);
                                                                }).then((sent) => {
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
                                                                        if (reaction === '❌') //If the reaction is X (should be the final index, at i > subFlairs.length)
                                                                            flairName = '';
                                                                        else //Otherwise get index of reaction for subFlair index (X should never be a problem here)
                                                                            flairName = subFlairs.map(i => i.text)[emojis.indexOf(reaction.emoji.name)];

                                                                        //Stop collector and return flairname as reason
                                                                        collector.stop(flairName);
                                                                    });
                                                                    //Await reaction collector on stop
                                                                    collector.on('stop', (c, reason) => {
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
                                                                                        .setColor('#09b50c')
                                                                                        .setAuthor(sub.names[0], subIcon)
                                                                                        .setDescription(`Successfully subscribed **${sub.names[0]}** to ${channelMention.first().toString()} ` +
                                                                                            `${flairName ? `with a flair filter of ${flairName}` : ''}`)
                                                                                        .setImage(`${subHeader}`)
                                                                                        .addFields(
                                                                                            { name: 'Subreddit: ', value: `*${subTitle}*` },
                                                                                            { name: 'Description: ', value: `*${subDescription}*` },
                                                                                            { name: 'Subscriber Count: ', value: `*${subSubscribers}*` },
                                                                                            { name: 'Created On: ', value: `*${subCreated.format('lll')}*` }
                                                                                        ));
                                                                                }).catch(error => { return; });
                                                                            collector.stop();
                                                                        });
                                                                    });
                                                                }).catch(error => {
                                                                    sent.edit(new Discord.MessageEmbed().setDescription('There was an error of some sort...').setColor('#b50909'));
                                                                });
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
                                                                .setColor('#09b50c')
                                                                .setAuthor(sub.names[0], subIcon)
                                                                .setDescription(`Successfully subscribed **${sub.names[0]}** to ${channelMention.first().toString()}\n` +
                                                                    `**${sub.names[0]}** does not have flair customisation enabled and I am not a mod for this subreddit. Flair filter is not possible unfortunately.`)
                                                                .setImage(`${subHeader}`)
                                                                .addFields(
                                                                    { name: 'Subreddit: ', value: `*${subTitle}*` },
                                                                    { name: 'Description: ', value: `*${subDescription}*` },
                                                                    { name: 'Subscriber Count: ', value: `*${subSubscribers}*` },
                                                                    { name: 'Created On: ', value: `*${subCreated.format('lll')}*` }
                                                                ));
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
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you cannot output one sub reddit to multiple channels.`).setColor('#b50909'));
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
                break;
            case 'list': case 'li': case 'l':
                break;
            default:
                Helpmessage(bot, guild, message, args);
                break;
        }
    } else {
        Helpmessage(bot, guild, message, args);
    }
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
                    `${guild.Prefix}reddit unsubscribe [sub reddit name]\n` +
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