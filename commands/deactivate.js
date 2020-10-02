//Import classes
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    //Has to be posted by me
    //my id: 167152832422608896
    if (message.member.id == '167152832422608896') {
        if (args.length > 0) {
            var query = args.shift().toLowerCase();

            //Check if query exists
            if (query) {
                //Update the server with given id
                //Update server with translation activated
                const update_cmd = `
                UPDATE servers
                SET Allowed_Translation = 0
                WHERE ServerId = "${query}"
                `;
                bot.con.query(update_cmd, (error, results, fields) => {
                    if (error)
                        return message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, the server with the id of ${query} doesn\'t exist`).setColor('#b50909'));
                    //Message
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Translation capababilities have been **deactivated** for the server with id of ${query}`).setColor('#09b50c'));
                });
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you didn\'t supply a server id for me to deactivated.').setColor('#b50909'));
            }
        } else {
            //Update this current discord
            //Update server with translation activated
            const update_cmd = `
            UPDATE servers
            SET Allowed_Translation = 0
            WHERE ServerId = "${message.guild.id}"
            `;
            bot.con.query(update_cmd, (error, results, fields) => {
                if (error) return console.error(error); //Return error and return
                //Message
                message.channel.send(new Discord.MessageEmbed().setDescription(`${message.guild.toString()} translation capabilities have been **deactivated**.`).setColor('#09b50c'));
            });
        }
    }
}