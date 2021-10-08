//Import
const { v4: uuidv4 } = require('uuid');
require('../message-commands.js')();
var tools = require('../extra-functions.js');
const cards = require('./cards.js');

const DeckTypes = {
    Standard: [
        {
            code: 'AH',
            image: 'https://deckofcardsapi.com/static/img/AH.png',
            value: 'ACE',
            suit: 'HEARTS'
        },
        {
            code: '2H',
            image: 'https://deckofcardsapi.com/static/img/2H.png',
            value: '2',
            suit: 'HEARTS'
        },
        {
            code: '3H',
            image: 'https://deckofcardsapi.com/static/img/3H.png',
            value: '3',
            suit: 'HEARTS'
        },
        {
            code: '4H',
            image: 'https://deckofcardsapi.com/static/img/4H.png',
            value: '4',
            suit: 'HEARTS'
        },
        {
            code: '5H',
            image: 'https://deckofcardsapi.com/static/img/5H.png',
            value: '5',
            suit: 'HEARTS'
        },
        {
            code: '6H',
            image: 'https://deckofcardsapi.com/static/img/6H.png',
            value: '6',
            suit: 'HEARTS'
        },
        {
            code: '7H',
            image: 'https://deckofcardsapi.com/static/img/7H.png',
            value: '7',
            suit: 'HEARTS'
        },
        {
            code: '8H',
            image: 'https://deckofcardsapi.com/static/img/8H.png',
            value: '8',
            suit: 'HEARTS'
        },
        {
            code: '9H',
            image: 'https://deckofcardsapi.com/static/img/9H.png',
            value: '9',
            suit: 'HEARTS'
        },
        {
            code: '10H',
            image: 'https://deckofcardsapi.com/static/img/0H.png',
            value: '10',
            suit: 'HEARTS'
        },
        {
            code: 'JH',
            image: 'https://deckofcardsapi.com/static/img/JH.png',
            value: 'JACK',
            suit: 'HEARTS'
        },
        {
            code: 'QH',
            image: 'https://deckofcardsapi.com/static/img/QH.png',
            value: 'QUEEN',
            suit: 'HEARTS'
        },
        {
            code: 'KH',
            image: 'https://deckofcardsapi.com/static/img/KH.png',
            value: 'KING',
            suit: 'HEARTS'
        },
        {
            code: 'AD',
            image: 'https://deckofcardsapi.com/static/img/aceDiamonds.png',
            value: 'ACE',
            suit: 'DIAMONDS'
        },
        {
            code: '2D',
            image: 'https://deckofcardsapi.com/static/img/2D.png',
            value: '2',
            suit: 'DIAMONDS'
        },
        {
            code: '3D',
            image: 'https://deckofcardsapi.com/static/img/3D.png',
            value: '3',
            suit: 'DIAMONDS'
        },
        {
            code: '4D',
            image: 'https://deckofcardsapi.com/static/img/4D.png',
            value: '4',
            suit: 'DIAMONDS'
        },
        {
            code: '5D',
            image: 'https://deckofcardsapi.com/static/img/5D.png',
            value: '5',
            suit: 'DIAMONDS'
        },
        {
            code: '6D',
            image: 'https://deckofcardsapi.com/static/img/6D.png',
            value: '6',
            suit: 'DIAMONDS'
        },
        {
            code: '7D',
            image: 'https://deckofcardsapi.com/static/img/7D.png',
            value: '7',
            suit: 'DIAMONDS'
        },
        {
            code: '8D',
            image: 'https://deckofcardsapi.com/static/img/8D.png',
            value: '8',
            suit: 'DIAMONDS'
        },
        {
            code: '9D',
            image: 'https://deckofcardsapi.com/static/img/9D.png',
            value: '9',
            suit: 'DIAMONDS'
        },
        {
            code: '10D',
            image: 'https://deckofcardsapi.com/static/img/0D.png',
            value: '10',
            suit: 'DIAMONDS'
        },
        {
            code: 'JD',
            image: 'https://deckofcardsapi.com/static/img/JD.png',
            value: 'JACK',
            suit: 'DIAMONDS'
        },
        {
            code: 'QD',
            image: 'https://deckofcardsapi.com/static/img/QD.png',
            value: 'QUEEN',
            suit: 'DIAMONDS'
        },
        {
            code: 'KD',
            image: 'https://deckofcardsapi.com/static/img/KD.png',
            value: 'KING',
            suit: 'DIAMONDS'
        },
        {
            code: 'AC',
            image: 'https://deckofcardsapi.com/static/img/AC.png',
            value: 'ACE',
            suit: 'CLUBS'
        },
        {
            code: '2C',
            image: 'https://deckofcardsapi.com/static/img/2C.png',
            value: '2',
            suit: 'CLUBS'
        },
        {
            code: '3C',
            image: 'https://deckofcardsapi.com/static/img/3C.png',
            value: '3',
            suit: 'CLUBS'
        },
        {
            code: '4C',
            image: 'https://deckofcardsapi.com/static/img/4C.png',
            value: '4',
            suit: 'CLUBS'
        },
        {
            code: '5C',
            image: 'https://deckofcardsapi.com/static/img/5C.png',
            value: '5',
            suit: 'CLUBS'
        },
        {
            code: '6C',
            image: 'https://deckofcardsapi.com/static/img/6C.png',
            value: '6',
            suit: 'CLUBS'
        },
        {
            code: '7C',
            image: 'https://deckofcardsapi.com/static/img/7C.png',
            value: '7',
            suit: 'CLUBS'
        },
        {
            code: '8C',
            image: 'https://deckofcardsapi.com/static/img/8C.png',
            value: '8',
            suit: 'CLUBS'
        },
        {
            code: '9C',
            image: 'https://deckofcardsapi.com/static/img/9C.png',
            value: '9',
            suit: 'CLUBS'
        },
        {
            code: '10C',
            image: 'https://deckofcardsapi.com/static/img/0C.png',
            value: '10',
            suit: 'CLUBS'
        },
        {
            code: 'JC',
            image: 'https://deckofcardsapi.com/static/img/JC.png',
            value: 'JACK',
            suit: 'CLUBS'
        },
        {
            code: 'QC',
            image: 'https://deckofcardsapi.com/static/img/QC.png',
            value: 'QUEEN',
            suit: 'CLUBS'
        },
        {
            code: 'KC',
            image: 'https://deckofcardsapi.com/static/img/KC.png',
            value: 'KING',
            suit: 'CLUBS'
        },
        {
            code: 'AS',
            image: 'https://deckofcardsapi.com/static/img/AS.png',
            value: 'ACE',
            suit: 'SPADES'
        },
        {
            code: '2S',
            image: 'https://deckofcardsapi.com/static/img/2S.png',
            value: '2',
            suit: 'SPADES'
        },
        {
            code: '3S',
            image: 'https://deckofcardsapi.com/static/img/3S.png',
            value: '3',
            suit: 'SPADES'
        },
        {
            code: '4S',
            image: 'https://deckofcardsapi.com/static/img/4S.png',
            value: '4',
            suit: 'SPADES'
        },
        {
            code: '5S',
            image: 'https://deckofcardsapi.com/static/img/5S.png',
            value: '5',
            suit: 'SPADES'
        },
        {
            code: '6S',
            image: 'https://deckofcardsapi.com/static/img/6S.png',
            value: '6',
            suit: 'SPADES'
        },
        {
            code: '7S',
            image: 'https://deckofcardsapi.com/static/img/7S.png',
            value: '7',
            suit: 'SPADES'
        },
        {
            code: '8S',
            image: 'https://deckofcardsapi.com/static/img/8S.png',
            value: '8',
            suit: 'SPADES'
        },
        {
            code: '9S',
            image: 'https://deckofcardsapi.com/static/img/9S.png',
            value: '9',
            suit: 'SPADES'
        },
        {
            code: '10S',
            image: 'https://deckofcardsapi.com/static/img/0S.png',
            value: '10',
            suit: 'SPADES'
        },
        {
            code: 'JS',
            image: 'https://deckofcardsapi.com/static/img/JS.png',
            value: 'JACK',
            suit: 'SPADES'
        },
        {
            code: 'QS',
            image: 'https://deckofcardsapi.com/static/img/QS.png',
            value: 'QUEEN',
            suit: 'SPADES'
        },
        {
            code: 'KS',
            image: 'https://deckofcardsapi.com/static/img/KS.png',
            value: 'KING',
            suit: 'SPADES'
        }
    ],
    JOKERS: [
        {
            code: 'JO1',
            image: 'https://deckofcardsapi.com/static/img/X1.png',
            value: 'JOKER',
            suit: 'BLACK'
        },
        {
            code: 'JO2',
            image: 'https://deckofcardsapi.com/static/img/X2.png',
            value: 'JOKER',
            suit: 'RED'
        }
    ]
}

class CardAPI {
    constructor() {
        //Set all
        this.games = new Map();
        /*
        {
            deck_id: 0,
            remaining: 0,
            shuffled: false,
            cards: []
            piles: []
        }
        */
    }

    New(shuffled = true, deck_count = 1, jokers_enabled = false, cardsToStart = null) {
        const deck_id = uuidv4().split('-').slice(-1)[0].toLowerCase();
        var cardsForNewGame = [];

        //For loop of deck_count
        if (!cardsToStart) {
            for (var i = 0; i < deck_count; i++) {
                //Get cards
                if (jokers_enabled)
                    cardsForNewGame = cardsForNewGame.concat(DeckTypes.Standard.concat(DeckTypes.JOKERS));
                else
                    cardsForNewGame = cardsForNewGame.concat(DeckTypes.Standard.concat([]));
            }
        } else {
            //Get codes
            const codes = cardsToStart.split(',');
            //Pick specific cards
            cardsForNewGame = (DeckTypes.Standard.concat(DeckTypes.JOKERS)).filter(v => v.code == cardsToStart);
        }


        //Shuffle
        if (shuffled) cardsForNewGame.shuffle();

        this.games.set(deck_id, {
            deck_id: deck_id,
            remaining: cardsForNewGame.length,
            shuffled: shuffled,
            cards: cardsForNewGame,
            floatingCards: [],
            piles: new Map()
        });
        const myDeck = this.GetDeck(deck_id);

        return {
            deck_id: myDeck.deck_id,
            remaining: myDeck.remaining,
            shuffled: shuffled
        }
    }

    NewPile(deck_id, pileName) {
        //Get game
        try {
            const myDeck = this.GetDeck(deck_id);
            if (!this.GetPile(deck_id, pileName)) {
                //Create new pile
                myDeck.piles.set(pileName, {
                    remaining: 0,
                    cards: []
                });

                //Return object
                return {
                    deck_id: myDeck.deck_id,
                    shuffle: myDeck.shuffled,
                    remaining: myDeck.remaining,
                    piles: myDeck.piles.get(pileName)
                }
            } else {
                throw `Pile already exists with the name ${pileName}`;
            }
        } catch (e) {
            throw e;
        }
    }

    AddToPile(deck_id, pileName, cards = null) {
        //Get game
        try {
            const myDeck = this.GetDeck(deck_id);
            var myPile = this.GetPile(deck_id, pileName);
            if (cards) {
                if (!myPile) {
                    //Create new pile and get again
                    this.NewPile(deck_id, pileName);
                    myPile = this.GetPile(deck_id, pileName);
                }

                //Get cards
                const codes = cards.split(',');

                //Pull from floatingCards into pile
                myPile.cards = myPile.cards.concat(myDeck.floatingCards.filter(v => codes.includes(v.code)));
                //Update floatingCards
                myDeck.floatingCards = myDeck.floatingCards.filter(v => !codes.includes(v.code));
                //Update myPile remaining
                myPile.remaining = myPile.cards.length;

                //Return object
                return {
                    deck_id: myDeck.deck_id,
                    remaining: myDeck.remaining,
                    piles: myDeck.piles.get(pileName)
                }
            } else {
                throw `No cards were entered`;
            }
        } catch (e) {
            throw e;
        }
    }

    ShufflePile(deck_id, pileName) {
        //Get game
        try {
            const myDeck = this.GetDeck(deck_id),
                myPile = this.GetPile(deck_id, pileName);
            if (myPile) {
                //Shuffle piles cards
                myPile.cards.shuffle();

                //Return object
                return {
                    deck_id: myDeck.deck_id,
                    remaining: myDeck.remaining,
                    piles: myDeck.piles.get(pileName)
                }
            } else {
                throw `Couldn't find pile with name ${pileName}`;
            }
        } catch (e) {
            throw e;
        }
    }

    ListCardsPile(deck_id, pileName) {
        //Get game
        try {
            const myDeck = this.GetDeck(deck_id),
                myPile = this.GetPile(deck_id, pileName);
            if (myPile) {
                //Return object
                return {
                    deck_id: myDeck.deck_id,
                    remaining: myDeck.remaining,
                    piles: myDeck.piles.get(pileName)
                }
            } else {
                throw `Couldn't find pile with name ${pileName}`;
            }
        } catch (e) {
            throw e;
        }
    }

    ResetDeck(deck_id) {
        //Get game
        try {
            const myDeck = this.GetDeck(deck_id);

            //Remove from floatingCards and put back into deck
            myDeck.cards = myDeck.cards.concat(myDeck.floatingCards);
            //Update floatingCards
            myDeck.floatingCards = [];
            //Update remaining
            myDeck.remaining = myDeck.cards.length;

            //Return object
            return {
                deck_id: myDeck.deck_id,
                remaining: myDeck.remaining,
                floatingCards: myDeck.floatingCards
            }
        } catch (e) {
            throw e;
        }
    }

    ResetDeckWithPile(deck_id, pileName) {
        //Get game
        try {
            const myDeck = this.GetDeck(deck_id),
                myPile = this.GetPile(deck_id, pileName);
            if (myPile) {
                //Get all cards from pile
                const cardsToMove = myPile.cards;

                //Put into floating
                myDeck.floatingCards = myDeck.floatingCards.concat(cardsToMove);
                //Remove from cards
                myPile.cards = [];
                //Reset deck to add back to deck
                this.ResetDeck(deck_id);

                //Return object
                return {
                    deck_id: myDeck.deck_id,
                    remaining: myDeck.remaining,
                    piles: myDeck.piles.get(pileName),
                    floatingCards: myDeck.floatingCards,
                    cards: cardsToMove
                }
            } else {
                throw `Couldn't find pile with name ${pileName}`;
            }
        } catch (e) {
            throw e;
        }
    }

    CardsBackToDeck(deck_id, cards = null) {
        //Get game
        try {
            const myDeck = this.GetDeck(deck_id);
            if (cards) {
                //Get cards
                const codes = cards.split(',');

                //Remove from floatingCards and put back into deck
                myDeck.cards = myDeck.cards.concat(myDeck.floatingCards.filter(v = codes.includes(v.code)));
                //Update floating cards
                myDeck.floatingCards = myDeck.floatingCards.filter(v => !codes.includes(v.code));
                //Update remaining
                myDeck.remaining = myDeck.cards.length;

                //Return object
                return {
                    deck_id: myDeck.deck_id,
                    remaining: myDeck.remaining,
                    floatingCards: myDeck.floatingCards
                }
            } else {
                throw `No cards were entered`;
            }
        } catch (e) {
            throw e;
        }
    }

    DrawFromPile(deck_id, pileName, count = null, cards = null) {
        //Get game
        try {
            const myDeck = this.GetDeck(deck_id),
                myPile = this.GetPile(deck_id, pileName);
            if (myPile) {
                //Can't do both count and cards
                if (count && !cards) {
                    //Get cards to draw
                    const cardsToDraw = myPile.cards.slice(0, count);

                    //Put into floating
                    myDeck.floatingCards = myDeck.floatingCards.concat(cardsToDraw);
                    //Remove from cards
                    myPile.cards = myPile.cards.slice(0, count);
                    //Update remaining
                    myPile.remaining = myPile.cards.length;

                    //Return object
                    return {
                        deck_id: myDeck.deck_id,
                        remaining: myDeck.remaining,
                        piles: myDeck.piles.get(pileName),
                        cards: cardsToDraw
                    }
                } else if (!count && cards) {
                    //Get cards
                    const codes = cards.split(','),
                        cardsToDraw = myPile.cards.filter(v => codes.includes(v.code));

                    //Pull from pile into floatingCards
                    myDeck.floatingCards = myDeck.floatingCards.concat(myPile.cards.filter(v = codes.includes(v.code)));
                    //Update pile
                    myPile.cards = myPile.filter(v => !codes.includes(v.code));

                    //Return object
                    return {
                        deck_id: myDeck.deck_id,
                        remaining: myDeck.remaining,
                        piles: myDeck.piles.get(pileName),
                        cards: cardsToDraw
                    }
                } else {
                    throw `Can't draw both a count and list of cards from pile ${pileName}`;
                }
            } else {
                throw `Couldn't find pile with name ${pileName}`;
            }
        } catch (e) {
            throw e;
        }
    }

    Draw(deck_id, count = 1) {
        //Get game
        try {
            const myDeck = this.GetDeck(deck_id),
                cardsToDraw = myDeck.cards.slice(0, count);

            if (myDeck.cards.length > 0) {
                //Put into floating
                myDeck.floatingCards = myDeck.floatingCards.concat(cardsToDraw);
                //Remove from cards
                myDeck.cards = myDeck.cards.slice(0, count);
                //Update remaining
                myDeck.remaining = myDeck.cards.length;

                //Return object
                return {
                    cards: cardsToDraw,
                    deck_id: myDeck.deck_id,
                    remaining: myDeck.remaining
                }
            } else {
                throw 'Not enough cards remaining to draw 1 additional';
            }
        } catch (e) {
            throw e;
        }
    }

    Shuffle(deck_id) {
        //Get game
        try {
            const myDeck = this.GetDeck(deck_id);
            //Shuffle
            myDeck.cards.shuffle();
            myDeck.shuffled = true;

            //Return object
            return {
                deck_id: myDeck.deck_id,
                shuffled: true,
                remaining: myDeck.remaining
            }
        } catch (e) {
            throw e;
        }
    }

    GetPile(deck_id, pileName) {
        const myDeck = this.GetDeck(deck_id);
        if (myDeck.piles.get(pileName))
            return this.GetDeck(deck_id).piles.get(pileName);
        else
            return null;
    }

    GetDeck(deck_id) {
        if (this.games.get(deck_id))
            return this.games.get(deck_id);
        else throw `Can't find game with deck id of ${deck_id}`;
    }

    GetObject(name) {
        return Object.values(DeckTypes)[`${name}`];
    }
}

module.exports = {
    CardAPI: CardAPI
}