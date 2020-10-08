//Import
const Discord = require('discord.js');
const RedditJS = require('js-reddit.js/src');

//Set up reddit options
const opts = {
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    appId: process.env.REDDIT_APP_ID,
    appSecret: process.env.REDDIT_APP_SECRET,
    userAgent: `PC:https://discordapp.com/api/oauth2/authorize?client_id=707436231222493214&permissions=133160&scope=bot` +
        ` v${process.env.HEROKU_RELEASE_VERSION} (by /u/-arniox-)`
}
const reddit = new RedditJS.Client(opts);

exports.run = (bot, guild, message, args) => {
    //Test
    reddit.fetchSelf()
        .then(user => {
            console.log(`This client is logged into ${user.name}`);
        }).catch((err) => {
            console.error(err);
        });

}