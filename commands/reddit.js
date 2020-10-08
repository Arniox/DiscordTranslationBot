//Import
const Discord = require('discord.js');
const Reddit = require('js-reddit.js');

//Set up reddit options
const opts = {
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    appId: process.env.REDDIT_APP_ID,
    appSecret: process.env.REDDIT_APP_SECRET,
    userAgent: `PC:https://discordapp.com/api/oauth2/authorize?client_id=707436231222493214&permissions=133160&scope=bot` +
        ` v${process.env.HEROKU_RELEASE_VERSION} (by /u/-arniox-)`
}

exports.run = (bot, guild, message, args) => {
    //Test

}