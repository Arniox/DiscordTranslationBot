//Import
const Discord = require('discord.js');

module.exports = function () {
    this.ListMessage = function (message, text, color, arrayPromise, chunk = 10, endColour = '#09b50c') {
        arrayPromise.then((array) => {
            //Cut the array into chunks
            this.DestructArray(array, chunk).then((arrayArray) => {
                //Set up message array
                var messageArray = [];

                //Create final message
                var finalText = `**${array.length}** ${text}${text.slice(-1) == '\n' ? '' : '\n'}`;
                //Create message array
                for (i = 0; i < arrayArray.length; i++) {
                    messageArray.push(new Discord.MessageEmbed().setDescription(`${finalText}**${i * chunk} -> ${(i * chunk) + arrayArray[i].length}**\n` + arrayArray[i].join('\n')).setColor(color));
                }

                //Only send dynamic message if the message is big enough
                if (messageArray.length < 2) {
                    message.channel.send((messageArray.length > 0 ? messageArray[0] : new Discord.MessageEmbed().setDescription(finalText)).setColor(endColour)); //Send normal message
                } else {
                    message.channel.send(messageArray[0])
                        .then((sent) => {
                            sent.react('⬅️')
                                .then(() => sent.react('➡️'))
                                .then(() => {
                                    //Set up array index
                                    var index = 0;
                                    const indexPlus = () => {
                                        return (index >= messageArray.length - 1 ? index = 0 : index += 1);
                                    }
                                    const indexMinus = () => {
                                        return (index == 0 ? index = messageArray.length - 1 : index -= 1);
                                    }

                                    //Set up emoji reaction filter.
                                    const filter = (reaction, user) => {
                                        return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
                                    };
                                    //Create reaction collector
                                    const collector = sent.createReactionCollector(filter, { max: 1, time: 100000 });

                                    //Await reaction
                                    collector.on('collect', (reaction, user) => {
                                        if (reaction.emoji.name === '➡️')  //Go forward
                                            sent.edit(messageArray[indexPlus()]);
                                        else if (reaction.emoji.name === '⬅️') //Go backwards
                                            sent.edit(messageArray[indexMinus()]);

                                        //Remove reactions by user
                                        sent.reactions.cache.map((v, k) => v).filter(reaction => reaction.users.cache.has(user.id)).first().users.remove(user.id);
                                        //Empty the collector and reset the timer
                                        collector.empty();
                                        collector.resetTimer();
                                    });
                                    //Await end
                                    collector.on('end', r => {
                                        //Remove reactions and then edit message
                                        sent.reactions.removeAll()
                                            .then(() => {
                                                sent.edit(messageArray[index].setColor(endColour));
                                            }).catch((error) => { return; });
                                    });
                                });
                        });
                }
            });
        }).catch((err) => {
            return console.log(err);
        });
    }

    //Return a promise of an array of arrays (destructed array into chunks)
    this.DestructArray = function (array, chunk) {
        return new Promise((resolve, reject) => {
            //Set variables and then for loop through array by chunk size
            var i, j, arrayArray = [];
            for (i = 0, j = array.length; i < j; i += chunk) {
                arrayArray.push(array.slice(i, i + chunk));
            }
            //Resolve
            resolve(arrayArray);
        });
    }

    //Return a promise of an array
    this.MessageToArray = function (runme, split = '\n') {
        return new Promise((resolve, reject) => resolve(runme().split(split).filter(i => i)));
    }

    //Custom join
    this.CustomJoinText = function (array, seperator = '', splittingDistance = 0, splittingSeperator = '') {
        //If there is no splitting distance then just returned joined array
        if (splittingDistance == 0) return array.join(seperator);
        else {
            var out = '';
            for (var i = 0; i < array.length; i++) {
                if (i % splittingDistance == 0) out += splittingSeperator + array[i];
                else out += seperator + array[i];
            }
            return out;
        }
    }

    //Get nickname / name of member
    this.NickName = function (member) {
        return member.nickname || member.user.username;
    }
}