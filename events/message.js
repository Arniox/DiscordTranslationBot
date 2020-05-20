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
    } else if (message.content.startsWith(bot.config.bancommand.split("").splice(0, 1).join("")) ||
        message.content.startsWith(bot.config.bancommand.split("").splice(0, 2).join("")) ||
        message.content.startsWith(bot.config.bancommand.split("").splice(0, 3).join(""))) {

        //Check length of message.content
        if (message.content.length > 3) return;

        //Get the specific ban command data from client.commands Enmap
        const cmd = bot.commands.get("ban-prykie");

        //If command doesn't exist, exit and do nothing
        if (!cmd) return;
        //Run the command
        cmd.run(bot, message, args);
    } else {
        //Run translation
        if (!message.content) return;

        //Get the specific ban command data from client.commands Enmap
        const cmd = bot.commands.get("translate-message");

        //If command doesn't exist, exit and do nothing
        if (!cmd) return;
        //Run the command
        cmd.run(bot, message, args);
    }
}