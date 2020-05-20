//Import classes
const Discord = require('discord.js');

exports.run = (bot, message, args) => {
    message.delete({ timeout: 0 }); //Delete message
    message.channel.send(new Discord.MessageEmbed().setDescription(`Right back at you! Yes, I am alive. Current uptime is: ${UpTime()}. Current Prefix is: ${bot.config.prefix}`));
}

//Functions
//Find uptime
function UpTime() {
    var time = process.uptime();
    var uptime = (time + '').toHHMMSS();
    return uptime;
}