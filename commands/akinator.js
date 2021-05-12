//Import classes
const Discord = require('discord.js');
const AkinatorGame = require('../classes/akinator.js');
//Import functions
require('../message-commands.js')();

exports.run = (bot, guild, message, command, args) => {
    //Get player
    var player = message.member;
    if (args.length != 0) {
        //Get command
        var option = args.shift().toLowerCase();
        //Switch case on command
        switch (option) {
            case 'start': case 's': //Start with normal region
                StartAkinator('en', bot, guild, message, player);
                break;
            case 'objects': case 'object': case 'obj': case 'o': //Start with object region
                StartAkinator('en_object', bot, guild, message, player);
                break;
            case 'animals': case 'animal': case 'anim': case 'a': //Start with animal region
                StartAkinator('en_animals', bot, guild, message, player);
                break;
            default:
                HelpMessage(bot, guild, message, args);
                break;
        }
    } else {
        StartAkinator('en', bot, guild, message, player);
    }
}

//Start akinator
function StartAkinator(region, bot, guild, message, player) {
    //Create new game
    const newAkinatorGame = new AkinatorGame(bot, guild, message, player, region);
    //Attach user to each game
    bot.akinatorGames.set(player.id, newAkinatorGame);

    //Start the game
    bot.akinatorGames.get(player.id).StartGame();
}

//Functions
function HelpMessage(bot, guild, message, args) {
    message.WaffleResponse(
        `This is the Akinator game in discord. Please use *${guild.Prefix}akinator [:?start / object / animal]* to start a game.`,
        MTYPE.Error, null, true, 'Thanks, and have a good day');
}