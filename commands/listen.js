//Import classes
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    //Grab member voice channel
    var voiceChannel = message.member.voice.channel;
    var botVoice = message.guild.me.voice.channel;
    //If you are not in a voice
    if (!voiceChannel) {
        message.channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first!').setColor('#b50909'));
    } else {
        //Check how many users in channel
        var membersInVoice = message.guild.members.cache.filter(i => i.voice.channelID == voiceChannel.id && i.user.bot != true);
        //If there are no members in that voice channel
        if (membersInVoice.size == 0) {
            message.channel.send(new Discord.MessageEmbed().setDescription(`I have found no one in ${voiceChannel.toString()} so I didn\'t join it.`).setColor('#b50909'));
        } else {
            if (!botVoice) {
                message.channel
                    .send(new Discord.MessageEmbed().setDescription(`Joining ${voiceChannel.toString()}...`).setColor('#FFCC00'))
                    .then((sent) => {
                        //Mute bot
                        message.guild.me.voice.setMute(true);
                        //Join voice channel
                        voiceChannel
                            .join()
                            .then((connection) => {
                                var userCount = 0;

                                //For every user in the channel
                                membersInVoice.map((value, key) => {
                                    //Create audio stream
                                    //var audioStream = connection.receiver.createStream(key);
                                    //connection.play(audioStream, { type: 'opus' });

                                    userCount++;
                                    sent.edit(new Discord.MessageEmbed().setDescription(`Listening to ${userCount} / ${membersInVoice.size} members...`).setColor('#FFCC00'));
                                });
                                //Update after loop
                                sent.edit(new Discord.MessageEmbed().setDescription(`✅ Now listening to ${membersInVoice.size} members in ${voiceChannel.toString()}`).setColor('#09b50c'));
                            })
                            .catch(error => {
                                sent.edit(new Discord.MessageEmbed().setDescription(`For some reason, I hae failed to join this channel. Please try again later or contact the bot developer`).setColor('#b50909'));
                            });
                    });
            } else {
                if (botVoice == voiceChannel) {
                    message.channel.send(new Discord.MessageEmbed().setDescription('I am already listening to your channel. I can\'t be anywhere else!').setColor('#b50909'));
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`I am currently busy listening to ${botVoice.toString()}. Ask me later on when I am no longer busy.`).setColor('#b50909'));
                }
            }
        }
    }

    //Add later when outputing to a file is option 
    //HelpMessage(bot, message, args);
};

function HelpMessage(bot, guild, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('[WIP] This command is a work in progress. Currently it\'s a bit buggy and can cause bot crashes. It will simply connect the bot to the current voice channel you\'re in.')
        .addFields(
            {
                name: 'Required: ',
                value: 'You must be in a voice channel for this to work.' +
                    ' If the bot is already listening to a channel, it wont move to a new one. You must ' +
                    `${guild.Prefix}leave first and then ${guild.Prefix}listen for it to listen to your current voice channel.`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}