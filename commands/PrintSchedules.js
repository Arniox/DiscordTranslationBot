const Discord = require('discord.js');

exports.run = (bot) => {
    var now = new Date();
    //Check if sunday
    //if (now.getDay() == 0) {
    //Vulcan Esports guild = 671181556202733600
    //Time tables channel = 678107510430760980
    var timeTableChannel = bot.guilds.cache.find(i => i.id == '671181556202733600').channels.cache.find(i => i.id == '678107510430760980');

    //Create all days
    var monday = new Date(now.getTime() + 86400000); // + 1 day in ms
    var tuesday = new Date(monday.getTime() + 86400000);
    var wednesday = new Date(tuesday.getTime() + 86400000);
    var thursday = new Date(wednesday.getTime() + 86400000);
    var friday = new Date(thursday.getTime() + 86400000);
    var saturday = new Date(friday.getTime() + 86400000);
    var sunday = new Date(saturday.getTime() + 86400000);

    //React to message
    timeTableChannel.send("React with availabilities for next week:");

    //Print all days and wait for eachother.
    //Print monday
    timeTableChannel
        .send(`${monday.toDateString()}`)
        .then((sent) => {
            sent.react('708718733690011748')
                .then(() => sent.react('691550248207646761'))
                .then(() => sent.react('691550247935017032'))
                .catch(() => console.error(`One of the scheduling print out emojis failed to react for ${monday.toDateString()}.`));

            //Print tuesday
            timeTableChannel
                .send(`${tuesday.toDateString()}`)
                .then((sent) => {
                    sent.react('708718733690011748')
                        .then(() => sent.react('691550248207646761'))
                        .then(() => sent.react('691550247935017032'))
                        .catch(() => console.error(`One of the scheduling print out emojis failed to react for ${tuesday.toDateString()}.`));

                    //Print wednesday
                    timeTableChannel
                        .send(`${wednesday.toDateString()}`)
                        .then((sent) => {
                            sent.react('708718733690011748')
                                .then(() => sent.react('691550248207646761'))
                                .then(() => sent.react('691550247935017032'))
                                .catch(() => console.error(`One of the scheduling print out emojis failed to react for ${wednesday.toDateString()}.`));

                            //Print thursday
                            timeTableChannel
                                .send(`${thursday.toDateString()}`)
                                .then((sent) => {
                                    sent.react('708718733690011748')
                                        .then(() => sent.react('691550248207646761'))
                                        .then(() => sent.react('691550247935017032'))
                                        .catch(() => console.error(`One of the scheduling print out emojis failed to react for ${thursday.toDateString()}.`));

                                    //Print friday
                                    timeTableChannel
                                        .send(`${friday.toDateString()}`)
                                        .then((sent) => {
                                            sent.react('708718733690011748')
                                                .then(() => sent.react('691550248207646761'))
                                                .then(() => sent.react('691550247935017032'))
                                                .catch(() => console.error(`One of the scheduling print out emojis failed to react for ${friday.toDateString()}.`));

                                            //Print saturday
                                            timeTableChannel
                                                .send(`${saturday.toDateString()}`)
                                                .then((sent) => {
                                                    sent.react('708718733690011748')
                                                        .then(() => sent.react('691550248207646761'))
                                                        .then(() => sent.react('691550247935017032'))
                                                        .catch(() => console.error(`One of the scheduling print out emojis failed to react for ${saturday.toDateString()}.`));

                                                    //Print sunday
                                                    timeTableChannel
                                                        .send(`${sunday.toDateString()}`)
                                                        .then((sent) => {
                                                            sent.react('708718733690011748')
                                                                .then(() => sent.react('691550248207646761'))
                                                                .then(() => sent.react('691550247935017032'))
                                                                .catch(() => console.error(`One of the scheduling print out emojis failed to react for ${sunday.toDateString()}.`));
                                                        });
                                                });
                                        });
                                });
                        });
                });
        });
    //}
}