//Import classes
const Discord = require('discord.js');
//Import functions
require('../message-commands.js')();

exports.run = (bot, guild, message, args) => {
    if (!message.content) return;

    //Search for server
    const based_counter_cmd = `
    SELECT * FROM based_counter
        WHERE ServerId = "${message.guild.id}"
    `;
    bot.con.query(based_counter_cmd, (error, results, fields) => {
        if (error) return console.error(error); //Return error console log

        //Get based counter
        var counter = parseInt(results[0].Based_Counter);

        //Update based counter
        const update_based_counter_cmd = `
                UPDATE based_counter
                SET Based_Counter = ${counter + 1}
                WHERE ServerId = "${message.guild.id}"
                `;
        bot.con.query(update_based_counter_cmd, (error, results, fields) => {
            if (error) return console.error(error); //Throw error and return

            //Send message
            message.channel.send(new Discord.MessageEmbed().setDescription(`Based Counter: ${counter + 1}`).setColor('#0099ff'));
        });
    });
}