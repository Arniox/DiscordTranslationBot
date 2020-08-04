//Import classes
const Discord = require('discord.js');
const fs = require('fs');

exports.run = (bot, message, args) => {
    if (!message.content) return;

    //Detect
    if (message.content.includes('kiss')) {
        //Check if person is already being counted
        var data = bot.datatouse["kisses"].find(i => i["data"]["person-id"] == message.author.id);

        console.log(data);

        if (data) {
            //Update count
            data["data"]["number-of-kisses"] = data["data"]["number-of-kisses"] + 1;
            //Write to file
            fs.writeFileSync('./data-to-use.json', JSON.stringify(bot.datatouse));

            console.log("added 1 to already counted player", data);
        } else {
            //Add to count
            bot.datatouse["kisses"].push(new {
                "data": {
                    "person-id": message.author.id,
                    "number-of-kisses": 1
                }
            });
            //Write to file
            fs.writeFileSync('./data-to-use.json', JSON.stringify(bot.datatouse));

            console.log("added 1 to new counted player", data);
        }

        console.log(data);

        return true;
    }
    else return false;
}