//Include
const mysql = require('promise-mysql');

module.exports = (bot, message) => {
    //Ignore all bots
    if (message.author.bot) return;

    const sql_cmd = `
    SELECT *
        FROM servers
        WHERE ServerId = ${message.guild.id}`;
    bot.con.query(sql_cmd, (error, results, fields) => {
        if (error || !results || results.length < 1) return console.error(error); //Return error console log and return

        //if else on message that starts with prefix
        if (message.content.startsWith(results[0].Prefix)) {
            //Argument/command name definition.
            var args = message.content.substring(results[0].Prefix.length).split(' ');
            var command = args.shift().toLowerCase();

            //Get the command data from client.commands Enmap
            const cmd = bot.commands.get(command);
            //If command doesn't exist, exiot and do nothing
            if (!cmd) return;
            //Run the command
            cmd.run(bot, results[0], message, args);
            message.delete({ timeout: 100 }); //Delete message
        } else {
            //If message is empty
            if (!message.content) return;
            //If discord server is not allowed translation
            if (results[0].Allowed_Translation == false) return;

            //Get the specific translatemessage command data from client.commands Enmap
            const trans = bot.commands.get("translatemessage");
            //If command doesn't exist, exit and do nothing
            if (!trans) return;

            //Run translation
            trans.run(bot, message, args);
        }
    });
}