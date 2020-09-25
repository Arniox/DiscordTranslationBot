const Discord = require('discord.js');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        //Get all message mentions first
        var channelMentions = message.mentions.channels;
        //Get command
        var command = args.shift().toLowerCase();

        //Switch on command
        switch (command) {
            case 'servers':
                if (args.length != 0) {
                    //Get detail
                    var detail = args.shift().toLowerCase();
                    //Switch on detail
                    switch (detail) {
                        case 'count':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Server Count:**\n\n${bot.user.username} is part of ${bot.guilds.cache.size} discord servers.`).setColor('#0099ff'));
                            break;
                        case 'names': case 'name':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of All Servers:**\n\n${bot.guilds.cache.map((value, key) => value.name).join(', ')}`).setColor('#0099ff'));
                            break;
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you did not supply the detail arugment.').setColor('#b50909'));
                }
                break;
            case 'total':
                if (args.length != 0) {
                    //Get detail
                    var detail = args.shift().toLowerCase();
                    //Switch on detail
                    switch (detail) {
                        case 'members':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Member Count Accross All Servers:**\n\n${bot.users.cache.size}`).setColor('#0099ff'));
                            break;
                        case 'emojis':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Emoji Count Accross All Servers:**\n\n${bot.emojis.cache.size}`).setColor('#0099ff'));
                            break;
                        case 'channels':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Channel Count Accross All Servers:**\n\n${bot.channels.cache.size}`).setColor('#0099ff'));
                            break;
                        case 'voice':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Voice Channels Accross All Servers:**\n\n${bot.channels.cache.map((v, k) => v).filter(i => i.type == 'voice').length}`).setColor('#0099ff'));
                            break;
                        case 'text':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Text Channels Accross All Servers:**\n\n${bot.channels.cache.map((v, k) => v).filter(i => i.type == 'text').length}`).setColor('#0099ff'));
                            break;
                        case 'categories':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Categories Accross All Servers:**\n\n${bot.channels.cache.map((v, k) => v).filter(i => i.type == 'category').length}`).setColor('#0099ff'));
                            break;
                        case 'news':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total News Channels Accross All Servers:**\n\n${bot.channels.cache.map((v, k) => v).filter(i => i.type == 'news').length}`).setColor('#0099ff'));
                            break;
                        case 'store':
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
            case 'countme':
                if (args.length != 0) {
                    //Get detail
                    var detail = args.shift().toLowerCase();
                    //Switch on detail
                    switch (detail) {
                        case 'members':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Member Count in this Discord:**\n\n${message.guild.memberCount}`).setColor('#0099ff'));
                            break;
                        case 'emojis':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Emoji Count in this Discord:**\n\n${message.guild.emojis.cache.size}`).setColor('#0099ff'));
                            break;
                        case 'channels':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Channel Count in this Discord:**\n\n${message.guild.channels.cache.size}`).setColor('#0099ff'));
                            break;
                        case 'voice':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Voice Channels in this Discord:**\n\n${message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'voice').length}`).setColor('#0099ff'));
                            break;
                        case 'text':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Text Channels in this Discord:**\n\n${message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'text').length}`).setColor('#0099ff'));
                            break;
                        case 'categories':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total Categories in this Discord:**\n\n${message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'category').length}`).setColor('#0099ff'));
                            break;
                        case 'news':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**Total News Channels in this Discord:**\n\n${message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'news').length}`).setColor('#0099ff'));
                            break;
                        case 'store':
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
            case 'list':
                if (args.length != 0) {
                    //Get detail
                    var detail = args.shift().toLowerCase();
                    //Switch on detail
                    switch (detail) {
                        case 'members':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Members in this Discord:**\n\n${cjoin(message.guild.members.cache.map((v, k) => v.user.username), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'emojis':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Emojis in this Discord:**\n\n${cjoin(message.guild.emojis.cache.map((v, k) => v.toString()), ', ', 10, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'channels':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Channels in this Discord:**\n\n${cjoin(message.guild.channels.cache.map((v, k) => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'voice':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Voice Channels in this Discord:**\n\n` +
                                `${cjoin(message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'voice').map(v => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'text':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Text Channels in this Discord:**\n\n` +
                                `${cjoin(message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'text').map(v => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'categories':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all Categories in this Discord:**\n\n` +
                                `${cjoin(message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'category').map(v => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'news':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`**List of all News Channels in this Discord:**\n\n` +
                                `${cjoin(message.guild.channels.cache.map((v, k) => v).filter(i => i.type == 'news').map(v => v.name), ', ', 5, '\n')}`).setColor('#0099ff'));
                            break;
                        case 'store':
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
            case 'count':
                if (args.length != 0) {
                    //Check that you mentioned a channel
                    if (channelMentions.size != 0) {
                        //Check that you only mentioned one channel
                        if (channelMentions.size < 2) {
                            //Get detail
                            var detail = args.shift().toLowerCase();
                            //Switch on detail
                            switch (detail) {
                                case 'messages':
                                    //Send loading message.
                                    message.channel
                                        .send(new Discord.MessageEmbed().setDescription(`**Total Messages in ${channelMentions.first().toString()}**\n\n***Loading....***`).setColor('#FFCC00'))
                                        .then(async function (sent) {
                                            //Fetch all messages and sequentially count them
                                            var totalCount = await sumSequentially(channelMentions.first());
                                            sent.edit(new Discord.MessageEmbed().setDescription(`**Total Messages in ${channelMentions.first().toString()}:**\n\n${totalCount}`).setColor('#0099ff'));
                                        });
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
                HelpMessage(bot, message, args);
                break;
        }
    } else {
        HelpMessage(bot, message, args);
    }
}

//Functions
function HelpMessage(bot, message, args) {
    var randomChannel = message.guild.channels.cache.random();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`Info command allows you to get many different informatics on the bot and it's servers.`)
        .addFields(
            {
                name: 'Command Patterns: ',
                value: `**:? stands for optional in all command patterns proceeding.**\n\n` +
                    `${bot.config.prefix}info [command] [detail] [:?optional excess text]\n\n` +
                    `${bot.config.prefix}info servers [detail] *gets details on the servers that ${bot.user.username} is in*\n\n` +
                    `${bot.config.prefix}info total [detail] *gets the total counts of [details] for all servers that ${bot.user.username} is in*\n\n` +
                    `${bot.config.prefix}info countme [detail] *gets the total counts of [details] for ${message.guild.toString()}*\n\n` +
                    `${bot.config.prefix}info list [detail] *gets a list of all the [details] for ${message.guild.toString()}*\n\n` +
                    `${bot.config.prefix}info count [detail] [channel tag] *counts the total [detail] in [tagged channel]*\n\n`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}info servers count\n\n` +
                    `${bot.config.prefix}info servers names\n\n` +
                    `${bot.config.prefix}info total members\n\n` +
                    `${bot.config.prefix}info total emojis\n\n` +
                    `${bot.config.prefix}info total channels\n\n` +
                    `${bot.config.prefix}info total voice :?channels\n\n` +
                    `${bot.config.prefix}info total text :?channels\n\n` +
                    `${bot.config.prefix}info total categories\n\n` +
                    `${bot.config.prefix}info total news :?channels\n\n` +
                    `${bot.config.prefix}info total store :?channels\n\n` +
                    `${bot.config.prefix}info countme members\n\n` +
                    `${bot.config.prefix}info countme emojis\n\n` +
                    `${bot.config.prefix}info countme channels\n\n` +
                    `${bot.config.prefix}info countme voice :?channels\n\n` +
                    `${bot.config.prefix}info countme text :?channels\n\n` +
                    `${bot.config.prefix}info countme categories\n\n` +
                    `${bot.config.prefix}info countme news :?channels\n\n` +
                    `${bot.config.prefix}info countme store :?channels\n\n` +
                    `${bot.config.prefix}info list members\n\n` +
                    `${bot.config.prefix}info list emojis\n\n` +
                    `${bot.config.prefix}info list channels\n\n` +
                    `${bot.config.prefix}info list voice :?channels\n\n` +
                    `${bot.config.prefix}info list text :?channels\n\n` +
                    `${bot.config.prefix}info list categories\n\n` +
                    `${bot.config.prefix}info list news :?channels\n\n` +
                    `${bot.config.prefix}info list store :?channels\n\n` +
                    `${bot.config.prefix}info count messages ${randomChannel.toString()}\n\n`
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
async function sumSequentially(channel) {
    var sum = 0;
    var last_id;

    while (true) {
        //Create options and update to next message id
        const options = { limit: 100 };
        if (last_id) {
            options.before = last_id;
        }

        //Await fetch messages and sum their total count
        const messages = await channel.fetch(options);
        console.log(messages);

        sum += messages.size;
        last_id = messages.last().id;

        //Break when reach the end of messages
        if (messages.size != 100) break;
    }
    return sum;
}