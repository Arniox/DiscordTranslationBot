//Import
const Discord = require('discord.js');
const moment = require('moment-timezone');

exports.run = (bot) => {
    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot
        bot.con = connection;

        //Get all subscribed subreddits
        const sql_cmd = `SELECT * FROM server_subbed_reddits`;
        bot.con.query(sql_cmd, (error, results, fields) => {
            if (error) return console.error(error); //Return error console log and continue

            //For each server
            bot.guilds.cache.map((value, key) => {
                //Grab all the subscribed subreddits for this server
                var thisServer = results.filter(i => i.ServerId == key);

                //For each subscription
                thisServer.forEach((sub) => {
                    bot.reddit.get(`/r/${sub.SubName}/new`).then((res) => {
                        //Found posts from this sub reddit
                        console.log(res);
                    }).catch((err) => {
                        throw err; //Throw error
                    });
                });
            });
        });

        //Release connection when done
        bot.con.release();
    }).catch((err) => {
        console.log(err, `Connection failed on redditpost`);
    });
}