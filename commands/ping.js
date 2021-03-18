//Import
const Discord = require('discord.js');
const moment = require('moment-timezone');
var tools = require('./extra-functions');

exports.run = (bot, guild, message, command, args) => {
    message.channel.send(new Discord.MessageEmbed().setDescription(`Right back at you! Yes, I am alive. Current uptime is: ${UpTime()}. Current Prefix is: ${guild.Prefix}`));
}

//Functions
//Find uptime
function UpTime() {
    //Convert process
    var time = process.uptime();

    console.log((6541651651).toString().toTimeString());
    console.log((987989849).toString().toTimeString(true));

    //Convert to string
    var timeString = time.toString().toTimeString(true);
    return timeString;
}