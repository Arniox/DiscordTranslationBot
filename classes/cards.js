//Import
const axios = require('axios');
const Discord = require('discord.js');
const { v4: uuidv4 } = require('uuid');
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

        this.players.push(this.player);
    }

    //Construct game
    ConstructGame() {
        //Send message
        this.message.channel.WaffleResponse(
            `Preparing New Card Game For ${this.player.toString()}`, MTYPE.Loading,
            [
                {
                    name: 'Join Up',
                    value: `To join this game, please react with ✅. To leave a game in preperation phase, simply remove your reaction.`,
                    inline: true
                }, {
                    name: `Start Game`,
                    value: `When you're ready, ${this.player.toString()} react with ▶️ to start the game`,
                    inline: true
                }, {
                    name: 'How Many Cards?',
                    value: `${this.player.toString()} please type how many cards you want each player to start with?`,
                    inline: true
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
                            this.message.channel.WaffleResponse(text)
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
                                if (number <= 10) {
                                    this.numberOfCards = number;
                                    //Edit preperation message
                                    const embed = sent.embeds[0];
                                    embed.fields[2] = {
                                        name: 'How Many Decks?',
                                        value: `There will be ${this.numberOfCards} delt to each player!`,
                                        inline: true
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
                                this.message.channel.WaffleResponse('There was an error in the creation of this card game. Please try again');
                                return;
                            });
                    });
                });
        }).catch(error => {
            console.error(error);
            this.message.channel.WaffleResponse('There was an error in the creation of this card game. Please try again');
        });
    }

    //Start Game
    StartGame() {
        //Generate the deck and piles
        axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
            .then(async (newDeck) => {
                this.deck = newDeck;
                this.turnIndex = randInt(0, this.numberOfPlayers - 1);
                //Send message
                this.message.channel.WaffleResponse(
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
            });
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

    //Draw card
    async DrawCard(player) {
        //Check that player is playing
        if (this.players.includes(v => v.id == player.id)) {
            //Check that it's the players turn
            if (this.players.map(ply => ply.id).indexOf(`${player.id}`) == this.turnIndex) {
                //Deal to self
                try {
                    var sent = await this.message.channel.WaffleResponse(`Dealing 1 Card to ${player.toString()}`,
                        MTYPE.Loading, null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
                        {
                            name: this.player.user.username,
                            url: this.player.user.avatarURL()
                        });

                    const returnedCards = await axios.get(
                        `https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/draw/?count=1`);

                    //Send cards to players pile
                    var cardIds = returnedCards.cards.map(v => v.code),
                        playerName = player.user.username.replace(/[^a-zA-Z0-9]/gm, ''),
                        existingPile = this.piles.filter(v => v.playerId === player.id);
                    const sentCards = await axios.get(
                        `https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${playerName}/add/?cards=${cardIds.join(',')}`);

                    //Get list of cards
                    const listOfCards = await axios.get(
                        `https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${playerName}/list/`);
                    cardIds = listOfCards.piles[`${playerName}`].cards.map(v => ({
                        id: v.code,
                        name: `${v.value} ${v.suit}`
                    }));

                    //Edit piles
                    const pile = {
                        player: player,
                        playerId: player.id,
                        playerName: playerName,
                        pileData: {
                            remaining: listOfCards.piles[`${playerName}`].remaining,
                            listIds: cardIds,
                        }
                    }
                    //Check if player already exists
                    if (existingPile[0])
                        existingPile[0].pileData.listIds = cardIds;
                    else
                        this.piles.push(pile);

                    //Edit message
                    sent.edit(new Discord.MessageEmbed()
                        .setDescription(`Dealt 1 Card to ${player.toString()}`)
                        .setAuthor(this.player.user.username, this.player.user.avatarURL())
                        .setColor('#09b50c')
                        .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`));
                } catch (error) {
                    console.error(error);
                    this.message.channel.WaffleResponse(`There was an error: ${error.message}`);
                }
            } else {
                this.message.channel.WaffleResponse(
                    `${player.toString()} it is not your turn!`, MTYPE.Error,
                    null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
                    {
                        name: this.player.user.username,
                        url: this.player.user.avatarURL()
                    }).then((sent) => {
                        sent.delete({ timeout: 3000 }).catch(() => { });
                    });
            }
        }
    }

    //Draw all cards
    async DrawAllCards(numberEach = null) {
        //Check that the total number of cards per player does not go over the number of cards in the deck
        if (((numberEach | this.numberOfCards) * this.numberOfPlayers) <= this.deck.remaining) {
            //Deal to all players
            try {
                //Send loading message
                var sent = await this.message.channel.WaffleResponse(
                    `Dealing ${(numberEach | this.numberOfCards)} Cards to ${this.numberOfPlayers} players...`,
                    MTYPE.Loading, null, false, `Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`, null,
                    {
                        name: this.player.user.username,
                        url: this.player.user.avatarURL()
                    });

                for (var index = 0; index < this.numberOfPlayers; index++) {
                    const returnedCards = await axios.get(
                        `https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/draw/?count=${(numberEach | this.numberOfCards)}`);

                    //Send cards to players pile
                    var cardIds = returnedCards.cards.map(v => v.code),
                        playerName = this.players[index].user.username.replace(/[^a-zA-Z0-9]/gm, ''),
                        existingPile = this.piles.filter(v => v.playerId === this.players[index].id);
                    const sentCards = await axios.get(
                        `https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${playerName}/add/?cards=${cardIds.join(',')}`);

                    //Get list of cards
                    const listOfCards = await axios.get(
                        `https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/pile/${playerName}/list/`);
                    cardIds = listOfCards.piles[`${playerName}`].cards.map(v => ({
                        id: v.code,
                        name: `${v.value} ${v.suit}`
                    }));

                    //Edit piles
                    const pile = {
                        player: this.players[index],
                        playerId: this.players[index].id,
                        playerName: playerName,
                        pileData: {
                            remaining: listOfCards.piles[`${playerName}`].remaining,
                            listIds: cardIds,
                        }
                    }
                    //Check if player already exists
                    if (existingPile[0])
                        existingPile[0].pileData.listIds = cardIds;
                    else
                        this.piles.push(pile);
                }

                //Edit message
                sent.edit(new Discord.MessageEmbed()
                    .setDescription(`Finished Dealing Cards to ${this.numberOfPlayers} players.`)
                    .setAuthor(this.player.user.username, this.player.user.avatarURL())
                    .setColor('#09b50c')
                    .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`));
            } catch (error) {
                console.error(error);
                this.message.channel.WaffleResponse(`There was an error: ${error.message}`);
            }
        } else {
            //Divide all cards to every player
            this.DrawAllCards((this.deck.remaining / this.numberOfPlayers).floor());
        }
    }

    //Increase turn
    TurnPlus = () => {
        if (this.turnIndex >= this.numberOfPlayers - 1) this.turnIndex = 0;
        else this.turnIndex += 1;
    }

    //Reverse turn
    TurnMinus = () => {
        if (this.turnIndex == 0) this.turnIndex == this.numberOfPlayers - 1;
        else this.turnIndex -= 1;
    }

    //Turn
    TurnMessage = () => {
        //Send channel message
        this.message.channel.WaffleResponse(
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
            .setTimestamp()
            .setFooter(`Game Id: ${this.gameId} - Deck Id: ${this.deck.deck_id}`));
    }
}