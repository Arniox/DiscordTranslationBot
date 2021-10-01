//Import classes
const Discord = require('discord.js');
const { CardGame } = require('../../classes/cards.js');
//Import functions

exports.run = (bot, guild, message, command, args) => {
    //Get player
    var player = message.member;
    if (args.length != 0) {
        //Get command
        var option = args.shift().toLowerCase();
        //Switch case on command
        switch (option) {
            case 'shuffle': case 'shuff': case 'shu': case 'sh':
                break;
            case 'revealhand': case 'reveal': case 'revealmy': case 'revealmyhand':
            case 'rev': case 're':
                break;
            case 'createnewpile': case 'createnew': case 'create': case 'pile':
            case 'newpile': case 'new': case 'npile': case 'pilenew': case 'pilen':
                break;
            case 'discardcard': case 'discard': case 'getridof': case 'getrid':
            case 'rid': case 'ridcard': case 'discard': case 'carddis': case 'cardrid':
            case 'dis': case 'removecard': case 'removecards': case 'remcard': case 'remcards':
            case 'cardsrem': case 'cardrem': case 'cardsremove': case 'cardremove':
                break;
            case 'drawcard': case 'draw': case 'carddraw': case 'pickup': case 'up':
            case 'pick': case 'cardpick': case 'pickcard': case 'pcard': case 'cardp':
            case 'drawc': case 'cdraw':
                break;
            default:
                break;
        }
    } else {
        //Check if game is already underway
        if (!bot.cardGames.get(GetGameId(message))) {
            StartCardGame(bot, message, player);
        } else {
            message.WaffleResponse(`Game Already Underway in this Channel.`);
        }
    }
}

//Start Card Game
function StartCardGame(bot, message, player) {
    //Create new game
    const newCardGame = new CardGame(bot, message.guild, message, player)
        //.SetRules(bot.GameRuleSets.get('Poker'))
        .Build();
    //Attach game and server
    bot.cardGames.set(GetGameId(message), newCardGame);

    //Start the game
    bot.cardGames.get(GetGameId(message)).ConstructGame();
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