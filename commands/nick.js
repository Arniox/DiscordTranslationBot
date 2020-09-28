//Import classes
const googleApiKey = process.env.GOOGLE_API_KEY;
const Discord = require('discord.js');
const googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });
const fs = require('fs');

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        //Get all message mentions
        var mentions = message.mentions.members;
        //Get option
        var upperCommand = args.shift().toLowerCase();

        //Switch on upper command
        switch (upperCommand) {
            case 'translate':
                if (args.length != 0) {
                    //Get command
                    var command = args.shift().toLowerCase();
                    //Switch case on command
                    switch (command) {
                        case 'all':
                            //Check if correct perms
                            if (IsManager(message)) {
                                var query = args.shift();

                                //Check if query eixsts
                                new Promise((resolve, reject) => {
                                    if (query) {
                                        googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                            var language = languageCodes.find(i => i.language == query);
                                            //Return actual language or error
                                            if (language) resolve(language);
                                            else reject(`Unfortunately, my translation capabilities do not support ${query} as a language.`);
                                        })
                                    } else {
                                        googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                            resolve(languageCodes[Math.floor(SiteRand(languageCodes.length - 1, 0))]);
                                        });
                                    }
                                }).then((value) => {
                                    //Get all translation ignored players
                                    const sql_cmd = `
                                    SELECT * FROM translation_ignored_players
                                        WHERE ServerId = "${message.guild.id}"
                                    `;
                                    bot.con.query(sql_cmd, (error, results, fields) => {
                                        if (error) return console.error(error); //Return error console log and return

                                        //Grab members
                                        var members = message.guild.members.cache.filter(i => !i.user.bot && (!results || !results.length ? true : !results.map(v => v.PlayerId).includes(i.id)));
                                        var discludedMembers = message.guild.members.cache.filter(i => !i.user.bot && (!results || !results.length ? false : results.map(v => v.PlayerId).includes(i.id)));

                                        //Send message
                                        message.channel
                                            .send(new Discord.MessageEmbed().setDescription(`Translating 0 / ${members.size} members nicknames into ${value.name}`).setColor('#FFCC00'))
                                            .then((sent) => {
                                                var count = 0;

                                                //For all members in the guild
                                                members.map((v, key) => {
                                                    //Get current user nickname
                                                    var currentUserNickName = NickName(v);
                                                    //Increase count
                                                    count++;

                                                    if (IsLowerRoles(message, v)) {

                                                        //Translate
                                                        googleTranslate.translate(currentUserNickName, value.language, function (err, translation) {
                                                            //Change name
                                                            v.setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName} to ${translation.translatedText} in ${value.name}`);
                                                            //Edit message
                                                            if (count == members.size)
                                                                sent.edit(new Discord.MessageEmbed().setDescription(`✅ Translated ${count} / ${members.size} members nicknames into ${value.name}\n` +
                                                                    `Ignored ${discludedMembers.size} members.`).setColor('#09b50c'));
                                                            else
                                                                sent.edit(new Discord.MessageEmbed().setDescription(`Translating ${count} / ${members.size} members nicknames into ${value.name}`).setColor('#FFCC00'));
                                                        });
                                                    } else {
                                                        message.channel.send(new Discord.MessageEmbed().setDescription(`I had problem translating ${v.toString()}\'s` +
                                                            ` nickname due to Missing Permissions`).setColor('#b50909'));
                                                    }
                                                });
                                            });
                                    });
                                }).catch((err) => {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`${err}`).setColor('#b50909'));
                                });
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need management perms to run this command.').setColor('#b50909'));
                            }
                            break;
                        case 'me':
                            var query = args.shift();
                            if (IsLowerRoles(message, message.member)) {
                                //Check if query exists
                                new Promise((resolve, reject) => {
                                    if (query) {
                                        googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                            var language = languageCodes.find(i => i.language == query);
                                            //Return actual language or error
                                            if (language) resolve(language);
                                            else reject(`Unfortunately, my translation capabilities do not support ${query} as a language.`);
                                        });
                                    } else {
                                        googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                            resolve(languageCodes[Math.floor(SiteRand(languageCodes.length - 1, 0))]);
                                        });
                                    }
                                }).then((value) => {
                                    //Get current member nickname
                                    var currentUserNickName = NickName(message.member);

                                    //Translate name
                                    googleTranslate.translate(currentUserNickName, value.language, function (err, translation) {
                                        //Change name
                                        message.member.setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName}, to ${translation.translatedText} in ${value.name}`);
                                        //Send message
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`I have translated your nickname, ${currentUserNickName}, to ${translation.translatedText}` +
                                            ` in ${value.name}`).setColor('#09b50c'));
                                    });
                                }).catch((err) => {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`${err}`).setColor('#b50909'));
                                });
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`I cannot translate your nickname ${message.member.toString()} due to Missing Permissions`).setColor('#b50909'));
                            }
                            break;
                        case 'ignore':
                            var option = args.shift();

                            //Get a list of translation ignored players
                            const list_cmd = `
                            SELECT * FROM translation_ignored_players
                                WHERE ServerId = "${message.guild.id}"
                            `;
                            bot.con.query(list_cmd, (error, results, fields) => {
                                if (error) return console.error(error); //Throw error and return

                                //Check if option exists
                                if (option) {
                                    //Switch on option
                                    switch (option) {
                                        case 'list':
                                            //List out members
                                            var membersList = message.guild.members.cache
                                                .filter((value, key) => results.map(v => v.PlayerId).includes(key))
                                                .map((value, key) => value.toString());
                                            //Send message
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`${membersList.length} members are being nickname ignored.\n` +
                                                `${membersList.join(`\n`)}`).setColor('#0099ff'));
                                            break;
                                        default:
                                            HelpMessage(bot, guild, message, args);
                                            break;
                                    }
                                } else {
                                    //Check if you alraedy exist in the data base
                                    if (!results.map(v => v.PlayerId).includes(message.member.id)) {
                                        //Add user to database
                                        const addme_cmd = `
                                        INSERT INTO translation_ignored_players (PlayerId, ServerId)
                                            VALUES("${message.member.id}", "${message.guild.id}")
                                        `;
                                        bot.con.query(addme_cmd, (error, results, fields) => {
                                            if (error) return console.error(error); //Throw error and return

                                            //Message
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I have added you, ${message.member.toString()} to the nickname ignored members list.`).setColor('#09b50c'));
                                        });
                                    } else {
                                        //Remove user from database
                                        const removeme_cmd = `
                                        DELETE FROM translation_ignored_players
                                            WHERE PlayerId = "${message.member.id}"
                                            AND ServerId = "${message.guild.id}"
                                        `;
                                        bot.con.query(removeme_cmd, (error, results, fields) => {
                                            if (error) return console.error(error); //Throw error and return

                                            //Message
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I have removed you, ${message.member.toString()} from the nickname ignored members list.`).setColor('#09b50c'));
                                        });
                                    }
                                }
                            });
                            break;
                        case 'someone':
                            //Check if correct perms
                            if (IsNickNamer(message)) {
                                if (mentions.size == 1) {
                                    mentions.map((v, key) => {
                                        if (IsLowerRoles(message, v)) {
                                            //Get all translation ignored players
                                            const sql_cmd = `
                                            SELECT * FROM translation_ignored_players
                                                WHERE ServerId = "${message.guild.id}"
                                            `;
                                            bot.con.query(sql_cmd, (error, results, fields) => {
                                                if (error) return console.error(error); //Throw error and return

                                                if ((!results || !results.length ? true : !results.map(v => v.PlayerId).includes(key))) {
                                                    //Get query
                                                    args.shift(); //Remove mention
                                                    var query = args.shift();

                                                    //Check if query exists
                                                    new Promise((resolve, reject) => {
                                                        if (query) {
                                                            googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                                                var language = languageCodes.find(i => i.language == query);
                                                                //Return actual language or error
                                                                if (language) resolve(language);
                                                                else reject(`Unfortunately, my translation capabilities do not support ${query} as a language.`);
                                                            });
                                                        } else {
                                                            googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                                                resolve(languageCodes[Math.floor(SiteRand(languageCodes.length - 1, 0))]);
                                                            });
                                                        }
                                                    }).then((value) => {
                                                        //Get current member nickname
                                                        var currentUserNickName = NickName(v);

                                                        //Translate name
                                                        googleTranslate.translate(currentUserNickName, value.language, function (err, translation) {
                                                            //Change name
                                                            v.setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName} to ${translation.translatedText} in ${value.name}`);
                                                            //Send message
                                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I have translated ${v.user.username}\'s nickname from ${currentUserNickName} to ${translation.translatedText}` +
                                                                ` in ${value.name}`).setColor('#09b50c'));
                                                        });
                                                    }).catch((err) => {
                                                        message.channel.send(new Discord.MessageEmbed().setDescription(`${err}`).setColor('#b50909'));
                                                    });
                                                } else {
                                                    message.channel.send(new Discord.MessageEmbed().setDescription(`${v.toString()} has chosen to ignore his nickname from translation.` +
                                                        ` You cannot change his nickname unfortunately. Sorry.`).setColor('#b50909'));
                                                }
                                            });
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I hade problem translating ${v.toString()}\'s` +
                                                ` nickname due to Missing Permissions`).setColor('#b50909'));
                                        }
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you either didn\'t select anyone or you selected too many people to run this command on.' +
                                        'I can only translate one person at a time.').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need nick naming perms to run this command.').setColor('#b50909'));
                            }
                            break;
                        case 'whisper':
                            //Check if correct perms
                            if (IsNickNamer(message)) {
                                if (mentions.size == 1) {
                                    mentions.map((v, key) => {
                                        if (IsLowerRoles(message, v)) {
                                            //Get all translation ignored players
                                            const sql_cmd = `
                                            SELECT * FROM translation_ignored_players
                                                WHERE ServerId = "${message.guild.id}"
                                            `;
                                            bot.con.query(sql_cmd, (error, results, fields) => {
                                                if (error) return console.error(error);

                                                if ((!results || !results.length ? true : !results.map(v => v.PlayerId).includes(key))) {
                                                    //Get query
                                                    args.shift(); //Remove mention
                                                    var query = args.shift();

                                                    //Check if query exists
                                                    new Promise((resolve, reject) => {
                                                        if (query) {
                                                            googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                                                var language = languageCodes.find(i => i.language == query);
                                                                //Return actual language or error
                                                                if (language) resolve(language);
                                                                else reject(`Unfortunately, my translation capabilities do not support ${query} as a language.`);
                                                            });
                                                        } else {
                                                            googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                                                resolve(languageCodes[Math.floor(SiteRand(languageCodes.length - 1, 0))]);
                                                            });
                                                        }
                                                    }).then((value) => {
                                                        //Get current member nickname
                                                        var currentUserNickName = NickName(v);

                                                        //Get all supported languages
                                                        googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                                            //Send message and uodate
                                                            message.channel
                                                                .send(new Discord.MessageEmbed().setDescription(`Playing Chinese whispers with ${v.toString()}\'s nickname...`).setColor('#FFCC00'))
                                                                .then((sent) => {
                                                                    var langCount = 0;
                                                                    var previousLanguage = '***Auto Detected***';
                                                                    //Shuffle array
                                                                    languageCodes = Shuffle(languageCodes);
                                                                    var firstLanguage = `${languageCodes[0].name}`;
                                                                    var outPutName = currentUserNickName;

                                                                    //For loop through all languages
                                                                    languageCodes.forEach((lang) => {
                                                                        //Translate loop
                                                                        googleTranslate.translate(outPutName, lang.language, function (err, translation) {
                                                                            //Count lang
                                                                            langCount++;
                                                                            //Edit message
                                                                            sent.edit(new Discord.MessageEmbed()
                                                                                .setColor('#FFCC00')
                                                                                .setDescription(`Playing Chinese whispers with ${v.toString()}\'s nickname...`)
                                                                                .addFields(
                                                                                    {
                                                                                        name: 'Language -> Language',
                                                                                        value: `Gone through \`${langCount} / ${languageCodes.length}\` languages.` +
                                                                                            ` Just did \`${previousLanguage}\` to \`${lang.name}\``,
                                                                                        inline: true
                                                                                    },
                                                                                    {
                                                                                        name: 'Name -> Name',
                                                                                        value: `Name changed from \`${outPutName}\` to \`${translation.translatedText}\``,
                                                                                        inline: true
                                                                                    }
                                                                                )
                                                                                .setTimestamp()
                                                                            );
                                                                            //Change previous language name
                                                                            previousLanguage = lang.name;
                                                                            //Update user name to translate
                                                                            outPutName = translation.translatedText;

                                                                            console.log(langCount);
                                                                            console.log(languageCodes.length);
                                                                            console.log(langCount == languageCodes.length);
                                                                            //At end of loop, change nickname and edit message
                                                                            if (langCount == languageCodes.length) {
                                                                                //After loop, google translate to end language
                                                                                googleTranslate.translate(outPutName, value.language, function (err, translation) {
                                                                                    //Change username
                                                                                    v.setNickname(translation.translatedText.substring(0, 32), `Chinese whispers with ${v.user.username}\'s` +
                                                                                        ` nickname from ${firstLanguage} to ${value.name}`);
                                                                                    //Edit message
                                                                                    sent.edit(new Discord.MessageEmbed()
                                                                                        .setColor('#09b50c')
                                                                                        .setDescription(`✅ Finished playing Chinese whispers with ${v.toString()}\'s nickname.`)
                                                                                        .addFields(
                                                                                            {
                                                                                                name: 'Language',
                                                                                                value: `Went through all \`${langCount} / ${languageCodes.length}\` languages.`,
                                                                                                inline: true
                                                                                            },
                                                                                            {
                                                                                                name: 'Name',
                                                                                                value: `Original Name: \`${currentUserNickName}\` ane now, current name: \`${translation.translatedText}\``
                                                                                            }
                                                                                        )
                                                                                        .setTimestamp()
                                                                                    );
                                                                                });
                                                                            }
                                                                        });
                                                                    });
                                                                });
                                                        });
                                                    }).catch((err) => {
                                                        message.channel.send(new Discord.MessageEmbed().setDescription(`${err}`).setColor('#b50909'));
                                                    });
                                                } else {
                                                    message.channel.send(new Discord.MessageEmbed().setDescription(`${v.toString()} has chosen to ignore his nickname from translation.` +
                                                        ` You cannot change his nickname unfortunately.Sorry.`).setColor('#b50909'));
                                                }
                                            });
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I hade problem translating ${v.toString()}\'s` +
                                                ` nickname due to Missing Permissions`).setColor('#b50909'));
                                        }
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you either didn\'t select anyone or you selected too many people to run this command on.' +
                                        'I can only translate one person at a time.').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need nick naming perms to run this command.').setColor('#b50909'));
                            }
                            break;
                        default:
                            HelpMessage(bot, guild, message, args);
                            break;
                    }
                    break;
                } else {
                    HelpMessage(bot, guild, message, args);
                }
            case 'set':
                if (args.length != 0) {
                    //Get command
                    var command = args.shift().toLowerCase();
                    //switch case on command
                    switch (command) {
                        case 'all':
                            //Check if correct perms
                            if (IsManager(message)) {
                                var query = args.join(" ");

                                //Check if query exists
                                if (query) {
                                    //Get all translated ignored players
                                    const sql_cmd = `
                                    SELECT * FROM translation_ignored_players
                                        WHERE ServerId = "${message.guild.id}"
                                    `;
                                    bot.con.query(sql_cmd, (error, results, fields) => {
                                        if (error) return console.error(error); //Return error console log and return

                                        //Grab members
                                        var members = message.guild.members.cache.filter(i => !i.user.bot && (!results || !results.length ? true : !results.map(v => v.PlayerId).includes(i.id)));
                                        var discludedMembers = message.guild.members.cache.filter(i => !i.user.bot && (!results || !results.length ? false : results.map(v => v.PlayerId).includes(i.id)));

                                        //Send message
                                        message.channel
                                            .send(new Discord.MessageEmbed().setDescription(`Setting 0 / ${members.size} members nicknames to ${query}`).setColor('#FFCC00'))
                                            .then((sent) => {
                                                var count = 0;

                                                //For all members in the guild
                                                members.map((value, key) => {
                                                    //Increase count
                                                    count++;

                                                    //Check if bot has perms
                                                    if (IsLowerRoles(message, value)) {

                                                        //Change nickname
                                                        value.setNickname(query.substring(0, 32), `Set ${value.user.username}\'s nickname to ${query}.`);
                                                        //Edit message
                                                        if (count == members.size)
                                                            sent.edit(new Discord.MessageEmbed().setDescription(`✅ Set ${count} / ${members.size} members nicknames to ${query}\n` +
                                                                `Ignored ${discludedMembers.size} members.`).setColor('#09b50c'));
                                                        else
                                                            sent.edit(new Discord.MessageEmbed().setDescription(`Setting ${count} / ${members.size} members nicknames to ${query}`).setColor('#FFCC00'));
                                                    } else {
                                                        message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem setting ${value.toString()}\'s nickname due to Missing Permissions.`).setColor('#b50909'));
                                                    }
                                                });
                                            });
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot set everyone\'s name to nothing.').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need management perms to run this command.').setColor('#b50909'));
                            }
                            break;
                        case 'me':
                            var query = args.join(" ");

                            //Check if query exists
                            if (query) {
                                if (IsLowerRoles(message, message.member)) {
                                    //Get current user nickname
                                    var currentUserNickName = NickName(message.member);
                                    //Change nickname
                                    message.member.setNickname(query.substring(0, 32), `Set ${message.member.user.username}\'s nickname to ${query}.`);
                                    //send message
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I have changed your name, ${currentUserNickName}, to ${query}`).setColor('#09b50c'));
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I cannot set your nickname ${message.member.toString()} due to Missing Permissions`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot set your own name to nothing.').setColor('#b50909'));
                            }
                            break;
                        case 'someone':
                            //Check if correct perms
                            if (IsNickNamer(message)) {
                                if (mentions.size == 1) {
                                    mentions.map((value, key) => {
                                        if (IsLowerRoles(message, value)) {
                                            //Get query
                                            args.shift() //Remove mention
                                            var query = args.join(" ");

                                            //Check if query exists
                                            if (query) {
                                                //Change nickname
                                                value.setNickname(query.substring(0, 32), `Set ${value.user.username}\'s nickname to ${query}.`);
                                                //send message
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`I have changed ${value.toString()}\'s nickname to ${query}`).setColor('#09b50c'));
                                            } else {
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I cannot set ${value.toString()}\'s nickname to nothing.`).setColor('#b50909'));
                                            }
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`${value.toString()} has chosen to ignore his nickname from translation.` +
                                                ` You cannot change his nickname unfortunately. Sorry.`).setColor('#b50909'));
                                        }
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you either didn\'t select anyone or you selected too many people to run this command on.' +
                                        'I can only set one person at a time.').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need nick naming perms to run this command.').setColor('#b50909'));
                            }
                            break;
                        default:
                            HelpMessage(bot, guild, message, args);
                            break;
                    }
                    break;
                } else {
                    HelpMessage(bot, guild, message, args);
                }
            case 'reset':
                if (args.length != 0) {
                    //Get command
                    var command = args.shift().toLowerCase();
                    //switch case on command
                    switch (command) {
                        case 'all':
                            //Check if correct perms
                            if (IsManager(message)) {
                                //Get all translated ignored players
                                const sql_cmd = `
                                SELECT * FROM translation_ignored_players
                                    WHERE ServerId = "${message.guild.id}"
                                `;
                                bot.con.query(sql_cmd, (error, results, fields) => {
                                    if (error) return console.error(error); //Return error console log and return

                                    //Grab members
                                    var members = message.guild.members.cache.filter(i => !i.user.bot && (!results || !results.length ? true : !results.map(v => v.PlayerId).includes(i.id)));
                                    var discludedMembers = message.guild.members.cache.filter(i => !i.user.bot && (!results || !results.length ? false : results.map(v => v.PlayerId).includes(i.id)));

                                    //Send message
                                    message.channel
                                        .send(new Discord.MessageEmbed().setDescription(`Resetting 0 / ${members.size} members usernames.`).setColor('#FFCC00'))
                                        .then((sent) => {
                                            var count = 0;

                                            //For all members in the guild
                                            members.map((value, key) => {
                                                //Get current user nickname
                                                var currentUserNickName = NickName(value);
                                                //Increase count
                                                count++;

                                                if (IsLowerRoles(message, value)) {

                                                    //Reset nickname
                                                    value.setNickname(value.user.username, `Reset ${currentUserNickName}\'s nickname to default username (${value.user.username}).`);
                                                    //Edit message
                                                    if (count == members.size)
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`✅ Reset ${count} / ${members.size} members usernames.\n` +
                                                            `Ignored ${discludedMembers.size} members.`).setColor('#09b50c'));
                                                    else
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`Resetting ${count} / ${members.size} members usernames.`).setColor('#FFCC00'));
                                                } else {
                                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem resetting ${value.toString()}\'s nickname due to Missing Permissions.`).setColor('#b50909'));
                                                }
                                            });
                                        });
                                });
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need management perms to run this command.').setColor('#b50909'));
                            }
                            break;
                        case 'me':
                            if (IsLowerRoles(message, message.member)) {
                                //Get current user nickname
                                var currentUserNickName = NickName(message.member);
                                //Change nickanme
                                message.member.setNickname(message.member.user.username, `Reset ${currentUserNickName}\'s nickname to default username (${message.member.user.username})`);
                                //Send message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`I have reset your nickname, ${currentUserNickName}, to your default username (${message.member.user.username})`).setColor('#09b50c'));
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`I cannot reset your nickname ${message.member.toString()} due to Missing Permissions`).setColor('#b50909'));
                            }
                            break;
                        case 'someone':
                            //Check if correct perms
                            if (IsNickNamer(message)) {
                                if (mentions.size == 1) {
                                    mentions.map((value, key) => {
                                        if (IsLowerRoles(message, value)) {
                                            //Get current user nickname
                                            var currentUserNickName = NickName(value);
                                            //Change nickname
                                            value.setNickname(value.user.username, `Reset ${currentUserNickName}\'s nickname to default username (${value.user.username})`);
                                            //Send message
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I have reset ${currentUserNickName}\'s nickname to their default username (${value.user.username})`).setColor('#09b50c'));
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I hade problem translating ${value.toString()}\'s` +
                                                ` nickname due to Missing Permissions`).setColor('#b50909'));
                                        }
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you either didn\'t select anyone or you selected too many people to run this command on.' +
                                        'I can only translate one person at a time.').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need nick naming perms to run this command.').setColor('#b50909'));
                            }
                            break;
                        default:
                            HelpMessage(bot, guild, message, args);
                            break;
                    }
                    break;
                } else {
                    HelpMessage(bot, guild, message, args);
                }
            default:
                HelpMessage(bot, guild, message, args);
                break;
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
};

//Functions

function IsLowerRoles(message, member) {
    return message.guild.me.roles.highest.comparePositionTo(member.roles.highest) > 0 && !IsOwner(message, member);
}

function IsOwner(message, member) {
    return message.guild.owner == member;
}

//Get nickname / name of member
function NickName(member) {
    return (member.nickname != null && typeof (member.nickname) !== undefined && member.nickname !== '' ? member.nickname : member.user.username);
}

//Check if user has the correct permissions
function IsManager(message) {
    return message.member.hasPermission('MANAGE_GUILD');
}

//Check if user has the correct permissions
function IsNickNamer(message) {
    return message.member.hasPermission('MANAGE_NICKNAMES');
}

//help message
function HelpMessage(bot, guild, message, args) {
    var randomMember = message.guild.members.cache.random();

    //Get all available language codes
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Nick allows you to translate (into any supported language), set, and reset either you\'re own nickname, someone specific granted you have nickname managemental permissions,' +
            ' or everyone\'s granted you have management permissions.\n' +
            `You can also run *${guild.Prefix}nick ignore* to add/remove yourself from being translated.`)
        .addFields(
            {
                name: 'Required Permissions: ', value: 'Manage Server (for translating, setting, or resetting eveyone\'s nickname)\n' +
                    'Manage Nicknames (for translating, setting, or resetting someone\'s specific name.'
            },
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}nick [translate/set/reset] [all/me/someone/{translate:ignore/whisper}] [newname/{translate: languagecode (optional)}]\n\n` +
                    `${guild.Prefix}nick translate [all/me/someone/ignore/whisper] {translate:languagecode (optional)}\n\n` +
                    `${guild.Prefix}nick set [all/me/someone] newname\n\n` +
                    `${guild.Prefix}nick reset [all/me/someone]\n\n` +
                    `Any ${guild.Prefix}nick [translate] command without a language specified will pick a random language.`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}nick translate all RU - (will translate everyone\'s name to Russian)\n` +
                    `${guild.Prefix}nick translate all\n` +
                    `${guild.Prefix}nick translate me RU - (will translate your name to Russuan)\n` +
                    `${guild.Prefix}nick translate me\n` +
                    `${guild.Prefix}nick translate someone ${randomMember.toString()} RU\n` +
                    `${guild.Prefix}nick translate someone ${randomMember.toString()}\n` +
                    `${guild.Prefix}nick translate ignore - ` +
                    `(will add/remove you from the database of translation ignored members. This still allows you personally to use ***${guild.Prefix}nick translate me*** still)\n` +
                    `${guild.Prefix}nick translate whisper ${randomMember.toString()} EN - ` +
                    `(will play Chinese whispers with a members name through every single language and finish with EN. No language specificed remember will end on a random language)\n` +
                    `${guild.Prefix}nick set all StuffAndThings\n` +
                    `${guild.Prefix}nick set me StuffAndThings\n` +
                    `${guild.Prefix}nick set someone ${randomMember.toString()} StuffAndThings\n` +
                    `${guild.Prefix}nick reset all\n` +
                    `${guild.Prefix}nick reset me\n` +
                    `${guild.Prefix}nick reset someone ${randomMember.toString()}`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}

//Shuffle array
function Shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

//Random
function SiteRand(high, low) {
    return Math.random() * (high - low) + low;
}