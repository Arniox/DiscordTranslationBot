//Import classes
const Discord = require('discord.js');
const AkinatorGame = require('../classes/akinator.js');
//Import functions
require('../message-commands.js')();

exports.run = (bot, guild, message, command, args) => {
    if (args.length != 0) {
        var player = message.member;

        //Get command
        var option = args.shift().toLowerCase();
        //Switch case on command
        switch (option) {
            case 'start': case 's':
                //Create new game
                const newAkinatorGame = new AkinatorGame(guild, message, player);
                //Attach user to each game
                bot.akinatorGames.set(player.id, newAkinatorGame);

                //Start the game
                bot.akinatorGames.get(player.id).StartGame();
                break;
            default:
                HelpMessage(bot, guild, message, args);
                break;
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
}

//Functions
function HelpMessage(bot, guild, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`This is the Akinator game in discord. Please use *${guild.Prefix}akinator start / s* to start a game.`)
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}