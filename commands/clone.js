//Import
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        //Get all channel mentions
        var channelMentions = message.mentions.channels.map((v, k) => v);

        //Check how many channel mentions there where
        if (channelMentions.length > 0) {
            if (channelMentions.length < 3) {
                //Get command. If it is this, then get this channel, if not then grab channel mention number 1.
                var command = args.shift().toLowerCase();
                var thisChannel = null;
                var toChannel = null;

                //Grab thisChannel
                if (command == 'this') {
                    thisChannel = message.channel;
                } else {
                    thisChannel = channelMentions.shift();
                }
                //Grab toChannel
                toChannel = channelMentions.shift();

                //Shift away the toChannel
                args.shift();
                var flags = (args.length != 0 ? args.join('-').toLowerCase() : '');

                //Count and clone as the bot goes
                //Send loading message
                message.channel
                    .send(new Discord.MessageEmbed().setDescription(`**Total Messages Cloned Accross from ${thisChannel.toString()} to ${toChannel.toString()}**\n\n***Loading....***`).setColor('#FFCC00'))
                    .then(async function (sent) {
                        //Fetch all messages and sequentially count them and clone them
                        var totalCount = await cloneCountSequentially(thisChannel, toChannel, sent, flags);
                        sent.edit(new Discord.MessageEmbed().setDescription(`**Total Messages Cloned Accross from ${thisChannel.toString()} to ${toChannel.toString()}**\n\n${totalCount}`).setColor('#0099ff'));
                    });
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, the ${guild.Prefix}clone command only works with a this or #channelFrom tag and a #channelTo tag.`).setColor('#b50909'));
            }
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you didn\'t select any channels to clone from or too.').setColor('#b50909'));
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
}

//Functions
function HelpMessage(bot, guild, message, args) {
    var randomChannel1 = message.guild.channels.cache.random();
    var randomChannel2 = message.guild.channels.cache.random();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`Clone command allows you to clone all messages from one channel to another for merging purposes.`)
        .addFields(
            { name: 'Required Permissions: ', value: 'Manage Server' },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}clone [this channel/channel tag] [to channel] [:?delete flag]`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}clone this ${randomChannel2.toString()}\n\n` +
                    `${guild.Prefix}clone ${randomChannel1.toString()} ${randomChannel2.toString()}\n\n` +
                    `${guild.Prefix}clone this ${randomChannel2.toString()} delete`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}

//Sum and clone all messages
async function cloneCountSequentially(thisChannel, toChannel, message, flags) {
    var sum = 0;
    var last_id;

    while (true) {
        //Create options and update to next message id
        const options = { limit: 100 };
        if (last_id) {
            options.before = last_id;
        }

        //Await fetch messages and sum their total count
        const messages = await thisChannel.messages.fetch(options);

        //For each message, clone them
        messages.map((v, k) => {
            if (!v.author.bot && v.type === 'DEFAULT') {
                //Send message per message
                toChannel.send(new Discord.MessageEmbed()
                    .setAuthor(v.author.username, v.author.avatarURL())
                    .setDescription(v.content)
                    .setTimestamp(v.createdAt)
                ).then(() => {
                    //Send links seperately with match link regex
                    var linkArray = v.content.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm);
                    for (var i = 0; i < (linkArray ? linkArray : []).length; i++) toChannel.send(linkArray[i]);
                }).catch(() => { return; });
            }

            //Delete all 100 messages
            if (flags.includes('delete'))
                v.delete(); //Delete message
        });


        //Sum messages
        sum += messages.size;
        last_id = messages.last().id;

        //Edit messagte with new number
        message.edit(new Discord.MessageEmbed().setDescription(`**Total Messages Cloned Accross from ${thisChannel.toString()} to ${toChannel.toString()}**\n\n***...${sum}...***`).setColor('#FFCC00'));

        //Break when reach the end of messages
        if (messages.size != 100) break;
    }
    return sum;
}