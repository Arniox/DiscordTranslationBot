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

        //Get the specific ban command data from client.commands Enmap
        const cmd = bot.commands.get("translatemessage");

        //If command doesn't exist, exit and do nothing
        if (!cmd) return;
        //Run the command
        cmd.run(bot, message, args);
    }
}