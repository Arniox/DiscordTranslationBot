const fs = require('fs');

module.exports = (bot, channel) => {
    //Delete from database
    const sql_cmd = `
    SELECT * FROM translation_ignored_channels
        WHERE ServerId = "${channel.guild.id}"
    `;
    bot.con.query(sql_cmd, (error, results, fields) => {
        if (error) return console.error(error); //Return error console log

        //Check if exists in the database
        if (results.map(v => v.ChannelId).includes(channel.id)) {
            //Remove
            const remove_sql = `
            DELETE FROM translation_ignored_channels
                WHERE ChannelId = "${channel.id}"
                AND ServerId = "${channel.guild.id}"
            `;
            bot.con.query(remove_sql, (error, results, fields) => {
                if (error) return console.error(error); //Return error console log
            });
        }
    });
};