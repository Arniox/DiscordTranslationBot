//Import
const Discord = require('discord.js');
const moment = require('moment-timezone');

exports.run = (bot) => {
    //Get all subscribed subreddits
    const sql_cmd = `SELECT * FROM server_subbed_reddits`;
    bot.con.query(sql_cmd, (error, results, fields) => {
        if (error) throw error; //Return error console log and continu8e

        //For each server
        bot.guilds.cache.map((value, key) => {
            //Grab all the subscribed subreddits for this server
            var thisServer = results.filter(i => i.ServerId);

            //For each subscription
            thisServer.forEach((sub) => {
                bot.reddit.get(`${sub.SubName}/new`, {
                    after: null,
                    count: 1,
                    limit: 10
                }).then((res) => {
                    //Found posts from this sub reddit
                    console.log(res);
                    console.log(sub);
                }).catch((err) => {
                    return console.error(err); //Throw error
                });
            });
        });
    });
}