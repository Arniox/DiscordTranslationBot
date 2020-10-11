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
                    var redditName = args.shift().toLowerCase();

                    //Check that there is a name
                    if (redditName) {
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
                                    var emojis = [];
                                    for (var i = 0; i < subFlairs.length; i++)
                                        fetch('https://ranmoji.herokuapp.com/emojis/api/v.1.0/')
                                            .then(response => {
                                                response.json().then(data => {
                                                    emojis.push(data.emoji);
                                                });
                                            });

                                    console.log(emojis);


                                    //Create new entry. Send message
                                    // message.channel
                                    //     .send(new Discord.MessageEmbed().setDescription(`What flair filter do you want to add for ${res.names[0]}`).setColor('#FFCC00'))
                                    //     .then((sent) => {

                                    //     });
                                } else {

                                }
                            }).catch((err) => {
                                return console.error(err);
                            });
                        }).catch((err) => {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I could not find a subreddit with the name of: ${redditName}`).setColor('#b50909'));
                        });

                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`You did not supply a sub reddit for me to subscribe to.`).setColor('#b50909'));
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