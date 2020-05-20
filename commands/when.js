exports.run = (bot, message, args) => {
    console.log(bot.datatouse);

    var findRandom = bot.datatouse.quotes[Math.random(SiteRand(bot.datatouse.quotes.length - 1, 0))];

    console.log(bot.datatouse.quotes[Math.random(SiteRand(bot.datatouse.quotes.length - 1, 0))]);
    console.log(findRandom);

    //Message
    message.channel.send(findRandom);
};

//Functions
function SiteRand(high, low) {
    return Math.random() * (high - low) + low;
}