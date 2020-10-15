//Import
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        //Get all message mentions first
        var channelMentions = message.mentions.channels;
        //Get command
        var command = args.shift().toLowerCase();

        //Switch on command
        switch (command) {
            case 'servers': case 'server': case 'serv': case 'ser': case 's':
                if (args.length != 0) {
                    //Get detail
                    var detail = args.shift().toLowerCase();
                    //Switch on detail
                    switch (detail) {
                        case 'counts': case 'count': case 'c':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Server Count:**\n\n${bot.user.username} is part of ${bot.guilds.cache.size} discord servers.`).setColor('#0099ff'));
                            break;
                        case 'names': case 'name': case 'n':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of All Servers:**\n\n${bot.guilds.cache.map((value, key) => value.name).join(', ')}`).setColor('#0099ff'));
                            break;
                        default:
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I did not understand the detail argument you provided.').setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you did not supply the detail arugment.').setColor('#b50909'));
                }
                break;
            case 'totals': case 'total': case 'tot': case 't':
                if (args.length != 0) {
                    //Get detail
                    var detail = args.shift().toLowerCase();
                    //Switch on detail
                    switch (detail) {
                        case 'members': case 'member': case 'm':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Member Count Accross All Servers:**\n\n${bot.users.cache.size}`).setColor('#0099ff'));
                            break;
                        case 'emojis': case 'emoji': case 'e':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Emoji Count Accross All Servers:**\n\n${bot.emojis.cache.size}`).setColor('#0099ff'));
                            break;
                        case 'channels': case 'channel': case 'c':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Channel Count Accross All Servers:**\n\n${bot.channels.cache.size}`).setColor('#0099ff'));
                            break;
                        case 'voices': case 'voice': case 'v':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Voice Channels Accross All Servers:**\n\n${bot.channels.cache.map((v, k) => v).filter(i => i.type == 'voice').length}`).setColor('#0099ff'));
                            break;
                        case 'texts': case 'text': case 't':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Text Channels Accross All Servers:**\n\n${bot.channels.cache.map((v, k) => v).filter(i => i.type == 'text').length}`).setColor('#0099ff'));
                            break;
                        case 'categories': case 'category': case 'categorie': case 'cat':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Categories Accross All Servers:**\n\n${bot.channels.cache.map((v, k) => v).filter(i => i.type == 'category').length}`).setColor('#0099ff'));
                            break;
                        case 'news': case 'new': case 'n':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total News Channels Accross All Servers:**\n\n${bot.channels.cache.map((v, k) => v).filter(i => i.type == 'news').length}`).setColor('#0099ff'));
                            break;
                        case 'stores': case 'store': case 's':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Store Channels Accross All Servers:**\n\n${bot.channels.cache.map((v, k) => v).filter(i => i.type == 'store').length}`).setColor('#0099ff'));
                            break;
                        default:
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I did not understand the detail argument you provided.').setColor('#b50909'));
                            break;
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you did not supply the detail argument.').setColor('#b50909'));
                }
                break;
            case 'countme': case 'cntme': case 'cme': case 'cm':
                if (args.length != 0) {
                    //Get detail
                    var detail = args.shift().toLowerCase();
                    //Switch on detail
                    switch (detail) {
                        case 'members': case 'member': case 'm':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Member Count in this Discord:**\n\n${message.guild.memberCount}`).setColor('#0099ff'));
                            break;
                        case 'emojis': case 'emoji': case 'e':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Emoji Count in this Discord:**\n\n${message.guild.emojis.cache.size}`).setColor('#0099ff'));
                            break;
                        case 'channels': case 'channel': case 'c':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Channel Count in this Discord:**\n\n${message.guild.channels.cache.size}`).setColor('#0099ff'));
                            break;
                        case 'voices': case 'voice': case 'v':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Voice Channels in this Discord:**\n\n${message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'voice').length}`).setColor('#0099ff'));
                            break;
                        case 'texts': case 'text': case 't':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Text Channels in this Discord:**\n\n${message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'text').length}`).setColor('#0099ff'));
                            break;
                        case 'categories': case 'category': case 'cat':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Categories in this Discord:**\n\n${message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'category').length}`).setColor('#0099ff'));
                            break;
                        case 'news': case 'n':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total News Channels in this Discord:**\n\n${message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'news').length}`).setColor('#0099ff'));
                            break;
                        case 'stores': case 'store': case 's':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Store Channels in this Discord:**\n\n${message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'store').length}`).setColor('#0099ff'));
                            break;
                        default:
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I did not understand the detail argument you provided.').setColor('#b50909'));
                            break;
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you did not supply the detail argument.').setColor('#b50909'));
                }
                break;
            case 'list': case 'lis': case 'l':
                if (args.length != 0) {
                    //Get detail
                    var detail = args.shift().toLowerCase();
                    //Switch on detail
                    switch (detail) {
                        case 'members': case 'member': case 'm':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Members in this Discord:**\n\n${cjoin(message.guild.members.cache.map((v, k) => v.user.username), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'emojis': case 'emoji': case 'e':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Emojis in this Discord:**\n\n${cjoin(message.guild.emojis.cache.map((v, k) => v.toString()), ', ', 10, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'channels': case 'channel': case 'c':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Channels in this Discord:**\n\n${cjoin(message.guild.channels.cache.map((v, k) => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'voices': case 'voice': case 'v':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Voice Channels in this Discord:**\n\n` +
                                `${cjoin(message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'voice').map(v => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'texts': case 'text': case 't':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Text Channels in this Discord:**\n\n` +
                                `${cjoin(message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'text').map(v => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'categories': case 'category': case 'cat':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Categories in this Discord:**\n\n` +
                                `${cjoin(message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'category').map(v => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'news': case 'n':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all News Channels in this Discord:**\n\n` +
                                `${cjoin(message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'news').map(v => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'stores': case 'store': case 's':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Store Channels in this Discord:**\n\n` +
                                `${cjoin(message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'store').map(v => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        default:
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I did not understand the detail argument you provided.').setColor('#b50909'));
                            break;
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you did not supply the detail argument.').setColor('#b50909'));
                }
                break;
            case 'counts': case 'count': case 'c':
                if (args.length != 0) {
                    //Check that you mentioned a channel
                    if (channelMentions.size != 0) {
                        //Check that you only mentioned one channel
                        if (channelMentions.size < 2) {
                            //Get detail
                            var detail = args.shift().toLowerCase();
                            //Switch on detail
                            switch (detail) {
                                case 'messages': case 'message': case 'mess': case 'm':
                                    //Send loading message.
                                    message.channel
                                        .send(new Discord.MessageEmbed().setDescription(`Total **Messages** in ${channelMentions.first().toString()}\n\n***Loading....***`).setColor('#FFCC00'))
                                        .then(async function (sent) {
                                            //Fetch all messages and sequentially count them
                                            var totalCount = await sumSequentially(channelMentions.first(), sent, 'Messages');
                                            sent.edit(new Discord.MessageEmbed().setDescription(`Total **Messages** in ${channelMentions.first().toString()}:\n\n${totalCount}`).setColor('#0099ff'));
                                        }).catch((err) => { console.log(err, 'There was a fatal error'); });
                                    break;
                                case 'words': case 'word': case 'wor': case 'wo': case 'w':
                                    //Send loading message.
                                    message.channel
                                        .send(new Discord.MessageEmbed().setDescription(`Total **Words** in ${channelMentions.first().toString()}\n\n***Loading....***`).setColor('#FFCC00'))
                                        .then(async function (sent) {
                                            //Fetch all messages and sequentially count the words.
                                            var totalCount = await sumSequentially(channelMentions.first(), sent, 'Words');
                                            sent.edit(new Discord.MessageEmbed().setDescription(`Total **Words** in ${channelMentions.first().toString()}:\n\n${totalCount}`).setColor('#0099ff'));
                                        }).catch((err) => { console.log(err, 'There was a fatal error'); });
                                    break;
                                case 'characters': case 'character': case 'charact': case 'chara': case 'chars': case 'char': case 'cha': case 'ch': case 'c':
                                    //Send loading message.
                                    message.channel
                                        .send(new Discord.MessageEmbed().setDescription(`Total **Characters** in ${channelMentions.first().toString()}\n\n***Loading....***`).setColor('#FFCC00'))
                                        .then(async function (sent) {
                                            //Fetch all messages and sequentially count the words.
                                            var totalCount = await sumSequentially(channelMentions.first(), sent, 'Characters');
                                            sent.edit(new Discord.MessageEmbed().setDescription(`Total **Characters** in ${channelMentions.first().toString()}:\n\n${totalCount}`).setColor('#0099ff'));
                                        }).catch((err) => { console.log(err, 'There was a fatal error'); });
                                    break;
                                case 'emojis': case 'emoji': case 'emoj': case 'emo': case 'em': case 'e':
                                    //Send loading message.
                                    message.channel
                                        .send(new Discord.MessageEmbed().setDescription(`Total **Emojis** in ${channelMentions.first().toString()}\n\n***Loading....***`).setColor('#FFCC00'))
                                        .then(async function (sent) {
                                            //Fetch all messages and sequentially count the words.
                                            var totalCount = await sumSequentially(channelMentions.first(), sent, 'Emojis');
                                            sent.edit(new Discord.MessageEmbed().setDescription(`Total **Emojis** in ${channelMentions.first().toString()}:\n\n${totalCount}`).setColor('#0099ff'));
                                        }).catch((err) => { console.log(err, 'There was a fatal error'); });
                                    break;
                                default:
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I did not understand the detail argument you provided.').setColor('#b50909'));
                                    break;
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I cannot count from more than one channel.').setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you didn\'t mention a channel for me to check.').setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you did not supply the detail arugment.').setColor('#b50909'));
                }
                break;
            default:
                HelpMessage(bot, guild, message, args);
                break;
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
}

//Functions
function HelpMessage(bot, guild, message, args) {
    //Get random channel
    var randomChannel = message.guild.channels.cache.random();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`Info command allows you to get many different informatics on the bot and it's servers.`)
        .addFields(
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}info [command] [detail] [:?optional excess text]\n\n` +
                    `${guild.Prefix}info [servers:server:serv:ser:s] [detail] *gets details on the servers that ${bot.user.username} is in*\n` +
                    `${guild.Prefix}info [totals:total:tot:t] [detail] *gets the total counts of [details] for all servers that ${bot.user.username} is in*\n` +
                    `${guild.Prefix}info [countme:cntme:cme:cm] [detail] *gets the total counts of [details] for ${message.guild.toString()}*\n` +
                    `${guild.Prefix}info [list:lis:l] [detail] *gets a list of all the [details] for ${message.guild.toString()}*\n` +
                    `${guild.Prefix}info [counts:count:c] [detail] [channel tag] *counts the total [detail] in [tagged channel]*\n`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}info servers [counts:count:c]\n` +
                    `${guild.Prefix}info servers [names:name:n]\n` +
                    `${guild.Prefix}info total [members:member:m]\n` +
                    `${guild.Prefix}info total [emojis:emoji:e]\n` +
                    `${guild.Prefix}info total [channels:channel:c]\n` +
                    `${guild.Prefix}info total [voices:voice:v]\n` +
                    `${guild.Prefix}info total [texts:text:t]\n` +
                    `${guild.Prefix}info total [categories:category:cat]\n` +
                    `${guild.Prefix}info total [news:n]\n` +
                    `${guild.Prefix}info total [stores:store:s]\n` +
                    `${guild.Prefix}info countme [members:member:m]\n` +
                    `${guild.Prefix}info countme [emojis:emoji:e]\n` +
                    `${guild.Prefix}info countme [channels:channel:c]\n` +
                    `${guild.Prefix}info countme [voices:voice:v]\n` +
                    `${guild.Prefix}info countme [texts:text:t]\n` +
                    `${guild.Prefix}info countme [categories:category:cat]\n` +
                    `${guild.Prefix}info countme [news:n]\n` +
                    `${guild.Prefix}info countme [stores:store:s]\n` +
                    `${guild.Prefix}info list [members:member:m]\n` +
                    `${guild.Prefix}info list [emojis:emoji:e]\n` +
                    `${guild.Prefix}info list [channels:channel:c]\n` +
                    `${guild.Prefix}info list [voices:voice:v]\n` +
                    `${guild.Prefix}info list [texts:text:t]\n` +
                    `${guild.Prefix}info list [categories:category:cat]\n` +
                    `${guild.Prefix}info list [news:n]\n` +
                    `${guild.Prefix}info list [stores:store:s]\n` +
                    `${guild.Prefix}info count [messages:message:mess:m] ${randomChannel.toString()}\n`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //set embedded message
    message.channel.send(embeddedHelpMessage);
}

//Custom join
function cjoin(array, seperator = '', splittingDistance = 0, splittingSeperator = '') {
    //If there is no splitting distance then just returned joined array
    if (splittingDistance == 0) return array.join(seperator);
    else {
        var out = '';
        for (var i = 0; i < array.length; i++) {
            if (i % splittingDistance == 0) out += splittingSeperator + array[i];
            else out += seperator + array[i];
        }
        return out;
    }
}

//Sum all message count
async function sumSequentially(channel, message, whatToCount) {
    var sum = 0;
    var last_id;

    while (true) {
        //Create options and update to next message id
        const options = { limit: 100 };
        if (last_id) {
            options.before = last_id;
        }

        //Await fetch messages and sum their total count
        const messages = await channel.messages.fetch(options);

        //Switch on what to count
        switch (whatToCount) {
            case 'Messages':
                sum += messages.size;
                break;
            case 'Words':
                sum += messages.map((v, k) => v.content.split(' ').length).reduce((a, b) => a + b, 0);
                break;
            case 'Characters':
                sum += messages.map((v, k) => v.content.length).reduce((a, b) => a + b, 0);
                break;
            case 'Emojis':
                sum += messages.map((v, k) => v.content.match(/<:[a-zA-Z]+:\d+>/g).length).reduce((a, b) => a + b, 0);
                break;
            default:
                throw 'The whatToCount variable was somehow broken!';
        }
        last_id = messages.last().id;

        //Edit message with new number
        message.edit(new Discord.MessageEmbed().setDescription(`**Total ${whatToCount} in ${channel.toString()}**\n\n*...${sum}...*`).setColor('#FFCC00'));

        //Break when reach the end of messages
        if (messages.size != 100) break;
    }
    return sum;
}