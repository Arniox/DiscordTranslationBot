//Import
const Discord = require('discord.js');
const RedditAPI = require('reddit-wrapper-v2');

const reddit = new RedditAPI({
    //Options for Reddit Wrapper
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    app_id: process.env.REDDIT_APP_ID,
    api_secret: process.env.REDDIT_APP_SECRET,
    user_agent: `PC:https://discordapp.com/api/oauth2/authorize?client_id=707436231222493214&permissions=133160&scope=bot v${HEROKU_RELEASE_VERSION} (by /u/-arniox-)`,
    retry_on_wait: true,
    retry_on_server_error: 5,
    logs: true
});

exports.run = (bot, guild, message, args) => {
    //Test
    reddit.api.get('/api/v1/me/karma/')
        .then((res) => {
            let responseCode = res[0];
            let responseData = res[1];

            console.log(`Received response (${responseCode}): ${responseData}`);
        }).catch((err) => {
            return console.error(`api request failed: ${err}`);
        });
}