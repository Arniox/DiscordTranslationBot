//Include
const mysql = require('promise-mysql');

module.exports = (bot, guild) => {
    console.log(`Joined a new guild: ${guild.name}`);

    //Check if guild exists in database already
    const sql_cmd = `SELECT * FROM servers WHERE ServerId = "${guild.id}"`;
    bot.con.query(sql_cmd, (error, results, fields) => {
        if (error) return console.error(error); //Return error console log and return
        else if (!results || !results.length) {
            //Create default server controller
            const server_controller_cmd = `
                INSERT INTO servers (ServerId, ServerName, Prefix)
                    VALUES("${key}", "${value.name}", "$")
                `;
            //Insert new server details
            bot.con.query(server_controller_cmd, (error, results, fields) => {
                if (error) return console.error(error); //Throw error and return
            });
        }
    });
}