//Include
const mysql = require('promise-mysql');

module.exports = (bot, guild) => {
    console.log(`Joined a new guild: ${guild.name}`);

    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot
        bot.con = connection;

        //Check if guild exists in database already
        const sql_cmd = `SELECT * FROM servers WHERE ServerId = "${guild.id}"`;
        bot.con.query(sql_cmd, (error, results, fields) => {
            if (error) throw error; //Return error console log and return
            else if (!results || !results.length) {
                //Create default server controller
                const server_controller_cmd = `
                INSERT INTO servers (ServerId, ServerName, Prefix, Active)
                    VALUES("${guild.id}", "${guild.name}", "$", 1)
                `;
                //Insert new server details
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
            }
        });

        //Release connection when done
        bot.con.release();
    }).catch((err) => {
        console.log(err, `Connection failed on guildCreate`);
    })
}