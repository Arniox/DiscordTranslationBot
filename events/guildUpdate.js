//Include
const mysql = require('promise-mysql');

module.exports = (bot, oldGuild, newGuild) => {
    console.log(`Guild Updated: ${oldGuild.name} -> ${newGuild.name}`);

    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot
        bot.con = connection;

        //Check if guild exists in database
        const sql_cmd = `SELECT * FROM servers WHERE ServerId = "${oldGuild.id}"`;
        bot.con.query(sql_cmd, (error, results, fields) => {
            if (error) throw error; //Return error and return
            else if (!results || !results.length) {
                //Create default server controller
                const server_controller_cmd = `
                INSERT INTO servers (ServerId, ServerName, Prefix, Active)
                    VALUES("${newGuild.id}", "${newGuild.name}", "$", 1)
                `;
                //Insert new server details
                bot.con.query(server_controller_cmd, (error, results, fields) => {
                    if (error) throw error; //Throw error and return
                });

                //Create based counter
                const based_counter_cmd = `
                INSERT INTO based_counter (ServerId)
                    VALUES("${newGuild.id}")
                `;
                //Insert new based counter
                bot.con.query(based_counter_cmd, (error, results, fields) => {
                    if (error) throw error; //Throw error and return
                });
            } else {
                //Update server controller
                const server_controller_cmd = `
                UPDATE servers
                SET ServerId = "${newGuild.id}",
                    ServerName = "${newGuild.name}"
                    Active = 1
                WHERE ServerId = "${oldGuild.id}"
                `;
                //Update new server details
                bot.con.query(server_controller_cmd, (error, results, fields) => {
                    if (error) throw error; //Throw error and return
                });
            }
        });

        //Release connection when done
        bot.con.release();
    }).catch((err) => {
        console.log(err, `Connection failed on guildUpdate`);
    })
}