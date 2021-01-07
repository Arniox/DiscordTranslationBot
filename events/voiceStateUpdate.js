//Import requirements
const Discord = require('discord.js');

module.exports = (bot, oldVoiceState, newVoiceState) => {
    //Check if the updated user is me
    if (oldVoiceState.guild.me == oldVoiceState.member) {
        //Check if the bot has any active serverQueue for this guild
        const serverQueue = bot.musicQueue.get(oldVoiceState.guild.id);
        if (serverQueue && serverQueue.textChannel) {
            //Check if the bot was undeafened
            if (!newVoiceState.deaf) {
                //Send message
                serverQueue.textChannel.send(new Discord.MessageEmbed().setDescription('Please do not undeafen me while I am playing music').setColor('#b50909'));

                //Set bot to deaf
                newVoiceState.guild.me.voice.setDeaf(true);
            }
        }
    }
}