exports.run = (bot, message, args) => {
    var findRandom = bot.datatouse.quotes[Math.floor(Math.random(SiteRand(bot.datatouse.quotes.length - 1, 0)))];

    //Message
    message.channel.send(findRandom);
};

//Functions
function SiteRand(high, low) {
    return Math.random() * (high - low) + low;
}