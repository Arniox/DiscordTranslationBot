//Import
const Discord = require('discord.js');
//Import functions


exports.run = (bot, guild, message, command, args) => {
    //Has to be posted by me
    //my id: 167152832422608896
    if (IsMe(message)) {
        if (args.length > 0) {
            var query = args.shift().toLowerCase();

            //Check if query exists
            if (query) {
                //Update the server with given id
                //Update server with translation activated
                const update_cmd = `
                UPDATE servers
                SET Allowed_Translation = 1
                WHERE ServerId = "${query.trim()}"
                `;
                bot.con.query(update_cmd, (error, results, fields) => {
                    if (error) message.WaffleResponse(`Sorry, the server with the id of ${query} doesn\'t exist`);
                    //Message
                    message.WaffleResponse(`Translation capababilities have been **activated** for the server with id of ${query}`, MTYPE.Sucess);
                });
            } else {
                message.WaffleResponse('Sorry, you didn\'t supply a server id for me to activate.');
            }
        } else {
            //Update this current discord
            //Update server with translation activated
            const update_cmd = `
            UPDATE servers
            SET Allowed_Translation = 1
            WHERE ServerId = "${message.guild.id}"
            `;
            bot.con.query(update_cmd, (error, results, fields) => {
                if (error) return console.error(error); //Return error and return
                //Message
                message.WaffleResponse(`${message.guild.toString()} translation capabilities have been **activated**.`, MTYPE.Sucess);
            });
        }
    }
}