//Include
const mysql = require('promise-mysql');

module.exports = (bot, guild) => {
    console.log(`Left a guild: ${guild.name}`);
    //Don't remove from database. Just set to inactive

    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot 
        bot.con = connection;

        //Check if guild exists in database
        const sql_cmd = `SELECT * FROM servers WHERE ServerId = "${guild}"`;
        bot.con.query(sql_cmd, (error, results, fields) => {
            if (error) throw error; //Return error and return
            else if (!results || !results.length) {
                //Create default server controller
                const server_controller_cmd = `
                INSERT INTO servers (ServerId, ServerName, Prefix, Active)
                    VALUES("${guild.id}", "${guild.name}", "$", 0)
                `;
                //Insert server details
                bot.con.query(server_controller_cmd, (error, results, fields) => {
                    if (error) throw error; //Throw error and return
                });

                //Create based counter
                const based_counter_cmd = `
                INSERT INTO based_counter (ServerId)
                    VALUES("${guild.id}")
                `;
                //Insert new based counter
                bot.con.query(based_counter_cmd, (error, results, fields) => {
                    if (error) throw error; //Throw error and return
                });
            } else {
                //Update server controller
                const set_inactive = `
                UPDATE servers
                SET Active = 0
                WHERE ServerId = "${guild.id}"
                `;
                //Update server details
                bot.con.query(set_inactive, (error, results, fields) => {
                    if (error) throw error; //Throw error and return
                });
            }
        });

        //Release connection when done
        bot.con.release();
    }).catch((err) => {
        console.log(err, `Connection failed on guildDelete`);
    });
}