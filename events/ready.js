module.exports = (bot) => {
    //Set bot activity and log
    bot.user.setActivity(`the ${bot.config.prefix}`, { type: 'WATCHING' });
    console.log('Connected!');
    console.log(`Logged in as ${bot.user.username} - (${bot.user.id})`);
    console.log(`Prefix: ${bot.config.prefix}`);
};