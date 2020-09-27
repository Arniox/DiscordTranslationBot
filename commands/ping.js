//Import classes
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    message.channel.send(new Discord.MessageEmbed().setDescription(`Right back at you! Yes, I am alive. Current uptime is: ${UpTime()}. Current Prefix is: ${guild.Prefix}`));
}

//Functions
//Find uptime
function UpTime() {
    var time = process.uptime();
    var uptime = (time + '').toHHMMSS();
    return uptime;
}