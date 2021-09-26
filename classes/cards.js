//Import
const axios = require('axios');
const Discord = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { createCanvas, Image } = require('canvas');
//Import functions
require('../message-commands.js')();

module.exports = class CardGame {
    //Card game constructor
    constructor(bot, guild, message, player) {
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
        this.numberOfCards = 5;
        this.turnIndex = 0;
        //Card details
        this.cardWidth = 226;
        this.cardHeight = 314;
        this.cardSpacing = 5; //Pixels
        this.backOfCard = 'https://gcdn.pbrd.co/images/q08nAKRV1vH1.png?o=1';/*'../assets/back-of-card.png';*/

        this.players.push(this.player);
    }

    //Construct game
    ConstructGame() {
        //Send message
        this.message.WaffleResponse(
            `Preparing New Card Game For ${this.player.toString()}`, MTYPE.Loading,
            [
                {
                    name: 'Join Up',
                    value: `To join this game, please react with ✅\nTo leave a game in preperation phase, simply remove your reaction.`,
                    inline: true
                }, {
                    name: `Start Game`,
                    value: `When you're ready:\n${this.player.toString()} react with ▶️ to start the game`,
                    inline: true
                }, {
                    name: 'How Many Cards?',
                    value: `${this.player.toString()} please type how many cards you want each player to start with?`
                }, this.GetPlayersList()
            ], true, `Game Id: ${this.gameId}`
        ).then((sent) => {
            sent.react('✅')
                .then(() => sent.react('▶️'))
                .then(() => {
                    //Message filter and collector
                    const reactionFilter = (reaction, user) => {
                        return ['✅', '▶️'].includes(reaction.emoji.name);
                    }
                    //Create reaction collector
                    const reactionCollector = sent.createReactionCollector(reactionFilter, { max: 1, time: 100000, dispose: true });

                    //Message filter and collector
                    const messageFilter = m => m.member.id == this.player.id && m.content;
                    const messageCollector = sent.channel.createMessageCollector(messageFilter, { time: 100000 });

                    //Await message collector collect
                    messageCollector.on('collect', m => {
                        m.delete({ timeout: 100 }); //Delete message
                        var mess = m.content.toLowerCase();

                        //Create error message
                        var errorMessage = (text) => {
                            this.message.WaffleResponse(text)
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
                                if (number <= 20) {
                                    this.numberOfCards = number;
                                    //Edit preperation message
                                    const embed = sent.embeds[0];
                                    embed.fields[2] = {
                                        name: 'How Many Decks?',
                                        value: `There will be ${this.numberOfCards} cards delt to each player!`
                                    }
                                    sent.edit(embed);

                                    //Stop message collector
                                    messageCollector.stop();
                                } else {
                                    errorMessage(`Sorry, ${number} is over the maximum cards per player of 10.`);
                                }
                            } else {
                                errorMessage(`Sorry, ${mess} was not a number`);
                            }
                        } else {
                            errorMessage(`Sorry, I didn't understand what you meant...`);
                        }
                    });

                    //Await reaction
                    reactionCollector.on('collect', (reaction, user) => {
                        if (reaction.emoji.name === '✅' && user.id != this.player.id) {
                            this.players.push(user);
                            this.numberOfPlayers = this.players.length;

                            //Edit message
                            const embed = sent.embeds[0];
                            embed.fields[3] = this.GetPlayersList();
                            sent.edit(embed);

                            //Send message to player
                            user.send(new Discord.MessageEmbed()
                                .setDescription('You have joined the new Card Game! Please wait for the game to start.')
                                .setColor('#0099ff')
                                .setTimestamp()
                                .setFooter(`Game Id: ${this.gameId}`));

                            //Reset timer and empty collector
                            reactionCollector.empty();
                            reactionCollector.resetTimer(); messageCollector.resetTimer();
                        } else if ((reaction.emoji.name === '✅' && user.id == this.player.id) || (reaction.emoji.name === '▶️' && user.id != this.player.id)) {
                            //Remove reactions by this user
                            sent.reactions.cache.map((v, k) => v).filter(reaction => reaction.users.cache.has(user.id)).first().users.remove(user.id);

                            //Reset timer and empty collector
                            reactionCollector.empty();
                            reactionCollector.resetTimer(); messageCollector.resetTimer();
                        } else if (reaction.emoji.name === '▶️' && user.id == this.player.id) {
                            //Message all users
                            this.players.forEach(async ply => {
                                await ply.send(new Discord.MessageEmbed()
                                    .setDescription('Game is Starting! Get Ready')
                                    .setColor('#09b50c')
                                    .setTimestamp()
                                    .setFooter(`Game Id: ${this.gameId}`));
                            });

                            //Start game
                            reactionCollector.stop();
                        }
                    });
                    //Await remove
                    reactionCollector.on('remove', (reaction, user) => {
                        if (reaction.emoji.name === '✅' && user.id != this.player.id) {
                            this.players = this.players.removeElement(user);
                            this.numberOfPlayers = this.players.length;

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
                        sent.reactions.removeAll()
                            .then(() => {
                                sent.edit(new Discord.MessageEmbed()
                                    .setDescription(`Finished Preparing New Card Game For ${this.player.toString()}`)
                                    .setAuthor(this.player.user.username, this.player.user.avatarURL())
                                    .addFields([this.GetPlayersList()])
                                    .setColor('#0099ff')
                                    .setFooter(`Game Id: ${this.gameId}`)
                                ).then(() => {
                                    this.StartGame();
                                });
                            }).catch((error) => {
                                console.error(error);
                                this.message.WaffleResponse('There was an error in the creation of this card game. Please try again');
                                return;
                            });
                    });
                });
        }).catch(error => {
            console.error(error);
            this.message.WaffleResponse('There was an error in the creation of this card game. Please try again');
        });
    }

    //Start Game
    StartGame() {
        //Generate the deck and piles
        axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
            .then(async (newDeck) => {
                this.deck = newDeck.data;
                this.turnIndex = randInt(0, this.numberOfPlayers - 1);
                //Send message
                this.message.WaffleResponse(
                    `Started New Card Game With ${this.numberOfCards} Each!`,
                    MTYPE.Success,
                    [
                        {
                            name: `Who's Turn is it First?`,
                            value: `It is ${this.players[this.turnIndex].toString()} Turn First!`
                        }, this.GetPlayersList()
                    ],
                    true, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
                    {
                        name: this.player.user.username,
                        url: this.player.user.avatarURL()
                    });

                //Deal all cards to players
                await this.DrawAllCards();
            }).catch((error) => {
                console.error(error);
                this.message.WaffleResponse(`There was an error: ${error.message}`);
            });
    }

    //Reveal Hand
    RevealHand(player = null, pileName = null, message, numberOfCardsToShow = 1, checkTurn = true) {
        //Check if player
        const pileNameToUse = (() => {
            if (player) {
                //Check that the player is playing
                if (this.players.map(v => v.id).includes(player.id)) {
                    //Check that it's the players turn
                    if (!checkTurn || this.players.map(v => v.id).indexOf(`${player.id}`) == this.turnIndex) {
                        return this.GetPileId(player);
                    } else {
                        this.NotTurnMessage(player, message);
                        return null;
                    }
                } else return null;
            } else if (pileName) {
                return pileName;
            } else return null;
        })();

        if (pileNameToUse) {
            //Draw Deck
            this.PenDrawPile(pileNameToUse, false, numberOfCardsToShow)
                .then((messageAttachment) => {
                    const newEmbed = new Discord.MessageEmbed()
                        .setDescription(`Here is ${numberOfCardsToShow} of ${(player ? 'My Cards' : `the ${pileNameToUse} Pile's Cards`)}:`)
                        .setColor('#000000')
                        .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`)
                        .setImage(`attachment://${messageAttachment.name}`);

                    if (player) newEmbed.setAuthor(player.user.username, player.user.avatarURL());
                    else if (pileName) newEmbed.setAuthor(this.player.user.username, this.player.user.avatarURL());

                    //Send
                    message.channel.send({ embed: newEmbed, files: [messageAttachment] }).catch((error) => console.error(error));
                }).catch((error) => {
                    console.error(error);
                    this.message.WaffleResponse(`There was an error: ${error}`);
                });
        }
    }

    //Create pile
    async CreateNewPile(pileName, numberOfCards = 1) {
        try {
            //Loading message
            var sent = await this.message.WaffleResponse(`Dealing ${numberOfCards} Card(s) to a new Pile ${pileName}`,
                MTYPE.Loading, null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
                {
                    name: this.player.user.username,
                    url: this.player.user.avatarURL()
                });

            //Draw cards from deck
            const returnedCards = (await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/draw/?count=${numberOfCards}`)).data;
            //Send cards to new pile
            var cardIds = returnedCards.cards.map(v => v.code),
                existingPile = this.piles.filter(v => v.pileName == pileName);
            await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${pileName}/add/?cards=${cardIds.join(',')}`);

            //Get list of cards
            const listOfCards = (await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${pileName}/list/`)).data;
            cardIds = listOfCards.piles[`${pileName}`].cards.map(v => ({
                id: v.code,
                name: `${v.value} ${v.suit}`,
                image: v.image,
                revealed: false
            }));

            //Edit piles
            const pile = {
                player: this.player,
                pileName: this.GetPileId(player),
                pileData: {
                    remaining: listOfCards.piles[`${pileName}`].remaining,
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
                    .setDescription(`Dealt ${numberOfCards} Cards(s) to the new Pile ${pileName}`)
                    .setAuthor(this.player.user.username, this.player.user.avatarURL())
                    .setColor('#09b50c')
                    .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`));
        } catch (error) {
            console.error(error);
            this.message.WaffleResponse(`There was an error: ${error.message}`);
        }
    }

    //Get players
    GetPlayersList() {
        //Check number of players
        if (this.numberOfPlayers <= 10) {
            return {
                name: 'Players:',
                value: `Total ${this.numberOfPlayers}\n${this.players.map((v, i) => `${i + 1} - ${v.toString()}`).join('\n')}`
            }
        } else {
            return {
                name: 'Players:',
                value: `Total ${this.numberOfPlayers}\n${this.players.slice(0, 9).map((v, i) => `${i + 1} - ${v.toString()}`).join('\n')}\n.....`
            }
        }
    }

    //Discard specific card
    async DiscardCard(player = null, pileName = null, cardToDiscard, revealCard = true, checkTurn = true) {
        //Check if player
        const pileNameToUse = (() => {
            if (player) {
                //Check that the player is playing
                if (this.players.map(v => v.id).includes(player.id)) {
                    //Check that it's the players turn
                    if (!checkTurn || this.players.map(v => v.id).indexOf(`${player.id}`) == this.turnIndex) {
                        //Check that there's cards to discard
                        if (this.piles.filter(v => v.pileName == this.GetPileId(player))[0].pileData.remaining > 0) {
                            //Find card to remove
                            if (this.piles.filter(v => v.pileName == this.GetPileId(player))[0].pileData.listIds.filter(
                                o => o.code.toLowerCase() == cardToDiscard.toLowerCase() || o.name.toLowerCase() == cardToDiscard.toLowerCase())) {
                                return this.GetPileId(player);
                            } else {
                                this.message.WaffleResponse(`I Couldn't find **${cardToDiscard}** in your Hand`)
                                    .then((sent) => {
                                        sent.delete({ timeout: 3000 }).catch((error) => { });
                                    });
                                return null;
                            }
                        } else {
                            this.NoCardsToDiscardMessage();
                            return null;
                        }
                    } else {
                        this.NotTurnMessage(player);
                        return null;
                    }
                } else return null;
            } else if (pileName) {
                return pileName;
            } else return null;
        })();

        if (pileNameToUse) {
            try {
                //Remove "-" from pileName
                var pileNameCleaned = pileNameToUse.replace(/[- ]/gm, '');

                //Get card to remove
                const removedCard = this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds.filter(
                    o => o.code.toLowerCase() == cardToDiscard.toLowerCase() || o.name.toLowerCase() == cardToDiscard.toLowerCase())[0];

                //Draw cards from pile
                const returnedCards = (await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${pileNameCleaned}/draw/?cards=${removedCard.code}`)).data;
                //Send cards to players discard pile then to discard pile
                var cardIds = returnedCards.cards.map(v => ({
                    id: v.code,
                    name: `${v.value} ${v.suit}`,
                    image: v.image,
                    revealed: revealCard
                }));

                //Add to discard pile
                await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${`discardpile`}/add/?cards=${cardIds.map(v => v.id).join(',')}`);
                //Get list of cards and update the piles card ids
                const listOfCards = (await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${pileNameCleaned}/list/`)).data;
                this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds =
                    listOfCards.piles[`${pileNameCleaned}`].cards.map(v => ({
                        id: v.code,
                        name: `${v.value} ${v.suit}`,
                        image: v.image,
                        revealed: false
                    }));

                //Create pile
                const pile = {
                    player: player,
                    pileName: `discard${this.GetPileId(player)}`,
                    pileData: {
                        remaining: returnedCards.piles[`${pileNameCleaned}`].remaining,
                        listIds: cardIds
                    }
                };
                this.piles.push(pile);

                //Draw discard pile image
                this.PenDrawPile(`discard${this.GetPileId(player)}`, false, pile.pileData.remaining)
                    .then((messageAttachment) => {
                        const newEmbed = new Discord.MessageEmbed()
                            .setDescription(`Discard 1 Card from ${(player ? 'My Hand' : `this pile ${pileNameToUse}`)}:`)
                            .setColor('#000000')
                            .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`)
                            .setImage(`attachment://${messageAttachment.name}`);

                        if (player) newEmbed.setAuthor(player.user.username, player.user.avatarURL());
                        else if (pileName) newEmbed.setAuthor(this.player.user.username, this.player.user.avatarURL());

                        //Send
                        this.message.channel.send({ embed: newEmbed, files: [messageAttachment] }).catch((error) => console.error(error));
                        //Delete pile
                        this.pile.removeElement(pile);
                    });
            } catch (error) {
                console.error(error);
                this.message.WaffleResponse(`There was an error: ${error.message}`);
            }
        }
    }

    //Discard cards
    async DiscardCardsFromTop(player = null, pileName = null, numberToDiscard = 1, revealCardNumber = 'all', checkTurn = true) {
        //Check if player
        const pileNameToUse = (() => {
            if (player) {
                //Check that the player is playing
                if (this.players.map(v => v.id).includes(player.id)) {
                    //Check that it's the players turn
                    if (!checkTurn || this.players.map(v => v.id).indexOf(`${player.id}`) == this.turnIndex) {
                        //Check that there's cards to discard
                        if (this.piles.filter(v => v.pileName == this.GetPileId(player))[0].pileData.remaining > 0) {
                            return this.GetPileId(player);
                        } else {
                            this.NoCardsToDiscardMessage();
                            return null;
                        }
                    } else {
                        this.NotTurnMessage(player);
                        return null;
                    }
                } else return null;
            } else if (pileName) {
                return pileName;
            } else return null;
        })();

        if (pileNameToUse) {
            try {
                //Remove "-" from pileName
                var pileNameCleaned = pileNameToUse.replace(/[- ]/gm, '');
                var revealCardNumberCount = (!isNaN(revealCardNumber) ? revealCardNumber + 0 : 0);

                //Draw cards from pile
                const returnedCards = (await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${pileNameCleaned}/draw/?count=${numberToDiscard}`)).data;
                //Send cards to piles discard pile then to discard pile
                var cardIds = (() => {
                    if (!isNaN(revealCardNumber)) {
                        return returnedCards.cards.map(v => ({
                            id: v.code,
                            name: `${v.value} ${v.suit}`,
                            image: v.image,
                            revealed: ((revealCardNumberCount -= 1) > 0 ? true : false)
                        }));
                    } else {
                        return returnedCards.cards.map(v => ({
                            id: v.code,
                            name: `${v.value} ${v.suit}`,
                            image: v.image,
                            revealed: true
                        }));
                    }
                })();

                //Add to discard pilke
                await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${`discardpile`}/add/?cards=${cardIds.map(v => v.id).join(',')}`);
                //Get list of cards and update the piles card ids
                const listOfCards = (await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${pileNameCleaned}/list/`)).data;
                this.piles.filter(v => v.pileName == pileNameToUse)[0].pileData.listIds =
                    listOfCards.piles[`${pileNameCleaned}`].cards.map(v => ({
                        id: v.code,
                        name: `${v.value} ${v.suit}`,
                        image: v.image,
                        revealed: false
                    }));

                //Create pile
                const pile = {
                    player: player,
                    pileName: `discard${pileNameToUse}`,
                    pileData: {
                        remaining: returnedCards.piles[`${pileNameCleaned}`].remaining,
                        listIds: cardIds
                    }
                };
                this.piles.push(pile);

                //Draw discard pile image
                this.PenDrawPile(pileNameToUse, false, (!isNaN(revealCardNumber) ? revealCardNumber : pile.pileData.remaining))
                    .then((messageAttachment) => {
                        const newEmbed = new Discord.MessageEmbed()
                            .setDescription(`Discard ${numberToDiscard} Cards from ${(player ? 'My Hand' : `the Pile ${pileNameToUse}`)}:`)
                            .setColor('#000000')
                            .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`)
                            .setImage(`attachment://${messageAttachment.name}`);

                        if (player) newEmbed.setAuthor(player.user.username, player.user.avatarURL());
                        else if (pileName) newEmbed.setAuthor(this.player.user.username, this.player.user.avatarURL());

                        //Send
                        this.message.channel.send({ embed: newEmbed, files: [messageAttachment] }).catch((error) => console.error(error));
                        //Delete pile
                        this.pile.removeElement(pile);
                    });
            } catch (error) {
                console.error(error);
                this.message.WaffleResponse(`There was an error: ${error.message}`);
            }
        }
    }

    //Draw card
    async DrawCard(player = null, pileName = null, numberToDraw = 1, multiDraw = false, checkTurn = true) {
        //Check if player
        const pileNameToUse = (() => {
            if (player) {
                //Check that player is playing
                if (this.players.map(v => v.id).includes(player.id)) {
                    //Check that it's the players turn
                    if (!checkTurn || this.players.map(v => v.id).indexOf(`${player.id}`) == this.turnIndex) {
                        return this.GetPileId(player);
                    } else {
                        this.NotTurnMessage(player);
                        return null;
                    }
                } else return null;
            } else if (pileName) {
                return pileName;
            } else return null;
        })();

        if (pileNameToUse) {
            try {
                //Check if multi draw
                var sent = await (async () => {
                    if (!multiDraw) {
                        return await this.message.WaffleResponse(
                            `Dealing ${numberToDraw} Card(s) to ${(player ? player.toString() : ` the Pile ${pileNameToUse}`)}`,
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
                const returnedCards = (await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/draw/?count=${numberToDraw}`)).data;
                //Send cards to pile
                var cardIds = returnedCards.cards.map(v => v.code),
                    existingPile = this.piles.filter(v => v.pileName == pileNameToUse);
                await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${pileNameCleaned}/add/?cards=${cardIds.join(',')}`);

                //Get list of cards
                const listOfCards = (await axios.get(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${pileNameCleaned}/list/`)).data;
                cardIds = listOfCards.piles[`${pileNameCleaned}`].cards.map(v => ({
                    id: v.code,
                    name: `${v.value} ${v.suit}`,
                    image: v.image,
                    revealed: false
                }));

                //Edit piles
                const pile = {
                    player: player,
                    pileName: pileNameToUse,
                    pileData: {
                        remaining: listOfCards.piles[`${pileNameCleaned}`].remaining,
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
                        .setDescription(`Dealt ${numberToDraw} Card(s) ${(player ? player.toString() : ` the Pile ${pileNameToUse}`)}`)
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
                this.message.WaffleResponse(`There was an error: ${error.message}`);
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
                    `Dealing ${(numberEach || this.numberOfCards)} Cards to ${this.numberOfPlayers} players...`,
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
                    .setDescription(`Finished Dealing ${(numberEach || this.numberOfCards)} Cards to ${this.numberOfPlayers} players.`)
                    .setAuthor(this.player.user.username, this.player.user.avatarURL())
                    .setColor('#09b50c')
                    .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`));
            } catch (error) {
                console.error(error);
                this.message.WaffleResponse(`There was an error: ${error.message}`);
            }
        } else {
            //Divide all cards to every player
            await this.DrawAllCards((this.deck.remaining / this.numberOfPlayers).floor());
        }
    }

    //Increase turn
    TurnPlus() {
        if (this.turnIndex >= this.numberOfPlayers - 1) this.turnIndex = 0;
        else this.turnIndex += 1;
        this.TurnMessage();
    }

    //Reverse turn
    TurnMinus() {
        if (this.turnIndex == 0) this.turnIndex == this.numberOfPlayers - 1;
        else this.turnIndex -= 1;
        this.TurnMessage();
    }

    //Turn
    TurnMessage() {
        //Send channel message
        this.message.WaffleResponse(
            `It Is ${this.players[this.turnIndex]} Turn!`, MTYPE.Information,
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
            '#000000', null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null, ATYPE.Sender);
    }

    //Get Player Pile ID
    GetPileId(player) {
        const playerName = player.user.username.replace(/[^a-zA-Z0-9]/gm, '');
        return `${playerName}-${player.id}`;
    }

    //Draw Pile
    PenDrawPile(pileToFindName, forPlayer = true, showCards = 0) {
        return new Promise(async (resolve, reject) => {
            const specificPile = this.piles.filter(v => v.pileName == pileToFindName)[0];
            if (specificPile) {
                const player = specificPile.player,
                    pileName = specificPile.pileName,
                    pileData = specificPile.pileData;

                const { width, height, columnCount, rowCount } = this.CalculateSizeOfPile(pileData.remaining);
                var vector = { X: 0 + this.cardSpacing, Y: 0 + this.cardSpacing };
                var showCardsCount = showCards + 0;
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
                    //Set up revealed status
                    (() => {
                        if (forPlayer) pileData.listIds[i].revealed = true;
                        else {
                            if (!isNaN(showCards)) {
                                pileData.listIds[i].revealed = ((showCardsCount -= 1) > 0 ? true : false);
                            } else {
                                //If showCards is text like 'all' then show all
                                pileData.listIds[i].revealed = true;
                            }
                        }
                    })();

                    //Set up object
                    images.push({
                        img: img,
                        src: pileData.listIds[i].image,
                        placement: vector,
                        revealed: pileData.listIds[i].revealed
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
            this.message.WaffleResponse(`There was an error: ${error.message}`);
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
}