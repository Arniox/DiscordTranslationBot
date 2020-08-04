//Import classes
const Discord = require('discord.js');
const fs = require('fs');

exports.run = (bot, message, args) => {
    if (!message.content) return;

    //Detect
    if (message.content.includes('kiss')) {
        //Check if person is already being counted
        var data = null;
        if (bot.datatouse["kisses"].length > 0) {
            data = bot.datatouse["kisses"].find(i => i["data"]["person-id"] == message.author.id);
        }

        if (data) {
            //Update count
            data["data"]["number-of-kisses"] = data["data"]["number-of-kisses"] + 1;
            //Write to file
            fs.writeFileSync('./data-to-use.json', JSON.stringify(bot.datatouse));
        } else {
            //Add to count
            bot.datatouse["kisses"].push({
                "data": {
                    "person-id": message.author.id,
                    "number-of-kisses": 1
                }
            });
            //Write to file
            fs.writeFileSync('./data-to-use.json', JSON.stringify(bot.datatouse));
        }

        //Print out top leaderboard
        var orderedArray = bot.datatouse["kisses"].sort((a, b) => b["number-of-kisses"] - a["number-of-kisses"]);
        orderedArray = orderedArray.slice(0, 2);

        var embeddedMessage = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(bot.user.username, bot.user.avatarURL())
            .setDescription(`${message.author.username} has kissed another person. Their score has increased!`)
            .addFields(
                { name: 'Top Kisser:', value: `${message.guild.memebers.cache.filter(i => i.user.id == orderedArray[0]["data"]["person-id"]).user} with ${orderedArray[0]["data"]["number-of-kisses"]} kisses!` },
                { name: 'Runner Up Kisser:', value: `${message.guild.members.cache.filter(i => i.user.id == orderedArray[1]["data"]["person-id"]).user} with ${orderedArray[1]["data"]["number-of-kisses"]} kisses!` },
                { name: 'Third Kisser:', value: `${message.guild.members.cache.filter(i => i.user.id == orderedArray[2]["data"]["person-id"]).user} with ${orderedArray[2]["data"]["number-of-kisses"]} kisses!` }
            )
            .setTimestamp()
            .setFooter('Love you all :heart:!');
        //send
        message.channel.send(embeddedMessage);

        return true;
    }
    else return false;
}