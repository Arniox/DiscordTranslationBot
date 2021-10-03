//Import classes
const Discord = require('discord.js');
const { UserInterface } = require('../../classes/cards.js');
//Import functions

exports.run = (bot, guild, message, command, args) => {
    //Get player
    var player = message.member;
    var mentions = message.mentions.members; //Get all mentions

    if (args.length != 0) {
        //Remove end of array to get rid of command
        args.pop();
        //Run game 
        bot.cardGames.get(GetGameId(message)).Play(player, command, args, mentions);
    } else {
        //Check if game is already underway
        if (!bot.cardGames.get(GetGameId(message))) {
            if (!bot.akinatorGames.get(message.member.id)) {
                StartCardGame(bot, message, player);
            } else {
                message.WaffleResponse(`You are already in an Akinator game, please end this before starting a Card Game`);
            }
        } else {
            message.WaffleResponse(`Game Already Underway in this Channel.`);
        }
    }
}

//Start Card Game
function StartCardGame(bot, message, player) {
    //Create new game
    const newCardGame = new UserInterface(bot, message.guild, message, player).Get()
        //.SetRules(bot.GameRuleSets.get('Poker'))
        .Build();

    //Attach game and server
    bot.cardGames.set(GetGameId(message), newCardGame);
    //Start the game
    bot.cardGames.get(GetGameId(message)).Start();
}

//Delete card game
function DeleteCardGame(bot, guild, message, player) {
    //Delete
    bot.cardGames.delete(GetGameId(message));
}

//Function get game id
function GetGameId(message) {
    return `${message.guild.id}-${message.channel.id}`;
}