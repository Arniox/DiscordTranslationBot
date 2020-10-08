//Import
const Discord = require('discord.js');

exports.run = (bot, guild = null, message = null, args = null) => {
    //Get now
    var now = new Date();

    //Vulcan Esports guild = 671181556202733600
    //Time tables channel = 678107510430760980
    var guild = bot.guilds.cache.find(i => i.id == '671181556202733600');
    var timeTableChannel = guild.channels.cache.find(i => i.id == '678107510430760980');

    timeTableChannel.send(
        `${guild.roles.cache.find(i => i.id == '742278066922848351').toString()}, ${guild.roles.cache.find(i => i.id == '671185517227933696')}, ` +
        `${guild.roles.cache.find(i => i.id == '671185932182880304')}, ${guild.roles.cache.find(i => i.id == '671188740462608414')}. ` +
        `Please react with availabilities for next week:`
    )
        .then(() => timeTableChannel.send(`Subs and Trials; please use 👍 & 👎`))
        .then(() => timeTableChannel.send('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
        .then(() => {
            //Create all days
            for (var i = 0; i < 8; i++) {
                var day = new Date(now.getTime() + (i * 86400000)); // + 1 day in ms

                //Send message
                timeTableChannel.send(`${day.toDateString()}`)
                    .then((sent) => {
                        sent.react('708718733690011748')
                            .then(() => sent.react('691550248207646761'))
                            .then(() => sent.react('691550247935017032'))
                            .then(() => sent.react('👍'))
                            .then(() => sent.react('👎'))
                            .catch(() => console.error(`One of the scheduling print out emojis failed to react for ${day.toDateString()}.`));
                    });
            }
        });
}
