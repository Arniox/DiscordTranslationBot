const Discord = require('discord.js');

exports.run = (bot) => {
    var now = new Date();
    //Check if sunday
    if (now.getDay() == 0) {
        //Vulcan Esports guild = 671181556202733600
        //Time tables channel = 678107510430760980
        var guild = bot.guilds.cache.find(i => i.id == '671181556202733600');
        var timeTableChannel = guild.channels.cache.find(i => i.id == '678107510430760980');

        timeTableChannel.send(`React with availabilities for next week:`)
            .then(() => timeTableChannel.send(`${guild.roles.cache.find(i => i.id == '671185932182880304').toString()} please use 👍 & 👎`))
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
    } else {
        console.log(`Today is ${now.toDateString()}`);
    }
}