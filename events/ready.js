module.exports = (bot) => {
    //Set bot activity and log
    bot.user.setActivity(`the ${bot.config.prefix}`, { type: 'WATCHING' });
    console.log('Connected!');
    console.log(`Logged in as ${bot.user.username} - (${bot.user.id})`);
    console.log(`Prefix: ${bot.config.prefix}`);
    console.log(`Prykie bancommand is: ${bot.config.bancommand.bancommand}`);

    //Get print schedules command
    const cmd = bot.commads.get("PrintSchedules");
    //If command doesn't exist, exit and do nothing
    if (!cmd) return;
    else {
        //Function variables / Globals
        const minutes = 60, interval = minutes * 60 * 1000;
        //Check schedules
        setInterval(function () {
            //Run command
            cmd.run(bot);
        }, interval);
    }
};