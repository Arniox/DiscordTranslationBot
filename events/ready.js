module.exports = (bot) => {
    //Set bot activity and log
    bot.user.setActivity(`the ${bot.config.prefix}`, { type: 'WATCHING' });
    console.log('Connected!');
    console.log(`Logged in as ${bot.user.username} - (${bot.user.id})`);
    console.log(`Prefix: ${bot.config.prefix}`);
    console.log(`Prykie bancommand is: ${bot.config.bancommand.bancommand}`);

    //Get print schedules command
    const cmd = bot.commands.get("PrintSchedules");
    //If command doesn't exist, exit and do nothing

    if (cmd) {
        //Function variables / Globals
        const hours = 24, interval = hours * 60 * 60 * 1000;
        setInterval(function () {
            //check if sunday
            var now = new Date();
            if (now.getDay() == 0) {
                //Run command
                cmd.run(bot, now);
            } else {
                //Log
                console.log(`Another day, another dollar. Today is ${now.toString()}`);
            }
        }, interval);
    }
};