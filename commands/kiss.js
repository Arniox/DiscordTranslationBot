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

        console.log(bot.datatouse["kisses"]);

        if (data) {
            console.log('THIS PERSON DOES EXIST');

            //Update count
            data["data"]["number-of-kisses"] = data["data"]["number-of-kisses"] + 1;
            //Write to file
            fs.writeFileSync('./data-to-use.json', JSON.stringify(bot.datatouse));

            console.log("added 1 to already counted player", bot.datatouse["kisses"]);
        } else {
            console.log('THIS PERSON DOESN\'T EXIST');

            //Add to count
            bot.datatouse["kisses"].push({
                "data": {
                    "person-id": message.author.id,
                    "number-of-kisses": 1
                }
            });
            //Write to file
            fs.writeFileSync('./data-to-use.json', JSON.stringify(bot.datatouse));

            console.log("added 1 to new counted player", bot.datatouse["kisses"]);
        }

        console.log(bot.datatouse["kisses"]);

        return true;
    }
    else return false;
}