//Import
const Discord = require('discord.js');
const moment = require('moment-timezone');

exports.run = (bot, guild, message, command, args) => {
    message.channel.send(new Discord.MessageEmbed().setDescription(`Right back at you! Yes, I am alive. Current uptime is: ${UpTime()}. Current Prefix is: ${guild.Prefix}`));
}

//Functions
//Find uptime
function UpTime() {
    //Convert process
    var time = process.uptime();
    console.log(time);
    //Convert to string
    var timeString = time.toHHMMSS(true);
    return timeString;
}