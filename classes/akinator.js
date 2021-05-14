//Import
const { Aki } = require('aki-api');
const Discord = require('discord.js');
//Import functions
require('../message-commands.js')();

module.exports = class AkinatorGame {
    //Akinator game constructor
    constructor(bot, guild, message, player, region = 'en') {
        //Set all
        this.region = region || 'en';
        this.aki = new Aki(this.region);
        this.guild = guild;
        this.message = message;
        this.player = player;
        this.wonState = false;
        this.gameState;
        this.failures = 0;
        this.bot = bot;
    }

    //Start game
    StartGame() {
        //Start game
        this._newGame()
            .then((details) => {
                //Game loop
                var gameLoop = details;

                //Send message
                this.message.channel.send(
                    new Discord.MessageEmbed()
                        .setColor(`${gameLoop.progress.perc2color()}`)
                        .setAuthor(this.player.user.username, this.player.user.avatarURL())
                        .setDescription(`**Q${gameLoop.currentStep + 1}. ${gameLoop.question}**`)
                        .setFooter(`${gameLoop.answers.join(', ')}. Or type cancel to end the game.`))
                    .then((sent) => {
                        //Message filter and collector
                        const messageFilter = m => m.member.id == this.player.id && m.content;
                        const messageCollector = sent.channel.createMessageCollector(messageFilter, { time: 100000 });

                        //Await on message collector collect
                        messageCollector.on('collect', m => {
                            m.delete({ timeout: 100 }).catch(() => { }); //Delete message
                            var mess = m.content.toLowerCase();

                            //Switch case on message
                            var playersAnswer = (() => {
                                switch (mess) {
                                    case 'yes': case 'ye': case 'y':
                                        return 0;
                                    case 'no': case 'n':
                                        return 1;
                                    case `don't know`: case 'dont know': case `don't`: case 'dont': case 'd':
                                        return 2;
                                    case 'probably': case 'probs': case 'prob': case 'p':
                                        return 3;
                                    case 'probably not': case 'probably no': case 'probs not': case 'prob not': case 'pn':
                                        return 4;
                                    case 'cancel': case 'canc': case 'can': case 'c':
                                        return 5;
                                    default:
                                        return 'error';
                                }
                            })();

                            //Check if answer is given
                            if (!isNaN(playersAnswer)) {
                                //Check if players answer is valid
                                if (playersAnswer < gameLoop.answers.length) {
                                    //Check current progress
                                    if (gameLoop.progress >= 75 && gameLoop.currentStep >= 10) {
                                        //Await on win
                                        (async () => {
                                            await this._winGame();
                                            //Get details
                                            gameLoop = this._getDetails();

                                            var firstGuess = gameLoop.answers[0];
                                            this.gameState = await this.secondMessage(playersAnswer, gameLoop, firstGuess, sent);
                                            //Switch case on status
                                            switch (this.gameState.rule) {
                                                case 'Complete!':
                                                    messageCollector.stop(this.gameState);
                                                    break;
                                                case 'Reset':
                                                    messageCollector.resetTimer();
                                                    break;
                                                case 'Canceled':
                                                    messageCollector.stop(this.gameState);
                                                    break;
                                                default:
                                                    break;
                                            }
                                        })();
                                    } else {
                                        //Await on new step
                                        (async () => {
                                            //Get details
                                            gameLoop = await this._giveAnswer(playersAnswer);
                                            //Edit message
                                            sent.edit(new Discord.MessageEmbed()
                                                .setColor(`${gameLoop.progress.perc2color()}`)
                                                .setAuthor(this.player.user.username, this.player.user.avatarURL())
                                                .setDescription(`**Q${gameLoop.currentStep + 1}. ${gameLoop.question}**`)
                                                .setFooter(`${gameLoop.answers.join(', ')}. Or type cancel to end the game.`));
                                        })();

                                        //Empty the collector and reset timers
                                        messageCollector.resetTimer();
                                    }
                                } else {
                                    //Cancel game
                                    messageCollector.stop('Canceled');
                                }
                            } else {
                                //Send error message
                                this.message.channel
                                    .send(new Discord.MessageEmbed().setDescription(`Sorry, ${m} was not a valid answer. ` +
                                        `Please try again`).setColor('#b50909'))
                                    .then((deletesent) => {
                                        deletesent.delete({ timeout: 3000 }).catch(() => { });
                                    });
                                //Empty the collector and reset timers
                                messageCollector.resetTimer();
                            }
                        });

                        //Collector on stop
                        messageCollector.on('end', (c, reason) => {
                            if (!reason.message) {
                                //Edit message
                                sent.edit(new Discord.MessageEmbed()
                                    .setColor('#0099ff')
                                    .setAuthor(this.player.user.username, this.player.user.avatarURL())
                                    .setDescription(`Game ${(reason.rule ? reason.rule : reason != 'time' ? reason : `Didn't Receive any Answers so Ended`)}`));
                            } else {
                                //Edit message
                                reason.message.fields = [];
                                sent.edit(reason.message);
                            }

                            //Delete the akinator game
                            this.bot.akinatorGames.delete(this.player.id);
                        });
                    });
            }).catch((err) => {
                console.log(err);
                this.message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry there was an error starting your akinator game. Try again please.`).setColor('#b50909'));
            });
    }

    //Send second message
    async secondMessage(playersAnswer, gameLoop, firstGuess, sent) {
        return new Promise((resolve, reject) => {
            if (!this.wonState) {
                //Create message
                var finalMessage = new Discord.MessageEmbed()
                    .setColor(`${gameLoop.progress.perc2color()}`)
                    .setAuthor(this.player.user.username, this.player.user.avatarURL())
                    .setDescription(`I'm ${(parseFloat(firstGuess.proba) * 100).round()}% sure your character is...\n` +
                        `${firstGuess.name} ` +
                        `${!/^(-)+$/g.test(firstGuess.description) && firstGuess.description ? `(${firstGuess.description})` : ''} `)
                    .addFields({
                        name: `Is this correct?`,
                        value: `Yes: ✅, No: ❌. React with ⛔ to cancel the game.`
                    })
                    .setThumbnail(`${firstGuess.absolute_picture_path}`);

                //Send message
                sent.edit(finalMessage).then((confirmSent) => {
                    confirmSent.react('✅')
                        .then(() => confirmSent.react('❌'))
                        .then(() => confirmSent.react('⛔'))
                        .then(() => {
                            //Create emoji reaction filter
                            const confirmReactionFiler = (reaction, user) => {
                                return ['✅', '❌', '⛔'].includes(reaction.emoji.name) && user.id === this.player.id;
                            }
                            //Create reaction collector
                            const confirmReactionCollector = confirmSent.createReactionCollector(confirmReactionFiler, { max: 1, time: 100000 });

                            //Await reaction
                            confirmReactionCollector.on('collect', async (reaction, user) => {
                                //Switch case on reaction
                                if (reaction.emoji.name == '✅') {
                                    this.message.channel.send(new Discord.MessageEmbed().setDescription(`Great! I guessed correctly. I loved playing with you!`).setColor('#09b50c'));
                                    //Set this.winState
                                    this.wonState = true;

                                    //Stop both collectors and remove all reactions
                                    confirmReactionCollector.empty(); confirmReactionCollector.stop();
                                    await sent.reactions.removeAll();
                                    resolve({ rule: 'Complete!', message: finalMessage });
                                } else if (reaction.emoji.name == '❌') {
                                    //If failures is over 5 then just fail
                                    if (this.failures <= 5) {
                                        //Increment failures
                                        this.failures++;

                                        //Stop reaction collector and remove all reactions
                                        confirmReactionCollector.empty(); confirmReactionCollector.stop();
                                        await sent.reactions.removeAll();

                                        //Await game step back and then await step forward with oposite answer to players given
                                        gameLoop = await this._giveAnswer(
                                            (() => {
                                                switch (playersAnswer) {
                                                    case 0: return 1;
                                                    case 1: return 0;
                                                    case 2: return 2;
                                                    case 3: return 4;
                                                    case 4: return 3;
                                                }
                                            })());
                                        //Set progress to 0
                                        this.aki.progress = 0;

                                        //Edit message
                                        sent.edit(new Discord.MessageEmbed()
                                            .setColor(`${gameLoop.progress.perc2color()}`)
                                            .setAuthor(this.player.user.username, this.player.user.avatarURL())
                                            .setDescription(`**Q${gameLoop.currentStep + 1}. ${gameLoop.question}**\n\nTrying again....`)
                                            .setFooter(`${gameLoop.answers.join(', ')}. Or type cancel to end the game.`));

                                        resolve({ rule: 'Reset' });
                                    } else {
                                        //Stop reaction collector and remove all reactions
                                        confirmReactionCollector.empty(); confirmReactionCollector.stop();
                                        await sent.reactions.removeAll();

                                        //Create edit message
                                        finalMessage = new Discord.MessageEmbed()
                                            .setColor('#b50909')
                                            .setAuthor(this.player.user.username, this.player.user.avatarURL())
                                            .setDescription(`Damn... You got me! I can't figure it out. Maybe next time...`);

                                        resolve({ rule: 'Canceled', message: finalMessage });
                                    }
                                } else if (reaction.emoji.name == '⛔') {
                                    //Stop both collectors
                                    confirmReactionCollector.empty(); confirmReactionCollector.stop();
                                    await sent.reactions.removeAll();
                                    resolve({ rule: 'Canceled' });
                                }
                            })
                        });
                });
            } else {
                resolve('Canceled');
            }
        });
    }

    //Akinator start
    _newGame() {
        return new Promise(async (resolve, reject) => {
            await this.aki.start();
            resolve(this._getDetails());
        });
    }

    //Give answer
    async _giveAnswer(myAnswer) {
        try {
            await this._stepGame(myAnswer);
            return this._getDetails();
        } catch (err) {
            return this._getDetails();
        }
    }
    //Game step
    async _stepGame(myAnswer) {
        try {
            await this.aki.step(myAnswer);
        } catch (err) { }
    }
    //Game win
    async _winGame() {
        try {
            await this.aki.win();
        } catch (err) { }
    }
    //Game back
    async _backGame() {
        try {
            await this.aki.back();
        } catch (err) { }
    }

    //getters
    get question() {
        return this.aki.question;
    }
    get answers() {
        return this.aki.answers;
    }
    get currentStep() {
        return this.aki.currentStep;
    }
    get progress() {
        return this.aki.progress;
    }
    //Get details
    _getDetails() {
        return {
            question: this.question,
            answers: this.answers,
            currentStep: this.currentStep,
            progress: parseFloat(this.progress)
        };
    }
}