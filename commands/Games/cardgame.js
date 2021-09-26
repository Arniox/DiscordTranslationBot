//Import classes
const Discord = require('discord.js');
const CardGame = require('../../classes/cards.js');
//Import functions

exports.run = (bot, guild, message, command, args) => {
    //Get player
    var player = message.member;
    if (args.length != 0) {
        //Get command
        var option = args.shift().toLowerCase();
        //Switch case on command
        switch (option) {
            default:
                break;
        }
    } else {
        StartCardGame(bot, guild, message, player);
    }
}

//Start Card Game
function StartCardGame(bot, guild, message, player) {
    //Create new game
    const newCardGame = new CardGame(bot, guild, message, player);
    //Attach game and server
    bot.cardGames.set(`${newCardGame.gameId}`, newCardGame);

    //Start the game
    bot.cardGames.get(`${newCardGame.gameId}`).ConstructGame();
}