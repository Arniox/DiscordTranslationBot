//Import
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    //Test
    new Promise(async (resolve, reject) => {
        await resolve(bot.reddit.get('/api/v1/me'));
    }).then((res) => {
        console.log(res);
    }).catch((err) => {
        console.error(err);
    })

}