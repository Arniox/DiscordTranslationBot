const fs = require('fs');

module.exports = (bot, channel) => {
    //Delete from config file
    var isChannel = bot.config.google["translate-ignored-channels"].find(i => i.id == channel.id);
    console.log(isChannel);

    if (isChannel) {
        //Remove from array
        var index = bot.config.google["translate-ignored-channels"].indexOf(isChannel);

        console.log(index);

        console.log(bot.config.google["translate-ignored-channels"]);

        bot.config.google["translate-ignored-channels"].splice(index, 1);

        console.log(bot.config.google["translate-ignored-channels"]);

        fs.writeFileSync('./configure.json', JSON.stringify(bot.config));

        console.log('Translation ignored channel was successfully deleted.');
    }
};