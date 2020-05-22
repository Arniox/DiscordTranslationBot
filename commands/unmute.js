//Import classes
const Discord = require('discord.js');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        if (message.member.hasPermission('MUTE_MEMBERS')) {
            var voiceChannel = args.join(' ');

            //Channel name, find the voice channel
            var channelToMute = message.guild.channels.cache.find(i => i.name.toLowerCase() == voiceChannel.toLowerCase() && i.type == 'voice');
            if (channelToMute) {
                //Grab all players in this voice
                var playersFoundInVoice = message.guild.members.cache.filter(i => i.voice.channelID == channelToMute.id);

                if (playersFoundInVoice.size != 0) {
                    //send message promise
                    message.channel
                        .send(new Discord.MessageEmbed().setDescription(`Unmuting 0 / ${playersFoundInVoice.size} members in ${channelToMute.toString()}`).setColor('#FFCC00'))
                        .then((sent) => {
                            var countOfUnmutedPlayers = 0;

                            //Unmute everyone that we found
                            playersFoundInVoice.map((value, key) => {
                                countOfUnmutedPlayers++; //Count unmuted players

                                value.voice.setMute(false);
                                //Edit message
                                sent.edit(new Discord.MessageEmbed().setDescription(`Unmuting ${countOfUnmutedPlayers} / ${playersFoundInVoice.size} members` +
                                    ` in ${channelToMute.toString()}`).setColor('#FFCC00'));
                            });
                            //Update after loop
                            sent.edit(new Discord.MessageEmbed().setDescription(`✅ Unmuted ${countOfUnmutedPlayers} / ${playersFoundInVoice.size} members` +
                                ` in ${channelToMute.toString()}`).setColor('#09b50c'));
                        });
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`There\'s no one in ${channelToMute.toString()} to unmute.`).setColor('#b50909'));
                }
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription(`Could not find a voice channel with the name ${voiceChannel}`).setColor('#b50909'));
            }
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need muting permissions to run this command.').setColor('#b50909'));
        }
    } else {
        HelpMessage(bot, message, args);
    }
};

function HelpMessage(bot, message, args) {
    var randomChannel = message.guild.channels.cache.filter(i => i.type == 'voice').random().name;

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('The unmute command allows you to server unmute everyone in a selected voice channel barring mute ignored roles. This works fine with spaces in the name and is case insensitive.')
        .addFields(
            { name: 'Command Patterns: ', value: `${bot.config.prefix}unmute [voice channel name]` },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}unmute ${randomChannel}`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}