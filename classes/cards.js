//Import
const Discord = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { createCanvas, Image } = require('canvas');
const EventEmitter = require('events');
const { CardAPI } = require('./cardapi.js');
//Import functions
require('../message-commands.js')();

class UserInterface {
    constructor(bot, guild, message, player) {
        //Set all
        this.guild = guild;
        this.message = message;
        this.player = player;
        this.bot = bot;
        //Systems
        this.CardGame

        return this;
    }

    //Construct game call
    Get() {
        this.CardGame = new CardGame(this.bot, this.guild, this.message, this.player);
        return this;
    }
    SetRules(rules) {
        this.CardGame.SetRules(rules);
        return this;
    }
    Build() {
        this.CardGame.Build();
        return this;
    }
    Start() {
        this.CardGame.ConstructGame();
        return this;
    }

    //Play card
    Play(player, roughStep, args, mentions) {
        //Check if player is in this game
        if (this.IsPlayerPlaying(player)) {
            //Get actual step
            const step = Object.values(this.CardGame.CardSystem.CallBacks).filter(v => v.command.filter(i => i == roughStep.toLowerCase())[0])[0];

            //Check if stepsDirection exists and then check step
            const go = (() => {
                //Check if step exists in the commands at all
                if (step) {
                    //Check if step allowed in current game
                    if (this.CardGame.CardSystem.stepDescription) {
                        const pileName = this.CardGame.CardSystem.GetPileId(player),
                            pile = this.CardGame.CardSystem.piles.filter(v => v.pileName == pileName)[0];
                        //Check if pile was found
                        if (pile) {
                            //Check if step exists
                            if (pile.stepDescription.filter(v => v.case == step.name)[0]) {
                                return true;
                            } else return false;
                        } else {
                            this.message.WaffleResponse(`I couldn't find your hand ${player.toString()}. Try restart this game.`)
                                .then((sent) => {
                                    sent.delete({ timeout: 3000 }).catch(error => { });
                                });
                            return false;
                        }
                    } else return true;
                } else return false;
            })();

            if (go) {
                const parsedArgs = this.ParseArgs(player, step, args, mentions);
                //Only play if parsedArgs exists
                if (parsedArgs) {
                    this.CardGame.CardSystem.AggregateStep(player, step.name, parsedArgs);
                }
            } else {
                this.CardGame.CardSystem.StepDoesntExist(roughStep);
            }
        }
    }

    //Parse args
    ParseArgs(player, step, args, mentions) {
        const parsedArgs = (() => {
            if (mentions.size == 0 || this.IsGameOwner(player, step)) {
                switch (step.name) {
                    case 'play':
                        //Get cards
                        var cards = args.filter(v => /^([AJQK0-9]+[HCDS])$/gi.test(v));
                        //Remove cards from args
                        args = args.filter(v => !/^([AJQK0-9]+[HCDS])$/gi.test(v));
                        var showStatus = args.shift(),
                            showStatusBool = showStatus ?
                                showStatus.toLowerCase() == 'hide' || showStatus.toLowerCase() == 'h' :
                                true;

                        if (cards.length > 0 && (showStatus || !showStatus)) {
                            return [
                                /*player*/ player,
                                /*pileName*/ null,
                                /*cardToDiscard*/ cards,
                                /*revealCard*/ showStatusBool,
                                /*checkTurn*/ true,
                                /*goToDiscardPile*/ true,
                                /*play*/ true
                            ];
                        } else return null;
                    case 'shuffle':
                        //Check if owner
                        if (this.IsGameOwner(player, step)) {
                            return [
                                /*player*/ player,
                                /*checkTurn*/ false
                            ];
                        } else return null;
                    case 'reveal':
                        //Get number/all
                        var getStatus = args.filter(v => /^((all)|[0-9]+)$/gi.test(v))[0];
                        //Remove from args
                        args = args.filter(v => !/^((all)|[0-9]+)$/gi.test(v));
                        var pileReq = mentions.size > 0 ? mentions.first() : args.shift(),
                            playerInsert = pileReq ? null : player,
                            pileInsert = pileReq ? mentions.size > 0 ?
                                this.CardGame.CardSystem.GetPileId(pileReq) :
                                this.CardGame.CardSystem.GetPileId(null, pileReq) : null,
                            getValue = getStatus ? /^\d+$/.test(getStatus) ? parseInt(getStatus) : getStatus : 'all',
                            checkTurn = this.IsGameOwner(player, step) ? false : true;

                        //If user is trying to reveal another pile or player, check it's the owner
                        if (!pileInsert || this.IsGameOwner(player, step)) {
                            if (getValue && (playerInsert || pileInsert)) {
                                return [
                                    /*player*/ playerInsert,
                                    /*pileName*/ pileInsert,
                                    /*numberOfCardsToShow*/ getValue,
                                    /*checkTurn*/ checkTurn
                                ];
                            } else return null;
                        } else return null;
                    case 'show':
                        //Get cards
                        var cards = args.filter(v => /^([AJQK0-9]+[HCDS])$/gi.test(v));
                        //Remove cards from args
                        args = args.filter(v => !/^([AJQK0-9]+[HCDS])$/gi.test(v));

                        if (cards.length > 0) {
                            return [
                                /*player*/ player,
                                /*pileName*/ null,
                                /*cardToShow*/ cards,
                                /*checkTurn*/ true
                            ];
                        } else return null;
                    case 'create':
                        //Check if owner
                        if (this.IsGameOwner(player, step)) {
                            //Get pilename
                            var pileReq = args.filter(v => /^([A-Z]+)$/gi.test(v))[0];
                            //Remove froms args
                            args = args.filter(v => !/^([A-Z]+)$/gi.test(v));
                            var numberCardReq = args.shift(),
                                numberParsed = numberCardReq ? numberCardReq : '1',
                                numberValue = /^\d+$/.test(numberParsed) ? parseInt(numberValue) : 1;

                            if (pileReq && numberValue) {
                                return [
                                    /*pileName*/ pileReq,
                                    /*numberOfCards*/ numberValue,
                                    /*showMessage*/ true
                                ];
                            } else return null;
                        } else return null;
                    case 'clearcards':
                        //Get number/all & show/hide
                        var getStatus = args.filter(v => /^((all)|[0-9]+)$/gi.test(v))[0],
                            showStatus = args.filter(v => /^((show)|(s)|(hide)|(h))$/gi.test(v))[0]
                        //Remove from args
                        args = args.filter(v => !/^((all)|[0-9]+)$/gi.test(v));
                        args = args.filter(v => !/^((show)|(s)|(hide)|(h))$/gi.test(v));
                        var pileReq = mentions.size > 0 ? mentions.first() : args.shift(),
                            playerInsert = pileReq ? null : player,
                            pileInsert = pileReq ? mentions.size > 0 ?
                                this.CardGame.CardSystem.GetPileId(pileReq) :
                                this.CardGame.CardSystem.GetPileId(null, pileReq) : null,
                            getValue = getStatus ? /^\d+$/.test(getStatus) ? parseInt(getStatus) : getStatus : 'all',
                            showValue = showStatus ?
                                (showStatus.toLowerCase() == 'hide' || showStatus.toLowerCase() == 'h' ? 0 : 'all') :
                                'all',
                            checkTurn = this.IsGameOwner(player, step) ? false : true;

                        //If user is trying to clear cards from another pile or player, check it's the owner
                        if (!pileInsert || this.IsGameOwner(player, step)) {
                            if (getValue && (playerInsert || pileInsert)) {
                                return [
                                    /*player*/ playerInsert,
                                    /*pileName*/ pileInsert,
                                    /*numberToDiscard*/ getValue,
                                    /*revealCardNumber*/ showValue,
                                    /*checkTurn*/ checkTurn,
                                    /*goToDiscardPile*/ false,
                                    /*play*/ null
                                ];
                            } else return null;
                        } else return null;
                    case 'discardcards':
                        //IDENTICAL to play but with play option set to false
                        //Get cards
                        var cards = args.filter(v => /^([AJQK0-9]+[HCDS])$/gi.test(v));
                        //Remove cards from args
                        args = args.filter(v => !/^([AJQK0-9]+[HCDS])$/gi.test(v));
                        var showStatus = args.shift(),
                            showStatusBool = showStatus ?
                                showStatus.toLowerCase() == 'hide' || showStatus.toLowerCase() == 'h' :
                                true;

                        if (cards.length > 0 && (showStatus || !showStatus)) {
                            return [
                                /*player*/ player,
                                /*pileName*/ null,
                                /*cardToDiscard*/ cards,
                                /*revealCard*/ showStatusBool,
                                /*checkTurn*/ true,
                                /*goToDiscardPile*/ true,
                                /*play*/ null
                            ];
                        } else return null;
                    case 'draw':
                        //Get number
                        var getStatus = args.filter(v => /^([0-9]+)$/gi.test(v))[0];
                        //Remove from args
                        args = args.filter(v => !/^([0-9]+)$/gi.test(v));
                        var pileReq = mentions.size > 0 ? mentions.first() : args.shift(),
                            playerInsert = pileReq ? null : player,
                            pileInsert = pileReq ? mentions.size > 0 ?
                                this.CardGame.CardSystem.GetPileId(pileReq) :
                                this.CardGame.CardSystem.GetPileId(null, pileReq) : null,
                            getValue = getStatus ? /^\d+$/.test(getStatus) ? parseInt(getStatus) : 1 : 1,
                            checkTurn = this.IsGameOwner(player, step) ? false : true;

                        if (!pileInsert || this.IsGameOwner(player, step)) {
                            if (getValue && (playerInsert || pileInsert)) {
                                return [
                                    /*player*/ playerInsert,
                                    /*pileName*/ pileInsert,
                                    /*numberToDraw*/ getValue,
                                    /*multiDraw*/ false,
                                    /*checkTurn*/ checkTurn
                                ];
                            } else return null;
                        } else return null;
                    case 'drawallcards':
                        //Check if owner
                        if (this.IsGameOwner(player, step)) {
                            //Get number
                            var getStatus = args.filter(v => /^([0-9]+)$/gi.test(v))[0];
                            //Remove from args
                            args = args.filter(v => !/^([0-9]+)$/gi.test(v));
                            var getValue = getStatus ? /^\d+$/.test(getStatus) ? parseInt(getStatus) : 1 : 1;

                            if (getValue) {
                                return [
                                    /*numberEach*/ getValue
                                ];
                            } else return null;
                        } else return null;
                    case 'turn':
                        //Plus turn
                        return [];
                    case 'reverseturn':
                        //Minus turn
                        return [];
                    case 'deck':
                        //Draw deck
                        return [];
                    default: return null;
                }
            } else {
                this.message.WaffleResponse(`Sorry, ${step.name} is only an game Owner command`).then((sent) => {
                    sent.delete({ timeout: 3000 }).catch(() => { });
                });
                return null;
            };
        })();

        //Return
        if (!parsedArgs) this.message.WaffleResponse(`Sorry, Couldn't parse your command`)
            .then((sent) => {
                sent.delete({ timeout: 3000 }).catch(() => { });
            });
        return parsedArgs;
    }

    //Is owner
    IsGameOwner(player, step) {
        return this.CardGame.CardSystem.player.id == player.id ||
            (step.whocan ? step.whocan.id == player.id : true);
    }

    //Is player playing
    IsPlayerPlaying(player) {
        if (this.CardGame)
            if (this.CardGame.CardSystem)
                return this.CardGame.CardSystem.IsPlayerPlaying(player);
            else return false;
        else return false;
    }

    //Is game started
    IsGameStarted() {
        if (this.CardGame)
            return this.CardGame.gameStarted;
        else return false;
    }
}

class CardGame {
    //Card game constructor
    constructor(bot, guild, message, player) {
        //Set all
        this.guild = guild;
        this.message = message;
        this.player = player;
        this.bot = bot;
        //Systems
        this.CardSystem;
        this.gameStarted = false;
        //Rule set values
        this.backOfDeck;
        this.cardsToStartWith;
        this.drawDeckOnStart = true;
        this.startingPiles;
        this.drawPileOnStart;
        this.stepDescription;
        this.numberOfDecksToStartWith;
        this.jokersIncluded;
    }

    //Construct game
    ConstructGame() {
        //Construct message fields
        const messageFields = [
            {
                name: 'Join Up',
                value: `To join this game, please react with ✅\nTo leave a game in preperation phase, simply remove your reaction.`,
                inline: true
            }, {
                name: `Start Game`,
                value: `When you're ready:\n${this.CardSystem.player.toString()} react with ▶️ to start the game`,
                inline: true
            }, this.CardSystem.GetPlayersList()
        ];
        if (!this.cardsToStartWith)
            messageFields.push({
                name: 'How Many Cards?',
                value: `${this.CardSystem.player.toString()} please type how many cards you want each player to start with?`
            });

        //Send message
        this.CardSystem.message.WaffleResponse(
            `Preparing New Card Game For ${this.CardSystem.player.toString()}`, MTYPE.Loading,
            messageFields, false, `Game Id: ${this.CardSystem.gameId}`
        ).then((sent) => {
            sent.react('✅')
                .then(() => sent.react('▶️'))
                .then(() => {
                    //Message filter and collector
                    const reactionFilter = (reaction, user) => {
                        return ['✅', '▶️'].includes(reaction.emoji.name) && user.id != this.guild.me.id;
                    }
                    //Create reaction collector
                    const reactionCollector = sent.createReactionCollector(reactionFilter, { max: 1, time: 100000, dispose: true });

                    //Message filter and collector
                    const messageFilter = m => m.member.id == this.CardSystem.player.id &&
                        m.member.id != this.guild.me.id && m.content;
                    const messageCollector = sent.channel.createMessageCollector(messageFilter, { time: 100000, dispose: true });

                    //Await message collector collect
                    messageCollector.on('collect', m => {
                        if (!this.cardsToStartWith) {
                            m.delete({ timeout: 100 }).catch(() => { }); //Delete message
                            var mess = m.content.toLowerCase();

                            //Create error message
                            var errorMessage = (text) => {
                                this.CardSystem.message.WaffleResponse(text)
                                    .then((errorSent) => {
                                        errorSent.delete({ timeout: 3000 }).catch(() => { });
                                    });
                                //Reset timer
                                reactionCollector.resetTimer(); messageCollector.resetTimer();
                            }

                            //Check mess is a number
                            if (mess) {
                                if (/^\d*(.\d+)*$/.test(mess)) {
                                    //Get number
                                    var number = parseInt(mess);

                                    //Check if number is under 20 (max deck count)
                                    if (number <= 54) {
                                        this.CardSystem.numberOfCards = number;
                                        //Edit preperation message
                                        const embed = sent.embeds[0];
                                        embed.fields[3] = {
                                            name: 'How Many Decks?',
                                            value: `There will be ${this.CardSystem.numberOfCards} cards delt to each player!`
                                        }
                                        sent.edit(embed);

                                        //Stop message collector
                                        messageCollector.stop();
                                        //Reset timer
                                        reactionCollector.resetTimer();
                                    } else {
                                        errorMessage(`Sorry, ${number} is over the maximum cards per player of 10.`);
                                    }
                                } else {
                                    errorMessage(`Sorry, ${mess} was not a number`);
                                }
                            } else {
                                errorMessage(`Sorry, I didn't understand what you meant...`);
                            }
                        } else messageCollector.stop();
                    });

                    //Await reaction
                    reactionCollector.on('collect', (reaction, user) => {
                        if (reaction.emoji.name === '✅' && user.id != this.CardSystem.player.id) {
                            const player = this.CardSystem.guild.members.cache.get(user.id);
                            if (this.CardSystem.players.filter(v => v.id == player.id).length == 0) {
                                this.CardSystem.players.push(player);
                                this.CardSystem.numberOfPlayers = this.CardSystem.players.length;

                                //Edit message
                                const embed = sent.embeds[0];
                                embed.fields[3] = this.CardSystem.GetPlayersList();
                                sent.edit(embed);

                                //Send message to player
                                user.send(new Discord.MessageEmbed()
                                    .setDescription('You have joined the new Card Game! Please wait for the game to start.')
                                    .setColor('#0099ff')
                                    .setTimestamp()
                                    .setFooter(`Game Id: ${this.CardSystem.gameId}`));
                            }
                            //Reset timer and empty collector
                            reactionCollector.empty();
                            reactionCollector.resetTimer(); messageCollector.resetTimer();
                        } else if ((reaction.emoji.name === '✅' && user.id == this.CardSystem.player.id) || (reaction.emoji.name === '▶️' && user.id != this.CardSystem.player.id)) {
                            //Remove reactions by this user
                            sent.reactions.cache.map((v, k) => v)
                                .filter(re => re.users.cache.has(user.id) && re.emoji.name == reaction.emoji.name).first().users.remove(user.id);

                            //Reset timer and empty collector
                            reactionCollector.empty();
                            reactionCollector.resetTimer(); messageCollector.resetTimer();
                        } else if (reaction.emoji.name === '▶️' && user.id == this.CardSystem.player.id) {
                            //Loading message
                            sent.edit(new Discord.MessageEmbed()
                                .setDescription('Loading...')
                                .setColor('#FFCC00')
                                .setFooter(`Game Id: ${this.CardSystem.gameId}`));

                            //Message all users
                            this.CardSystem.players.forEach(async ply => {
                                await ply.send(new Discord.MessageEmbed()
                                    .setDescription('Game is Starting! Get Ready')
                                    .setColor('#09b50c')
                                    .setTimestamp()
                                    .setFooter(`Game Id: ${this.CardSystem.gameId}`));
                            });

                            //Start game
                            reactionCollector.stop();
                        }
                    });
                    //Await remove
                    reactionCollector.on('remove', (reaction, user) => {
                        console.log('remove emitted');

                        if (reaction.emoji.name === '✅' && user.id != this.CardSystem.player.id) {
                            const player = this.CardSystem.guild.members.cache.get(user.id);

                            this.CardSystem.players = this.CardSystem.players.filter(v => v.id != player.id)
                            this.CardSystem.numberOfPlayers = this.CardSystem.players.length;

                            //Edit message
                            const embed = sent.embeds[0];
                            embed.fields[3] = this.GetPlayersList();
                            sent.edit(embed);

                            //Send message to player
                            user.send(new Discord.MessageEmbed()
                                .setDescription('You have left the new Card Game! See you next time.')
                                .setColor('#b50909')
                                .setTimestamp()
                                .setFooter(`Game Id: ${this.gameId}`));

                            //Reset timer and empty collector
                            reactionCollector.empty();
                            reactionCollector.resetTimer(); messageCollector.resetTimer();
                        }
                    });
                    //Await end
                    reactionCollector.on('end', r => {
                        //Stop message collector
                        messageCollector.stop();

                        //Remove reactions and then start game
                        sent.delete({ timeout: 3000 })
                            .then(() => {
                                this.CardSystem.StartGame()
                                    .then(() => {
                                        this.EnforceRules(); //Enforce game rules
                                        this.gameStarted = true;
                                    }).catch((error) => {
                                        console.error(error);
                                        this.message.WaffleResponse(`There was an error: ${error.message}`);
                                    });
                            }).catch((error) => {
                                console.error(error);
                                this.CardSystem.message.WaffleResponse(`There was an error ${error}`);
                                return;
                            });
                    });
                });
        }).catch(error => {
            console.error(error);
            this.CardSystem.message.WaffleResponse('There was an error in the creation of this card game. Please try again');
        });
    }

    //Set rules
    SetRules(rules) {
        this.backOfDeck = rules.backOfDeck;
        this.cardsToStartWith = rules.cardsToStartWith;
        this.drawDeckOnStart = rules.drawDeckOnStart;
        this.startingPiles = rules.startingPiles;
        this.drawPileOnStart = rules.drawPileOnStart;
        this.stepDescription = rules.stepDescription;
        this.numberOfDecksToStartWith = rules.numberOfDecksToStartWith;
        this.jokersIncluded = rules.jokersIncluded;
        this.shuffledDeck = rules.shuffledDeck;
    }

    //Build
    Build() {
        this.CardSystem = new CardSystem(this.bot, this.guild, this.message, this.player,
            //Custom values
            this.backOfDeck,
            this.cardsToStartWith,
            this.drawDeckOnStart,
            this.stepDescription,
            this.numberOfDecksToStartWith,
            this.jokersIncluded,
            this.shuffledDeck);
    }

    //Enforce rules
    async EnforceRules() {
        try {
            //Starting piles
            if (this.startingPiles) {
                for (var i = 0; i < this.startingPiles.length; i++) {
                    //If on event
                    if (this.startingPiles[i].onRound == 1) {
                        await this.CardSystem.CreateNewPile(
                            this.startingPiles[i].pileName,
                            this.startingPiles[i].numberOfCards,
                            false
                        );
                    } else {
                        const thisStartingPile = this.startingPiles[i];
                        //Add after certain round
                        this.CardSystem.RoundEvent.on('RoundCounter', async (round) => {
                            //If round is equal
                            if (round >= thisStartingPile.onRound) {
                                //Create
                                await this.CardSystem.CreateNewPile(
                                    thisStartingPile.pileName,
                                    thisStartingPile.numberOfCards,
                                    false
                                );

                                //Draw pile on creation
                                if (this.drawPileOnStart) {
                                    if (this.drawPileOnStart == thisStartingPile.pileName) {
                                        const numberToReveal = thisStartingPile.revealed;
                                        //Draw hand
                                        this.CardSystem.RevealHand(null,
                                            this.drawPileOnStart,
                                            numberToReveal,
                                            false);
                                    }
                                }
                            }
                        });
                    }
                }
            }
            //Draw a pile on start
            if (this.drawPileOnStart) {
                //Get piles
                const pilesToDraw = this.startingPiles.filter(v => v.pileName == this.drawPileOnStart);
                if (pilesToDraw.length > 0) {
                    //If pile is to be drawn on round 1
                    if (pilesToDraw[0].onRound == 1) {
                        const numberToReveal = pilesToDraw[0].revealed;
                        //Draw hand
                        this.CardSystem.RevealHand(null,
                            this.drawPileOnStart,
                            numberToReveal,
                            false);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            this.message.WaffleResponse(`There was an error ${error}`);
        }
    }
}

class CardSystem {
    //Card system constructor
    constructor(bot, guild, message, player,
        backOfDeck = null, cardsToStartWith = null, drawDeckOnStart = null, stepDescription = null,
        numberOfDecksToStartWith = null, jokersIncluded = null, shuffledDeck = null) {
        //Set all
        this.guild = guild;
        this.message = message;
        this.player = player;
        this.bot = bot;
        //Game details
        this.gameId = uuidv4();
        this.deck;
        this.numberOfPlayers = 1;
        this.piles = [];
        this.players = [];
        this.turnIndex = 0;
        this.turnCounter = 0;
        this.roundIndex = 1;
        //Card details
        this.cardWidth = 226;
        this.cardHeight = 314;
        this.cardSpacing = 5; //Pixels
        this.backOfCard = 'https://gcdn.pbrd.co/images/q08nAKRV1vH1.png?o=1';/*'../assets/back-of-card.png';*/
        //Rules
        this.numberOfCards = (cardsToStartWith ? cardsToStartWith : 5);
        this.numberOfDecks = (numberOfDecksToStartWith ? numberOfDecksToStartWith : 1);
        this.jokersIncluded = (jokersIncluded ? jokersIncluded : false);
        this.shuffledDeck = (shuffledDeck ? shuffledDeck : true);
        this.backOfDeck = backOfDeck;
        this.drawDeckOnStart = drawDeckOnStart;
        this.stepDescription = stepDescription;
        //Events
        this.RoundEvent = new EventEmitter();
        //Card api
        this.CardAPI = new CardAPI();

        this.players.push(this.player);
    }

    //Enum
    CallBacks = {
        PLAY: {
            name: 'play',
            command: ['playcard', 'cardplay', 'play', 'pl'],
            callback: ((args) => { this.DiscardCard(...args) }),
            whocan: null
        },
        SHUFFLE: {
            name: 'shuffle',
            command: ['shuffledeck', 'shufflecards', 'shuffle', 'shuff', 'shuf', 'sh'],
            callback: ((args) => { this.ShuffleDeck(...args) }),
            whocan: this.player
        },
        REVEAL: {
            name: 'reveal',
            command: ['revealhand', 'revealcards', 'reveal', 'rev'],
            callback: ((args) => { this.RevealHand(...args) }),
            whocan: null
        },
        SHOW: {
            name: 'show',
            command: ['showhand', 'showcards', 'show', 'sho'],
            callback: ((args) => { this.RevealSpecificHand(...args) }),
            whocan: null
        },
        CREATE: {
            name: 'create',
            command: ['createpile', 'createcards', 'create', 'cre'],
            callback: ((args) => { this.CreateNewPile(...args) }),
            whocan: this.player
        },
        CLEARCARDS: {
            name: 'clearcards',
            command: ['clearcards', 'clearhand', 'deletecards', 'deletehand', 'clear', 'delete', 'del', 'cl'],
            callback: ((args) => { this.DiscardCardsFromTop(...args) }),
            whocan: null
        },
        DISCARDCARDS: {
            name: 'discardcards',
            command: ['discardcards', 'discardhand', 'discard', 'dis'],
            callback: ((args) => { this.DiscardCard(...args) }),
            whocan: this.player
        },
        DRAW: {
            name: 'draw',
            command: ['drawcard', 'carddraw', 'pickupcard', 'cardpickup', 'pickup', 'card', 'pick', 'pi', 'ca'],
            callback: ((args) => { this.DrawCard(...args) }),
            whocan: null
        },
        DRAWALLCARDS: {
            name: 'drawallcards',
            command: ['dealoutcards', 'dealout', 'dealcards', 'deal', 'dealt', 'de'],
            callback: ((args) => { this.DrawAllCards(...args) }),
            whocan: this.player
        },
        DECK: {
            name: 'deck',
            command: ['showdeck', 'deckshow', 'deck'],
            callback: ((args) => { this.DrawDeckAndDiscard(...args) }),
            whocan: null
        },
        TURN: {
            name: 'turn',
            command: ['goturn', 'turngo', 'go', 'turn', 'tur', 'tu', 't', 'plus', 'turnplus', 'plusturn'],
            callback: ((args) => { this.TurnPlus(...args) }),
            whocan: null
        },
        REVERSE: {
            name: 'reverseturn',
            command: ['backturn', 'turnback', 'back', 'reverse', 'minus', 'turnminus', 'minusturn'],
            callback: ((args) => { this.TurnMinus(...args) }),
            whocan: null
        }
    }

    //Start Game
    StartGame() {
        return new Promise(async (resolve, reject) => {
            try {
                //Generate the deck and piles
                var newDeck = this.CardAPI.New(this.shuffledDeck, this.numberOfDecks, this.jokersIncluded);

                //Set up new deck
                this.deck = newDeck;
                this.turnIndex = randInt(0, this.numberOfPlayers - 1);

                //Deal all cards to players
                await this.DrawAllCards();
                //Map stepDescription to all players
                this.MapStepsToPlayers();

                if (this.drawDeckOnStart)
                    //Draw Deck and discard pile
                    this.DrawDeckAndDiscard();
                else this.TurnMessage();

                resolve();
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    //Reshuffle Deck
    async ShuffleDeck(player, checkTurn = true) {
        if (this.IsPlayerGo(player, (this.player.id == player.id || checkTurn))) {
            //Shuffle deck
            this.CardAPI.Shuffle(this.deck.deck_id);
            //Send message
            this.message.WaffleResponse(
                `Shuffled The Deck\n${this.deck.remaining} Cards left in the Deck`,
                MTYPE.Success, null, false,
                `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
                {
                    name: this.player.user.username,
                    url: this.player.user.avatarURL()
                });
        }
    }

    //Reveal Hand
    async RevealHand(player = null, pileName = null, numberOfCardsToShow = 'all', checkTurn = true) {
        //Check if player
        const pileNameToUse = (() => {
            if (player)
                if (this.IsPlayerGo(player, checkTurn))
                    return this.GetPileId(player);
                else return null;
            else if (pileName)
                return this.GetPileId(null, pileName);
            else return null;
        })();

        if (pileNameToUse) {
            if (this.piles.filter(v => v.pileName == pileNameToUse).length > 0) {
                //Get pile
                var numberOfCardsToShowCount = 0,
                    pileLength = this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds.length;

                //Cap number of cards to show
                numberOfCardsToShow = (!isNaN(numberOfCardsToShow) ?
                    numberOfCardsToShow > pileLength ? pileLength : numberOfCardsToShow : numberOfCardsToShow);
                //Set pile revealed cards
                this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds = (() => {
                    if (!isNaN(numberOfCardsToShow)) {
                        return this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds.map(v => ({
                            id: v.id,
                            name: v.name,
                            image: v.image,
                            revealed: ((numberOfCardsToShowCount += 1) <= numberOfCardsToShow ? true : false)
                        }));
                    } else {
                        return this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds.map(v => ({
                            id: v.id,
                            name: v.name,
                            image: v.image,
                            revealed: true
                        }));
                    }
                })();

                //Draw Deck
                this.PenDrawPile(pileNameToUse, false)
                    .then((messageAttachment) => {
                        const newEmbed = new Discord.MessageEmbed()
                            .setDescription(`Here is ${(player ? 'My Cards' : `the ${pileNameToUse}'s Cards`)}:`)
                            .setColor('#000000')
                            .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`)
                            .setImage(`attachment://${messageAttachment.name}`);

                        if (player) newEmbed.setAuthor(player.user.username, player.user.avatarURL());
                        else if (pileName) newEmbed.setAuthor(this.player.user.username, this.player.user.avatarURL());

                        //Send
                        this.message.channel.send({ embed: newEmbed, files: [messageAttachment] }).catch((error) => console.error(error));
                    }).catch((error) => {
                        console.error(error);
                        this.message.WaffleResponse(`There was an error: ${error}`);
                    });
            } else {
                this.message.WaffleResponse(`${pileNameToUse} wasn't found. The discard pile is created dynamically when cards are in play`)
                    .then((sent) => {
                        sent.delete({ timeout: 3000 }).catch(error => { });
                    });
            }
        }
    }

    //Reveal Specific Card
    async RevealSpecificHand(player = null, pileName = null, cardToShow = [], checkTurn = true) {
        //Check if player
        const pileNameToUse = (() => {
            if (cardToShow.length > 0)
                if (player)
                    if (this.IsPlayerGo(player, checkTurn) && this.DoesPileHaveCards(this.GetPileId(player)) && this.DoCardsExistInPile(this.GetPileId(player), cardToShow))
                        return this.GetPileId(player);
                    else return null;
                else if (pileName)
                    if (this.DoesPileHaveCards(this.GetPileId(null, pileName)) && this.DoCardsExistInPile(this.GetPileId(null, pileName), cardToShow))
                        return this.GetPileId(null, pileName);
                    else return null;
                else return null;
            else return null;
        })();

        if (pileNameToUse) {
            //Set pile revealed cards
            this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds.filter(o => this.FindCardsInPile_CallBack(o, cardToShow))[0] =
                this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds.filter(o => this.FindCardsInPile_CallBack(o, cardToShow))[0].map(v => ({
                    id: v.id,
                    name: v.name,
                    image: v.image,
                    revealed: true
                }));

            //Draw Deck
            this.PenDrawPile(pileNameToUse, false)
                .then((messageAttachment) => {
                    const newEmbed = new Discord.MessageAttachment()
                        .setDescription(`Here is some ${(player ? 'of my cards.' : `cards from ${pileNameToUse}`)}:`)
                        .setColor('#000000')
                        .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`)
                        .setImage(`attachment://${messageAttachment.name}`);

                    if (player) newEmbed.setAuthor(player.user.username, player.user.avatarURL());
                    else if (pileName) newEmbed.setAuthor(this.player.user.username, this.player.user.avatarURL());

                    //Send
                    this.message.channel.send({ embed: newEmbed, files: [messageAttachment] }).catch((error) => console.error(error));
                }).catch((error) => {
                    console.error(error);
                    this.message.WaffleResponse(`There was an error: ${error}`);
                });
        }
    }

    //Create pile
    async CreateNewPile(pileName, numberOfCards = 1, showMessage = true) {
        try {
            //Loading message
            var sent = await (async () => {
                if (showMessage) {
                    return await this.message.WaffleResponse(`Dealing ${numberOfCards} Card(s) to ${pileName}`,
                        MTYPE.Loading, null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
                        {
                            name: this.player.user.username,
                            url: this.player.user.avatarURL()
                        });
                } else return null;
            })();

            //Draw cards from deck
            const returnedCards = this.CardAPI.Draw(this.deck.deck_id, numberOfCards);

            //Send cards to new pile
            var cardIds = returnedCards.cards.map(v => v.code),
                existingPile = this.piles.filter(v => v.pileName == pileName);
            this.CardAPI.AddToPile(this.deck.deck_id, pileName, `${cardIds.join(',')}`);

            //Get list of cards
            const listOfCards = this.CardAPI.ListCardsPile(this.deck.deck_id, pileName);
            cardIds = listOfCards.piles.cards.map(v => ({
                id: v.code,
                name: `${v.value} ${v.suit}`,
                image: v.image,
                revealed: false
            }));
            //Update deck remaining
            this.deck.remaining = listOfCards.remaining;

            //Edit piles
            const pile = {
                player: this.player,
                pileName: this.GetPileId(null, pileName),
                pileData: {
                    remaining: listOfCards.piles.remaining,
                    listIds: cardIds
                }
            };

            //Check if pile already exists
            if (existingPile[0])
                this.piles.filter(v => v.pileName == pileName)[0].pileData.listIds = cardIds;
            else
                this.piles.push(pile);

            //Edit message
            if (sent)
                sent.edit(new Discord.MessageEmbed()
                    .setDescription(`Dealt ${numberOfCards} Cards(s) to ${pileName}`)
                    .setAuthor(this.player.user.username, this.player.user.avatarURL())
                    .setColor('#09b50c')
                    .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`));
        } catch (error) {
            console.error(error);
            await this.EndOfDeck_CallBack(error);
        }
    }

    //Discard specific card
    async DiscardCard(player = null, pileName = null, cardToDiscard = [], revealCard = true, checkTurn = true, goToDiscardPile = false, play = null) {
        //Check if player
        const pileNameToUse = (() => {
            if (cardToDiscard.length > 0)
                if (player)
                    if (this.IsPlayerGo(player, checkTurn) && this.DoesPileHaveCards(this.GetPileId(player)) && this.DoCardsExistInPile(this.GetPileId(player), cardToDiscard))
                        return this.GetPileId(player);
                    else return null;
                else if (pileName)
                    if (this.DoesPileHaveCards(this.GetPileId(null, pileName)) && this.DoCardsExistInPile(this.GetPileId(null, pileName), cardToDiscard))
                        return this.GetPileId(null, pileName);
                    else return null;
                else return null;
            else return null;
        })();

        if (pileNameToUse) {
            try {
                //Remove "-" from pileName
                var pileNameCleaned = pileNameToUse.replace(/[- ]/gm, '');

                //Get card to remove
                const removedCard = this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds
                    .filter(o => this.FindCardsInPile_CallBack(o, cardToDiscard)).map(v => v.id);

                //Draw cards from pile
                const returnedCards = this.CardAPI.DrawFromPile(this.deck.deck_id, pileNameCleaned, null, removedCard.join(','));
                //Send cards to players discard pile then to discard pile
                if (goToDiscardPile)
                    this.AddToPersonalDiscardPile(player, pileNameToUse, returnedCards, null, null, revealCard, play);

                //Add to discard pile
                this.CardAPI.AddToPile(this.deck.deck_id, `discardpile`, returnedCards.cards.map(v => v.code).joing(','));
                await this.AddToDiscardPile();
                //Get list of cards and update the piles card ids
                const listOfCards = this.CardAPI.ListCardsPile(this.deck.deck_id, pileNameCleaned);
                this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds =
                    listOfCards.piles.cards.map(v => ({
                        id: v.code,
                        name: `${v.value} ${v.suit}`,
                        image: v.image,
                        revealed: false
                    }));
                //Update deck remaining
                this.deck.remaining = listOfCards.remaining;
                //Update remaining
                this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.remaining = listOfCards.piles.remaining;

                //Draw deck and discard pile
                this.DrawDeckAndDiscard();
            } catch (error) {
                console.error(error);
                await this.EndOfDeck_CallBack(error);
            }
        }
    }

    //Discard cards
    async DiscardCardsFromTop(player = null, pileName = null, numberToDiscard = 1, revealCardNumber = 'all', checkTurn = true, goToDiscardPile = false, play = null) {
        //Check if player
        const pileNameToUse = (() => {
            if (player)
                if (this.IsPlayerGo(player, checkTurn) && this.DoesPileHaveCards(this.GetPileId(player)))
                    return this.GetPileId(player);
                else return null;
            else if (pileName)
                if (this.DoesPileHaveCards(this.GetPileId(null, pileName)))
                    return this.GetPileId(null, pileName);
                else return null;
            else return null;
        })();

        if (pileNameToUse) {
            try {
                //Remove "-" from pileName
                var pileNameCleaned = pileNameToUse.replace(/[- ]/gm, ''),
                    revealCardNumberCount = 0,
                    pileLength = this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds.length;

                //Cap number of cards to show
                revealCardNumber = (!isNaN(revealCardNumber) ?
                    revealCardNumber > pileLength ? pileLength : revealCardNumber : revealCardNumber);
                //Fix numberToDiscard
                numberToDiscard = (!isNaN(numberToDiscard) ? numberToDiscard : pileLength);

                //Draw cards from pile
                const returnedCards = this.CardAPI.DrawFromPile(this.deck.deck_id, pileNameCleaned, numberToDiscard);
                //Send cards to piles discard pile then to discard pile
                if (goToDiscardPile)
                    this.AddToPersonalDiscardPile(player, pileNameToUse, returnedCards, revealCardNumber, revealCardNumberCount, play);

                //Add to discard pile
                this.CardAPI.AddToPile(this.deck.deck_id, `discardpile`, returnedCards.cards.map(v => v.code).join(','));
                await this.AddToDiscardPile();
                //Get list of cards and update the piles card ids
                const listOfCards = this.CardAPI.ListCardsPile(this.deck.deck_id, pileNameCleaned);
                this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds =
                    listOfCards.piles.cards.map(v => ({
                        id: v.code,
                        name: `${v.value} ${v.suit}`,
                        image: v.image,
                        revealed: false
                    }));
                //Update deck remaining
                this.deck.remaining = listOfCards.remaining;
                //Update remaining
                this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.remaining = listOfCards.piles.remaining;

                //Draw deck and discard pile
                this.DrawDeckAndDiscard();
            } catch (error) {
                console.error(error);
                await this.EndOfDeck_CallBack(error);
            }
        }
    }

    //Draw card
    async DrawCard(player = null, pileName = null, numberToDraw = 1, multiDraw = false, checkTurn = true) {
        //Check if player
        const pileNameToUse = (() => {
            if (player)
                if (this.IsPlayerGo(player, checkTurn))
                    return this.GetPileId(player);
                else return null;
            else if (pileName)
                return this.GetPileId(null, pileName);
            else return null;
        })();

        if (pileNameToUse) {
            try {
                //Check if multi draw
                var sent = await (async () => {
                    if (!multiDraw) {
                        return await this.message.WaffleResponse(
                            `Dealing ${numberToDraw} Card(s) to ${(player ? player.toString() : ` ${pileNameToUse}`)}`,
                            MTYPE.Loading, null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
                            {
                                name: this.player.user.username,
                                url: this.player.user.avatarURL()
                            });
                    } else {
                        return null;
                    }
                })();

                //Remove "-" from pileName
                var pileNameCleaned = pileNameToUse.replace(/[- ]/gm, '');

                //Draw cards from deck
                const returnedCards = this.CardAPI.Draw(this.deck.deck_id, numberToDraw);
                //Send cards to pile
                var cardIds = returnedCards.cards.map(v => v.code),
                    existingPile = this.piles.filter(v => v.pileName == pileNameToUse);
                this.CardAPI.AddToPile(this.deck.deck_id, pileNameCleaned, cardIds.join(','));

                //Get list of cards
                const listOfCards = this.CardAPI.ListCardsPile(this.deck.deck_id, pileNameCleaned);
                cardIds = listOfCards.piles.cards.map(v => ({
                    id: v.code,
                    name: `${v.value} ${v.suit}`,
                    image: v.image,
                    revealed: false
                }));
                //Update deck remaining
                this.deck.remaining = listOfCards.remaining;

                //Edit piles
                const pile = {
                    player: player,
                    pileName: pileNameToUse,
                    pileData: {
                        remaining: listOfCards.piles.remaining,
                        listIds: cardIds
                    }
                };

                //Check if player already eixsts
                if (existingPile[0])
                    this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds = cardIds;
                else
                    this.piles.push(pile);

                //Edit message
                if (sent)
                    sent.edit(new Discord.MessageEmbed()
                        .setDescription(`Dealt ${numberToDraw} Card(s) to ${(player ? player.toString() : ` ${pileNameToUse}`)}`)
                        .setAuthor(this.player.user.username, this.player.user.avatarURL())
                        .setColor('#09b50c')
                        .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`));

                //Send message to user
                if (player && !multiDraw) {
                    //Draw Deck
                    this.PenDrawPile(this.GetPileId(player), true).then((messageAttachment) => {
                        const newEmbed = new Discord.MessageEmbed()
                            .setDescription('Your Hand:')
                            .setColor('#000000')
                            .setTimestamp()
                            .setFooter(`Game Id: ${this.gameId}`)
                            .setImage(`attachment://${messageAttachment.name}`);

                        //Send
                        player.send({ embed: newEmbed, files: [messageAttachment] }).catch((error) => console.error(error));
                    }).catch((error) => {
                        console.error(error);
                        this.message.WaffleResponse(`There was an error: ${error}`);
                    });
                }
            } catch (error) {
                console.error(error);
                await this.EndOfDeck_CallBack(error);
            }
        }
    }

    //Draw all cards
    async DrawAllCards(numberEach = null) {
        //Check that the total number of cards per player does not go over the number of cards in the deck
        if (((numberEach || this.numberOfCards) * this.numberOfPlayers) <= this.deck.remaining) {
            //Deal to all players
            try {
                //Send loading message
                var sent = await this.message.WaffleResponse(
                    `Dealing ${(numberEach || this.numberOfCards)} Cards each to ${this.numberOfPlayers} players...`,
                    MTYPE.Loading, null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
                    {
                        name: this.player.user.username,
                        url: this.player.user.avatarURL()
                    });

                for (var index = 0; index < this.numberOfPlayers; index++) {
                    await this.DrawCard(this.players[index], null, (numberEach || this.numberOfCards), true, false);

                    //Draw deck to each user
                    var messageAttachment = await this.PenDrawPile(this.GetPileId(this.players[index]), true);
                    const newEmbed = new Discord.MessageEmbed()
                        .setDescription('Your Hand:')
                        .setColor('#000000')
                        .setTimestamp()
                        .setFooter(`Game Id: ${this.gameId}`)
                        .setImage(`attachment://${messageAttachment.name}`);

                    //Send
                    await this.players[index].send({ embed: newEmbed, files: [messageAttachment] });
                }

                //Edit message
                sent.edit(new Discord.MessageEmbed()
                    .setDescription(`Finished Dealing ${(numberEach || this.numberOfCards)} Cards each to ${this.numberOfPlayers} player(s).`)
                    .setAuthor(this.player.user.username, this.player.user.avatarURL())
                    .setColor('#09b50c')
                    .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`));
            } catch (error) {
                console.error(error);
                await this.EndOfDeck_CallBack(error);
            }
        } else {
            //Divide all cards to every player
            await this.DrawAllCards((this.deck.remaining / this.numberOfPlayers).floor());
        }
    }

    //No Cards left
    async EndOfDeck_CallBack(error) {
        if (error == 'Not enough cards remaining to draw 1 additional') {
            try {
                //Reset deck
                this.CardAPI.ResetDeck(this.deck.deck_id);

                //Get list of cards and update the piles card ids
                await this.AddToDiscardPile();
                //Send message
                this.message.WaffleResponse(`Deck ran out. Re-suffleing Discard Pile back into Deck`, MTYPE.Information);
            } catch (error) {
                console.error(error);
                await this.EndOfDeck_CallBack(error);
            }
        } else {
            console.error(error);
            return this.message.WaffleResponse(`There was an error: ${error}`);
        }
    }

    //Add to discard pile
    async AddToDiscardPile() {
        try {
            //Get list of cards in discardpile
            const listOfDiscards = this.CardAPI.ListCardsPile(this.deck.deck_id, `discardpile`);
            var discardedIds = listOfDiscards.piles.cards.map(v => ({
                id: v.code,
                name: `${v.value} ${v.suit}`,
                image: v.image,
                revealed: true
            }));
            //Update deck remaining
            this.deck.remaining = listOfDiscards.remaining;

            //Get existing pile
            var existingDiscardPile = this.piles.filter(v => v.pileName == 'discardpile');
            //Create discard pile
            const discardPile = {
                player: null,
                pileName: 'discard',
                pileData: {
                    remaining: listOfDiscards.piles.remaining,
                    listIds: discardedIds
                }
            };
            //Check if existing discard pile
            if (existingDiscardPile[0])
                this.piles.filter(v => v.pileName == 'discardpile')[0].pileData.listIds = discardedIds;
            else
                this.piles.push(discardPile);
        } catch (error) {
            console.error(error);
            await this.EndOfDeck_CallBack(error);
        }
    }

    //Add to personal discard pile
    AddToPersonalDiscardPile(player = null, pileNameToUse, returnedCards, revealCardNumber = null, revealCardCount = null, revealCard = null, play = null) {
        //Send cards to piles personal discard pile then to discard pile
        var cardIds = (() => {
            if (revealCardNumber) {
                if (!isNaN(revealCardNumber)) {
                    return returnedCards.cards.map(v => ({
                        id: v.code,
                        name: `${v.value} ${v.suit}`,
                        image: v.image,
                        revealed: ((revealCardCount += 1) <= revealCardNumber ? true : false)
                    }));
                } else {
                    return returnedCards.cards.map(v => ({
                        id: v.code,
                        name: `${v.value} ${v.suit}`,
                        image: v.image,
                        revealed: true
                    }));
                }
            } else { //Reveal single cards
                return returnedCards.cards.map(v => ({
                    id: v.code,
                    name: `${v.value} ${v.suit}`,
                    image: v.image,
                    revealed: revealCard
                }));
            }
        })();

        //Create pile
        const pile = {
            player: player,
            pileName: `discard${pileNameToUse}`,
            pileData: {
                remaining: cardIds.length,
                listIds: cardIds
            }
        };
        this.piles.push(pile);

        if (play) {
            //Play discard pile image
            this.PenDrawPile(`discard${pileNameToUse}`, false)
                .then((messageAttachment) => {
                    const newEmbed = new Discord.MessageEmbed()
                        .setColor('#000000')
                        .setImage(`attachment://${messageAttachment.name}`);

                    //Send
                    this.message.channel.send({ embed: newEmbed, files: [messageAttachment] }).catch((error) => console.error(error));
                    //Delete pile
                    this.piles = this.piles.filter(v => v.pileName != pile.pileName);
                }).catch((error) => {
                    console.error(error);
                    this.message.WaffleResponse(`There was an error: ${error}`);
                });
        } else {
            //Draw discard pile image
            this.PenDrawPile(`discard${pileNameToUse}`, false)
                .then((messageAttachment) => {
                    const newEmbed = new Discord.MessageEmbed()
                        .setDescription(`Discarded ${pile.remaining} Card(s) from ${(player ? 'My Hand' : `${pileNameToUse}`)}:`)
                        .setColor('#000000')
                        .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`)
                        .setImage(`attachment://${messageAttachment.name}`);

                    if (player) newEmbed.setAuthor(player.user.username, player.user.avatarURL());
                    else newEmbed.setAuthor(this.player.user.username, this.player.user.avatarURL());

                    //Send
                    this.message.channel.send({ embed: newEmbed, files: [messageAttachment] }).catch((error) => console.error(error));
                    //Delete pile
                    this.piles = this.piles.filter(v => v.pileName != pile.pileName);
                }).catch((error) => {
                    console.error(error);
                    this.message.WaffleResponse(`There was an error: ${error}`);
                });
        }

    }

    //Draw Pile
    PenDrawPile(pileToFindName, forPlayer = true) {
        return new Promise(async (resolve, reject) => {
            try {
                const specificPile = this.piles.filter(v => v.pileName == pileToFindName)[0];
                if (specificPile) {
                    const pileName = specificPile.pileName,
                        pileData = specificPile.pileData;

                    const { width, height, columnCount, rowCount } = this.CalculateSizeOfPile(pileData.remaining);
                    var vector = { X: 0 + this.cardSpacing, Y: 0 + this.cardSpacing };
                    var rowCurrentCount = 0;

                    //Create canvas and image
                    const canvas = createCanvas(width, height);
                    const ctx = canvas.getContext('2d');
                    const images = [];

                    //Create all images
                    for (var i = 0; i < pileData.listIds.length; i++) {
                        //Set up image
                        const img = new Image();
                        img.dataMode = Image.MODE_IMAGE;

                        //Get rowCount counting
                        rowCurrentCount += (i % columnCount == 0 && rowCurrentCount < rowCount ? 1 : 0);
                        //Calculate x and y
                        vector = this.ShiftCardsOnCanvas(vector.X, vector.Y, columnCount, rowCurrentCount - 1, i);

                        //Set up object
                        images.push({
                            img: img,
                            src: pileData.listIds[i].image,
                            placement: vector,
                            revealed: (forPlayer ? true : pileData.listIds[i].revealed)
                        });
                    }

                    //Draw black background
                    ctx.fillStyle = "rgba(0, 0, 0, 1)";
                    ctx.fillRect(0, 0, width, height);
                    //Draw Canvas
                    await this.DrawCanvas(ctx, images);
                    //Create attachment
                    var newAttachmentName = `Canvas-Pile-${this.gameId}-${this.deck.deck_id}-${pileName}.png`,
                        newAttachment = new Discord.MessageAttachment(canvas.toBuffer(), newAttachmentName);

                    resolve(newAttachment);
                } else {
                    reject(`Couldn't find the card pile for ${pileToFindName}`);
                }
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    //Draw Deck and Discard pile
    PenDrawDeckAndDiscard() {
        return new Promise(async (resolve, reject) => {
            try {
                const pileName = 'discard',
                    discardPile = this.piles.filter(v => v.pileName == `${pileName}`)[0],
                    pileData = (discardPile ? discardPile.pileData : null);

                //Set up size of pile being 2 (deck | discard pile)
                const { width, height, columnCount, rowCount } = this.CalculateSizeOfPile(2);
                var vector = { X: 0 + this.cardSpacing, Y: 0 + this.cardSpacing };

                //Create canvas and image
                const canvas = createCanvas(width, height);
                const ctx = canvas.getContext('2d');
                const images = [];

                //Create the two images
                //Set up deck image
                (() => {
                    const imgDeck = new Image();
                    imgDeck.dataMode = Image.MODE_IMAGE;
                    //Calculate x and y
                    vector = this.ShiftCardsOnCanvas(vector.X, vector.Y, columnCount, 0, 0);
                    //Set up object
                    images.push({
                        img: imgDeck,
                        src: this.backOfCard,
                        placement: vector,
                        revealed: false
                    });
                })();

                //Set up discard pile image
                (() => {
                    if (pileData) {
                        const imgDiscard = new Image();
                        imgDiscard.dataMode = Image.MODE_IMAGE;
                        //Calculate x and y
                        vector = this.ShiftCardsOnCanvas(vector.X, vector.Y, columnCount, 0, 1);
                        //Set up object
                        images.push({
                            img: imgDiscard,
                            src: pileData.listIds[0].image,
                            placement: vector,
                            revealed: true
                        });
                    }
                })();

                //Draw black background
                ctx.fillStyle = "rgba(0, 0, 0, 1)";
                ctx.fillRect(0, 0, width, height);
                //Draw Canvas
                await this.DrawCanvas(ctx, images);
                //Create attachment
                var newAttachmentName = `Canvas-Pile-${this.gameId}-${this.deck.deck_id}-${pileName}.png`,
                    newAttachment = new Discord.MessageAttachment(canvas.toBuffer(), newAttachmentName);

                resolve(newAttachment);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    //Draw Deck
    async DrawDeckAndDiscard() {
        //Draw Deck and discard pile
        this.PenDrawDeckAndDiscard().then((messageAttachment) => {
            const newEmbed = new Discord.MessageEmbed()
                .setDescription(`Deck - Round ${this.roundIndex} - ${this.GetTurn()}`)
                .setColor('#000000')
                .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`)
                .setImage(`attachment://${messageAttachment.name}`);

            //Send
            this.message.channel.send({ embed: newEmbed, files: [messageAttachment] }).catch((error) => console.error(error));
        }).catch((error) => {
            console.error(error);
            this.message.WaffleResponse(`There was an error: ${error}`);
        });
    }

    //Draw Canvas
    async DrawCanvas(ctx, images) {
        try {
            //Draw all cards to canvas
            for (var img of images) {
                await this.DrawImage(ctx, img);
            }
        } catch (error) {
            console.error(error);
            await this.EndOfDeck_CallBack(error);
        }
    }

    //Draw Image
    DrawImage(ctx, img) {
        return new Promise((resolve, reject) => {
            //Load image
            img.img.onload = () => {
                ctx.drawImage(img.img, img.placement.X, img.placement.Y);
                resolve();
            }
            //Set img source url
            img.img.src = (img.revealed ? img.src : this.backOfCard);
        })
    }

    //Calculate width and height of pile
    CalculateSizeOfPile(pileSize) {
        //Pile is always 5 cards wide
        var pileWidth = 5,
            columnCount = (pileSize >= pileWidth ? pileWidth : pileSize),
            rowCount = ((pileSize / pileWidth) > 0 ? (pileSize / pileWidth).ceil() : 1);

        //Pile height is determined by how many cards there is
        return {
            width: (columnCount * (this.cardWidth + this.cardSpacing)) + this.cardSpacing,
            height: (rowCount * (this.cardHeight + this.cardSpacing)) + this.cardSpacing,
            columnCount: columnCount,
            rowCount: rowCount
        };
    }

    //Shift cards
    ShiftCardsOnCanvas(x, y, columnCount, rowCount, cardNumber) {
        var toShiftRight = this.cardWidth + this.cardSpacing,
            toShiftDown = this.cardHeight + this.cardSpacing,
            newX = x,
            newY = y;
        //Calculate new x
        if (cardNumber % columnCount == 0) {
            newX = 0 + this.cardSpacing;
            if (cardNumber != 0) //Only shift down after the first card
                newY = (toShiftDown * rowCount) + this.cardSpacing;
        } else {
            newX += toShiftRight;
        }

        return { X: newX, Y: newY };
    }

    //Map stepDescription to each player
    MapStepsToPlayers() {
        if (this.stepDescription) {
            this.piles.forEach((pile) => {
                //Add stepDescription to player pile
                pile.stepDescription = [];

                this.stepDescription.forEach((step) => {
                    pile.stepDescription.push(({
                        case: step.case,
                        used: false,
                        required: step.required,
                        maxUses: step.maxUses,
                        usesCount: 0
                    }));
                });
            });
        }
    }

    //Clear steps
    ClearPlayerSteps() {
        if (this.stepDescription) {
            const pileName = this.GetPileId(this.players[this.turnIndex]);
            //Turn off used
            this.piles.filter(v => v.pileName = pileName)[0].stepDescription.forEach((step) => {
                step.used = false;
                step.usesCount = 0;
            });
        }
    }

    //Aggregate step
    AggregateStep(player, step, args) {
        //Get actual step
        const CallBackStep = Object.values(this.CallBacks).filter(v => v.name == step)[0];

        //Check if creater or players turn
        if ((CallBackStep.whocan ? CallBackStep.whocan.id == player.id : false) || this.IsPlayerGo(player, true)) {
            //Check if stepDescription exists
            if (this.stepDescription) {
                const pileName = this.GetPileId(player),
                    pile = this.piles.filter(v => v.pileName == pileName)[0],
                    stepDescription = pile.stepDescription.filter(v => v.case == step)[0],
                    maxUses = stepDescription.maxUses,
                    usesCount = stepDescription.usesCount,
                    required = stepDescription.required,
                    unlimitedUses = (usesCount < 0 && !required);

                //Check if step was already taken
                if (stepDescription && stepDescription.used == false) {
                    //Aggregate the step
                    //Play call back
                    this.PlayCallBack(CallBackStep, args);

                    //Cap uses of ability
                    stepDescription.usesCount += 1;
                    if (!unlimitedUses) {
                        if ((usesCount + 1) > maxUses) {
                            stepDescription.used = true;
                            stepDescription.usesCount = 0;
                        }
                    }

                    //Increase turn if all steps are complete
                    if (pile.stepDescription.filter(v => v.used == false && v.required == true).length == 0) {
                        this.TurnPlus();
                    }
                } else
                    this.StepAlreadyTaken(step);
            } else {
                //Play call back
                this.PlayCallBack(CallBackStep, args);
            }
        }
    }

    //Play callback
    PlayCallBack(step, args) {
        step.callback(args);
    }

    //Get turn
    GetTurn() {
        return `It is ${this.players[this.turnIndex].toString()} Turn`;
    }

    //Increase round
    RoundPlus() {
        this.roundIndex += 1;
        this.RoundEvent.emit('RoundCounter', this.roundIndex);
    }

    //Increase turn
    TurnPlus() {
        if (this.turnIndex >= this.numberOfPlayers - 1) this.turnIndex = 0;
        else this.turnIndex += 1;
        //Increment round
        if (this.turnCounter >= this.numberOfPlayers - 1) {
            this.turnCounter = 0;
            this.RoundPlus();
        } else
            this.turnCounter += 1;

        //Clear player steps
        this.ClearPlayerSteps();
        this.TurnMessage();
    }

    //Reverse turn
    TurnMinus() {
        if (this.turnIndex == 0) this.turnIndex == this.numberOfPlayers - 1;
        else this.turnIndex -= 1;
        //Increment round
        if (this.turnCounter >= this.numberOfPlayers - 1) {
            this.turnCounter = 0;
            this.RoundPlus();
        } else
            this.turnCounter += 1;

        //Clear player steps
        this.ClearPlayerSteps();
        this.TurnMessage();
    }

    //Turn
    TurnMessage() {
        //Send channel message
        this.message.WaffleResponse(
            `Round ${this.roundIndex} - It Is ${this.players[this.turnIndex].toString()} Turn`, MTYPE.Information,
            null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
            {
                name: this.player.user.username,
                url: this.player.user.avatarURL()
            });
        //Send message to user
        this.players[this.turnIndex].send(new Discord.MessageEmbed()
            .setDescription(`It's your turn now!`)
            .setAuthor(this.player.user.username, this.player.user.avatarURL())
            .setColor('#0099ff')
            .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`));
    }

    //Turn doesn't exist
    StepDoesntExist(step) {
        this.message.WaffleResponse(`${step} is not an option in this game.`).then((sent) => {
            sent.delete({ timeout: 3000 }).catch(() => { });
        });
    }

    //Step already taken
    StepAlreadyTaken(step) {
        this.message.WaffleResponse(`${step} was already taken as much as it was allowed.`).then((sent) => {
            sent.delete({ timeout: 3000 }).catch(() => { });
        });
    }

    //Not your turn
    NotTurnMessage(player, message = null) {
        (message ? message : this.message).WaffleResponse(
            `${player.toString()} it is not your turn!`, MTYPE.Error,
            null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
            {
                name: this.player.user.username,
                url: this.player.user.avatarURL()
            }).then((sent) => {
                sent.delete({ timeout: 3000 }).catch(() => { });
            });
    }

    //No cards to discard
    NoCardsToDiscardMessage(message = null) {
        (message ? message : this.message).WaffleResponse(`I have no Cards to Discard.`,
            '#000000', null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null, ATYPE.Sender)
            .then((sent) => {
                sent.delete({ timeout: 3000 }).catch(() => { });
            });
    }

    //Get Pile ID
    GetPileId(player = null, pileName = null) {
        if (player) {
            const playerName = player.user.username.replace(/[^a-zA-Z0-9]/gm, '');
            return `${playerName}-${player.id}`;
        } else if (pileName) {
            return pileName;
        } else return null;
    }

    //Get players
    GetPlayersList() {
        //Check number of players
        if (this.numberOfPlayers <= 5) {
            return {
                name: 'Players:',
                value: `Total ${this.numberOfPlayers}\n${this.players.map((v, i) => `${i + 1} - ${v.toString()}`).join('\n')}`,
                inline: true
            }
        } else {
            return {
                name: 'Players:',
                value: `Total ${this.numberOfPlayers}\n${this.players.slice(0, 9).map((v, i) => `${i + 1} - ${v.toString()}`).join('\n')}\n.....`,
                inline: true
            }
        }
    }

    //Check if player is playing
    IsPlayerPlaying(player) {
        return (() => {
            if (this.players.map(v => v.id).includes(player.id))
                return true;
            else return false
        })();
    }

    //Check if player is on his turn
    IsPlayersTurn(player, checkTurn = true) {
        return (() => {
            if (!checkTurn || this.players.map(v => v.id).indexOf(`${player.id}`) == this.turnIndex)
                return true;
            else {
                this.NotTurnMessage(player);
                return false;
            }
        })();
    }

    //Is player allowed to play
    IsPlayerGo(player, checkTurn = true) {
        return this.IsPlayerPlaying(player) && this.IsPlayersTurn(player, checkTurn);
    }

    //Does pile have cards
    DoesPileHaveCards(pileName) {
        return (() => {
            if (this.piles.filter(v => v.pileName == pileName)[0].pileData.remaining > 0)
                return true;
            else {
                this.NoCardsToDiscardMessage();
                return false;
            }
        })();
    }

    //Do cards exist
    DoCardsExistInPile(pileName, cards = []) {
        return (() => {
            if (this.piles.filter(v => v.pileName == pileName)[0].pileData.listIds
                .filter(o => this.FindCardsInPile_CallBack(o, cards)).length > 0) {
                return true;
            } else {
                this.message.WaffleResponse(`I Couldn't find **${cards.join(', ')}** in this Pile`)
                    .then((sent) => {
                        sent.delete({ timeout: 3000 }).catch(() => { });
                    });
                return false;
            }
        })();
    }

    //Filter to find cards callBack function
    FindCardsInPile_CallBack(cardObject, cards = []) {
        return cards.map(v => v.toLowerCase()).includes(cardObject.id.toLowerCase()) ||
            cards.map(v => v.toLowerCase()).includes(cardObject.name.toLowerCase()) ||
            cards.map(v => v.toLowerCase().replace(/( of )/gi, '')).includes(cardObject.name.toLowerCase());
    }
}

//Export classes
module.exports = {
    CardGame: CardGame,
    CardSystem: CardSystem,
    UserInterface: UserInterface
}