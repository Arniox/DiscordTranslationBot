//Import
const Discord = require('discord.js');

exports.run = (bot, guild, message, command, args) => {
    message.WaffleResponse(
        `Right back at you! Yes, I am alive. Current uptime is: ${UpTime()}. Current Prefix is: ${guild.Prefix}`,
        MTYPE.Gray, null, false, null, null, ATYPE.None
    );
}

//Functions
//Find uptime
function UpTime() {
    //Convert process
    var time = process.uptime();

    //Convert to string
    var timeString = time.toString().toTimeString(true);
    return timeString;
}