module.exports = (bot, message) => {
    //Ignore all bots
    if (message.author.bot) return;

    //if else on messages that don't start with prefix
    if (message.content.startsWith(bot.config.prefix)) {
        //Argument/command name definition.
        var args = message.content.substring(bot.config.prefix.length).split(' ');
        var command = args.shift().toLowerCase();

        //Get the command data from client.commands Enmap
        const cmd = bot.commands.get(command);
        //If command doesn't exist, exit and do nothing
        if (!cmd) return;
        //Run the command
        cmd.run(bot, message, args);
        message.delete({ timeout: 0 }); //Delete message
    } else if (bot.config.bancommand.bancommand.startsWith(message.content)) {

        //Check length of message.content
        if (message.content.length > 10) return;

        //Get the specific ban command data from client.commands Enmap
        const cmd = bot.commands.get("banprykie");

        //If command doesn't exist, exit and do nothing
        if (!cmd) return;
        //Run the command
        cmd.run(bot, message, args);
    } else {
        //Run translation
        if (!message.content) return;

        //Get the specific translatemessage command data from client.commands Enmap
        const cmd = bot.commands.get("translatemessage");

        //If command doesn't exist, exit and do nothing
        if (!cmd) return;

        new Promise((resolve, reject) => {
            //Run the command
            var value = cmd.run(bot, message, args);

            if (value == 'complete') reject('');
            else resolve('');
        }).then((value) => {
            //Get the specific kiss command data from client.commands Enmap
            const cmd = bot.commands.get("kiss");

            //If command doesn't exist, exit and do nothing
            if (!cmd) return;

            //Run the command
            cmd.run(bot, message, args);
        }).catch((err) => {
            //Just exit and return
            return;
        });
    }
}