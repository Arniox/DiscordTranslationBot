//Import
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    //Test
    bot.reddit.fetchSelf()
        .then(user => {
            console.log(`This client is logged into ${user.name}`);
        }).catch((err) => {
            console.log('THIS IS GAY');

            console.error(err);
        });
}