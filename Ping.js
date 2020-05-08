module.exports = {
    //Ping command
    ping: function (msg, msgContent, channel, author, member, guild) {
        msg.delete({ timeout: 0 }); //Delete message
        return channel.send(new Discord.MessageEmbed().setDescription('Right back at you! Yes, I am alive. Current uptime is: ' +
            UpTime() + '. Current Prefix is: ' + settings.prefix));
    }
}