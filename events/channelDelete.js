//Import
const mysql = require('promise-mysql');

module.exports = (bot, channel) => {
    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot
        bot.con = connection;

        //Delete main channel translation output
        const remove_maintrans_cmd = `
        UPDATE servers
        Default_Channel_Output = NULL
        WHERE Default_Channel_Output = "${channel.id}"
        AND ServerId = "${channel.guild.id}"
        `;
        bot.con.query(remove_maintrans_cmd, (error, results, fields) => {
            if (error) return console.error(error); //Return error console log
        });

        //Delete from database for translation_ignored_channels
        const remove_trans_cmd = `
        DELETE FROM translation_ignored_channels
            WHERE ChannelId = "${channel.id}"
            AND ServerId = "${channel.guild.id}"
        `;
        bot.con.query(remove_trans_cmd, (error, results, fields) => {
            if (error) return console.error(error); //Return error console log
        });

        //Delete from database for server_subbed_reddits
        const remove_subbed_cmd = `
        DELETE FROM translation_ignored_channels
            WHERE ChannelId = "${channel.id}"
            AND ServerId = "${channel.guild.id}"
        `;
        bot.con.query(remove_subbed_cmd, (error, results, fields) => {
            if (error) return console.error(error); //Return error console log
        });

        //Release connection when done
        bot.con.release();
    }).catch((err) => {
        console.log(err, `Connection failed on channelDelete`);
    });
}