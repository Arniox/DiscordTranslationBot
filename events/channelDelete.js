const fs = require('fs');

module.exports = (bot, channel) => {
    //Delete from config file
    var isChannel = bot.config.google["translate-ignored-channels"].find(i => i.id == channel.id);
    if (isChannel) {
        //Remove from array
        var index = bot.config.google["translate-ignored-channels"].indexOf(isChannel);
        bot.config.google["translate-ignored-channels"].splice(index, 1);
        //Save config
        fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
    }
};