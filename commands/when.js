exports.run = (bot, message, args) => {
    console.log(bot.datatouse);

    var findRandom = bot.datatouse.quotes.random();

    console.log(bot.datatouse.quotes.random());
    console.log(findRandom);

    //Message
    message.channel.send(findRandom);
};

//Functions
function SiteRand(high, low) {
    return Math.random() * (high - low) + low;
}