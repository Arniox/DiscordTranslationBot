module.exports = {
    //Ping command
    ping: function (msg, Discord, settings) {
        msg.delete({ timeout: 0 }); //Delete message
        return msg.channel.send(new Discord.MessageEmbed().setDescription('Right back at you! Yes, I am alive. Current uptime is: ' +
            UpTime() + '. Current Prefix is: ' + settings.prefix));
    }
}