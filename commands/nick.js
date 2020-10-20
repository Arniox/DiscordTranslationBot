//Import classes
const Discord = require('discord.js');
const googleApiKey = process.env.GOOGLE_API_KEY;
const googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        //Get all message mentions
        var mentions = message.mentions.members;
        //Get option
        var upperCommand = args.shift().toLowerCase();

        //Switch on upper command
        switch (upperCommand) {
            case 'translate': case 'trans': case 'tran': case 't':
                //If this guild is not allowed to use translation commands
                if (guild.Allowed_Translation == 1) {
                    if (args.length != 0) {
                        //Get command
                        var command = args.shift().toLowerCase();
                        //Switch case on command
                        switch (command) {
                            case 'all': case 'a':
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
                            case 'me': case 'm':
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
                            case 'someone': case 'some': case 'one': case 's':
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
                            case 'whisper': case 'whis': case 'wis': case 'w':
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
                                                                                ).catch((err) => { return; });
                                                                                //Change previous language name
                                                                                previousLanguage = lang.name;
                                                                                //Update user name to translate
                                                                                outPutName = translation.translatedText;

                                                                                //At end of loop, change nickname and edit message
                                                                                if (langCount == languageCodes.length) {
                                                                                    //After loop, google translate to end language
                                                                                    googleTranslate.translate(outPutName, value.language, function (err, translation) {
                                                                                        //Change username
                                                                                        v.setNickname(translation.translatedText.substring(0, 32), `Chinese whispers with ${v.user.username}\'s` +
                                                                                            ` nickname from ${firstLanguage} through ${languageCodes.length} languages to ${value.name}`);
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
                                                                                        ).catch((err) => { return; });
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
                    } else {
                        HelpMessage(bot, guild, message, args);
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, your discord server is dissallowed to use translation commands. This is a premium service.`).setColor('#b50909'));
                }
                break;
            case 'set': case 's':
                if (args.length != 0) {
                    //Get command
                    var command = args.shift().toLowerCase();
                    //switch case on command
                    switch (command) {
                        case 'all': case 'a':
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
                        case 'me': case 'm':
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
                        case 'someone': case 'some': case 'one': case 's':
                            //Check if correct perms
                            if (IsNickNamer(message)) {
                                if (mentions.size == 1) {
                                    if (IsLowerRoles(message, mentions.first())) {
                                        //Get query
                                        args.shift() //Remove mention
                                        var query = args.join(" ");

                                        //Check if query exists
                                        if (query) {
                                            //Change nickname
                                            mentions.first().setNickname(query.substring(0, 32), `Set ${mentions.first().user.username}\'s nickname to ${query}.`);
                                            //send message
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I have changed ${mentions.first().toString()}\'s nickname to ${query}`).setColor('#09b50c'));
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I cannot set ${mentions.first().toString()}\'s nickname to nothing.`).setColor('#b50909'));
                                        }
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem setting ${mentions.first().toString()}\'s nickname due to Missing Permissions.`).setColor('#b50909'));
                                    }
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
            case 'append': case 'app': case 'a':
                if (args.length != 0) {
                    //Get command
                    var command = args.shift().toLowerCase();
                    //Switch case on command
                    switch (command) {
                        case 'all': case 'a':
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
                                            .send(new Discord.MessageEmbed().setDescription(`Appending 0 / ${members.size} members nicknames with ${query}`).setColor('#FFCC00'))
                                            .then((sent) => {
                                                var count = 0;

                                                //For all members in the guild
                                                members.map((value, key) => {
                                                    //Increase count
                                                    count++;

                                                    //Check if bot has perms
                                                    if (IsLowerRoles(message, value)) {

                                                        //Change nickname
                                                        value.setNickname((NickName(value) + query).substring(0, 32), `Appended ${value.user.username}\'s nickname with ${query}.`);
                                                        //Edit message
                                                        if (count == members.size)
                                                            sent.edit(new Discord.MessageEmbed().setDescription(`✅ Appended ${count} / ${members.size} members nicknames with ${query}\n` +
                                                                `Ignored ${discludedMembers.size} members.`).setColor('#09b50c'));
                                                        else
                                                            sent.edit(new Discord.MessageEmbed().setDescription(`Appending ${count} / ${members.size} members nicknames with ${query}`).setColor('#FFCC00'));
                                                    } else {
                                                        message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem appending ${value.toString()}\'s nickname due to Missing Permissions.`).setColor('#b50909'));
                                                    }
                                                });
                                            });
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot append everyone\'s name with nothing.').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need management perms to run this command.').setColor('#b50909'));
                            }
                            break;
                        case 'me': case 'm':
                            var query = args.join(" ");

                            //Check if query exists
                            if (query) {
                                if (IsLowerRoles(message, message.member)) {
                                    //Get current user nickname
                                    var currentUserNickName = NickName(message.member);
                                    //Change nickname
                                    message.member.setNickname((NickName(message.member) + query), `Appended ${message.member.user.username}\'s nickname with ${query}.`);
                                    //Send message
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I have appended your name, ${currentUserNickName}, with ${query}`).setColor('#09b50c'));
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I cannot append your nickname ${message.member.toString()} due to Missing Permissions.`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you cannot set yor own name to nothing.`).setColor('#b50909'));
                            }
                            break;
                        case 'someone': case 'some': case 'one': case 's':
                            //Check if correct perms
                            if (IsNickNamer(message)) {
                                if (mentions.size == 1) {
                                    if (IsLowerRoles(message, mentions.first())) {
                                        //Get query
                                        args.shift(); //Remove mention
                                        var query = args.join(" ");

                                        //Check if query exists
                                        if (query) {
                                            //Change nickname
                                            mentions.first().setNickname((NickName(mentions.first()) + query), `Appended ${mentions.first().user.username}\'s nickname with ${query}`);
                                            //Send message
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I have appended ${mentions.first().toString()}\'s nickname with ${query}`).setColor('#09b50c'));
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I cannot append ${mentions.first().toString()}\'s nickname with nothing.`).setColor('#b50909'));
                                        }
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem appending ${mentions.first().toString()}\'s nickname due to Missing Permissions.`).setColor('#b50909'));
                                    }
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
                } else {
                    HelpMessage(bot, guild, message, args);
                }
                break;
            case 'prepend': case 'prep': case 'p':
                if (args.length != 0) {
                    //Get command
                    var command = args.shift().toLowerCase();
                    //Switch case on command
                    switch (command) {
                        case 'all': case 'a':
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
                                            .send(new Discord.MessageEmbed().setDescription(`Prepending 0 / ${members.size} members nicknames with ${query}`).setColor('#FFCC00'))
                                            .then((sent) => {
                                                var count = 0;

                                                //For all members in the guild
                                                members.map((value, key) => {
                                                    //Increase count
                                                    count++;

                                                    //Check if bot has perms
                                                    if (IsLowerRoles(message, value)) {

                                                        //Change nickname
                                                        value.setNickname((query + NickName(value)).substring(0, 32), `Prepended ${value.user.username}\'s nickname with ${query}.`);
                                                        //Edit message
                                                        if (count == members.size)
                                                            sent.edit(new Discord.MessageEmbed().setDescription(`✅ Prepended ${count} / ${members.size} members nicknames with ${query}\n` +
                                                                `Ignored ${discludedMembers.size} members.`).setColor('#09b50c'));
                                                        else
                                                            sent.edit(new Discord.MessageEmbed().setDescription(`Prepending ${count} / ${members.size} members nicknames with ${query}`).setColor('#FFCC00'));
                                                    } else {
                                                        message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem prepending ${value.toString()}\'s nickname due to Missing Permissions.`).setColor('#b50909'));
                                                    }
                                                });
                                            });
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot prepend everyone\'s name with nothing.').setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need management perms to run this command.').setColor('#b50909'));
                            }
                            break;
                        case 'me': case 'm':
                            var query = args.join(" ");

                            //Check if query exists
                            if (query) {
                                if (IsLowerRoles(message, message.member)) {
                                    //Get current user nickname
                                    var currentUserNickName = NickName(message.member);
                                    //Change nickname
                                    message.member.setNickname((query + NickName(message.member)), `Prepended ${message.member.user.username}\'s nickname with ${query}.`);
                                    //Send message
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I have prepended your name, ${currentUserNickName}, with ${query}`).setColor('#09b50c'));
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I cannot prepend your nickname ${message.member.toString()} due to Missing Permissions.`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you cannot set yor own name to nothing.`).setColor('#b50909'));
                            }
                            break;
                        case 'someone': case 'some': case 'one': case 's':
                            //Check if correct perms
                            if (IsNickNamer(message)) {
                                if (mentions.size == 1) {
                                    if (IsLowerRoles(message, mentions.first())) {
                                        //Get query
                                        args.shift(); //Remove mention
                                        var query = args.join(" ");

                                        //Check if query exists
                                        if (query) {
                                            //Change nickname
                                            mentions.first().setNickname((query + NickName(mentions.first())), `Prepended ${mentions.first().user.username}\'s nickname with ${query}`);
                                            //Send message
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I have prepended ${mentions.first().toString()}\'s nickname with ${query}`).setColor('#09b50c'));
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I cannot prepend ${mentions.first().toString()}\'s nickname with nothing.`).setColor('#b50909'));
                                        }
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem prepending ${mentions.first().toString()}\'s nickname due to Missing Permissions.`).setColor('#b50909'));
                                    }
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
                } else {
                    HelpMessage(bot, guild, message, args);
                }
                break;
            case 'reset': case 'rest': case 'res': case 'r':
                if (args.length != 0) {
                    //Get command
                    var command = args.shift().toLowerCase();
                    //switch case on command
                    switch (command) {
                        case 'all': case 'a':
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
                        case 'me': case 'm':
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
                        case 'someone': case 'some': case 'one': case 's':
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
            case 'ignore': case 'ign': case 'ig': case 'i':
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
                            case 'lists': case 'list': case 'lis': case 'li': case 'l':
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
            case 'frozen': case 'freeze': case 'free': case 'fr': case 'f':
                //Check that you've only mentioned one single person
                if (mentions.size != 0) {
                    if (mentions.size < 2) {
                        //Check if correct perms
                        if (IsNickNamer(message)) {
                            //Check that the bot can actually freeze the nickname of this member
                            if (IsLowerRoles(message, mentions.first())) {
                                //Get query
                                args.shift(); //Remove mention
                                var query = args.join(" ");

                                //Check if query exists
                                if (query) {
                                    //Check if person already exists in database as frozen
                                    const check_sql = `
                                    SELECT * FROM player_frozen_names
                                        WHERE ServerId = "${message.guild.id}"
                                        AND MemberId = "${mentions.first().id}"
                                    `;
                                    bot.con.query(check_sql, (error, results, fields) => {
                                        if (error) return console.error(error); //Return console error
                                        else if (!results || !results.length) {
                                            //Player doesn't exist as frozen member. So create
                                            //Save frozen members nickname
                                            const save_sql = `
                                            INSERT INTO player_frozen_names (MemberId, ServerId, FrozenName, OriginalNickName, FrozenById)
                                                VALUES ("${mentions.first().id}", "${message.guild.id}", "${query.substring(0, 32)}", "${NickName(mentions.first())}", "${message.author.id}")
                                            `;
                                            bot.con.query(save_sql, (error, results, fields) => {
                                                if (error) return console.error(error); //Return console error

                                                //Change nickname
                                                mentions.first().setNickname(query.substring(0, 32), `Frozen ${mentions.first().user.username}\'s nickname as ${query}`);
                                                //Send message
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`I have frozen ${mentions.first().toString()}\'s nickname as ${query}`).setColor('#09b50c'));
                                            });
                                        } else {
                                            //Player already exists as frozen member. So update with new name
                                            var thisFrozenPlayer = results.find(i => i.MemberId == mentions.first().id);

                                            //First check that freezer admin is the same as last time
                                            if (thisFrozenPlayer.FrozenById == message.author.id) {
                                                const update_sql = `
                                                UPDATE player_frozen_names
                                                SET FrozenName = "${query.substring(0, 32)}"
                                                WHERE ServerId = "${message.guild.id}"
                                                AND MemberId = "${mentions.first().id}"
                                                `;
                                                bot.con.query(update_sql, (error, results, fields) => {
                                                    if (error) return console.error(error); //Return console error

                                                    //Change nickname
                                                    mentions.first().setNickname(query.substring(0, 32), `Updated frozen nickname of ${mentions.first().user.username} to ${query}`);
                                                    //Send message
                                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I have updated the frozen nickname of ${mentions.first().toString()} to ${query}`).setColor('#09b50c'));
                                                });
                                            } else {
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${message.guild.members.cache.get(thisFrozenPlayer.FrozenById)}` +
                                                    ` nickname froze ${mentions.first().toString()} and only they can update the frozen nickname of ${mentions.first().user.username}`).setColor('#b50909'));
                                            }
                                        }
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I cannot freeze ${mentions.first().toString()}\'s nickname as nothing.`).setColor('#b50909'));
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem freezing ${mentions.first().toString()}\'s` +
                                    ` nickname due to Missing Permissions.`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you need nick naming perms to run this command.`).setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you can only freeze one members nickname at once.`).setColor('#b50909'));
                    }
                } else {
                    //Check if you mean a list of frozen members
                    var command = args.shift();
                    //Switch on command
                    switch (command) {
                        case 'lists': case 'list': case 'lis': case 'li': case 'l':
                            //Look for existing subreddits
                            const sql_cmd = `
                            SELECT * FROM player_frozen_names
                                WHERE ServerId = "${message.guild.id}"
                            `;
                            bot.con.query(sql_cmd, (error, results, fields) => {
                                if (error) return console.error(error);

                                //For loop them into an output
                                var output = "";
                                for (var i = 0; i < results.length; i++) {
                                    //Create output per frozen membere
                                    output += `**${results[i].Id}** - ${message.guild.members.cache.get(results[i].MemberId).toString()} frozen as **${results[i].FrozenName}**\n`;
                                }
                                //Send message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`${results.length} Frozen Members.\n${output}`).setColor('#0099ff'));
                            });
                            break;
                        default:
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you didn\'t select anyone to freeze the nickname of.`).setColor('#b50909'));
                            break;
                    }
                }
                break;
            case 'unfrozen': case 'unfreeze': case 'unfreez': case 'unfree': case 'unfr': case 'unf': case 'uf':
                //Check if correct perms
                if (IsNickNamer(message)) {
                    //Check that you've only mentioned one single person
                    if (mentions.size != 0) {
                        if (mentions.size < 2) {
                            //Check that the bot can actually unfreeze the nickname of this member
                            if (IsLowerRoles(message, mentions.first())) {

                                //Get the frozen members details to see if even exists
                                const find_sql = `
                                SELECT * FROM player_frozen_names
                                    WHERE ServerId = "${message.guild.id}"
                                `;
                                bot.con.query(find_sql, (error, results, fields) => {
                                    if (error) return console.error(error); //Return console error

                                    //Check if that member is actually frozen
                                    if (results.map(v => v.MemberId).includes(mentions.first().id)) {
                                        var thisFrozenPlayer = results.find(i => i.MemberId == mentions.first().id);

                                        //Check that the member trying to unfreeze this person is the same person who froze this member
                                        if (thisFrozenPlayer.FrozenById == message.author.id) {

                                            //Unfreeze this member
                                            const unsave_sql = `
                                            DELETE FROM player_frozen_names
                                                WHERE Id = "${thisFrozenPlayer.Id}"
                                                AND ServerId = "${thisFrozenPlayer.ServerId}"
                                            `;
                                            bot.con.query(unsave_sql, (error, results, fields) => {
                                                if (error) return console.error(error); //Return console error

                                                //Get current user nickname
                                                var currentUserNickName = NickName(mentions.first());
                                                //Reset nickname
                                                mentions.first().setNickname(thisFrozenPlayer.OriginalNickName, `Unfrozen ${currentUserNickName}\'s` +
                                                    ` nickname and reset it back to default username (${mentions.first().user.username})`);

                                                //Send message
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`I have unfrozen ` +
                                                    `${mentions.first().toString()}\'s nickname and reset it back to ${thisFrozenPlayer.OriginalNickName}.`).setColor('#09b50c'));
                                            });
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${message.guild.members.cache.get(thisFrozenPlayer.FrozenById)}` +
                                                ` nickname froze ${mentions.first().toString()} and only they can unfreeze the nickname of ${mentions.first().user.username}`).setColor('#b50909'));
                                        }
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`${mentions.first().toString()} does not have a frozen nickname sorry.`).setColor('#b50909'));
                                    }
                                });
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem unfreezing ${mentions.first().toString()}\'s` +
                                    ` nickname due to Missing Permissions.`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you can only unfreeze one members nickname at once.`).setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you didn\'t select anyone to unfreeze the nickname of.`).setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you need nick naming perms to run this command.`).setColor('#b50909'));
                }
                break;
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
    return (member.nickname ? member.nickname : member.user.username);
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
    //Get random member
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
                value: `${guild.Prefix}nick [translate:trans:tran:t / set:s / append:app:a / prepend:prep:p / reset:rest:res:r / ignore:ign:ig:i / ` +
                    `frozen:freeze:freez:fr:f:free / unfrozen:unfreeze:unfreez:unfree:unfr:unf:uf] [selector] [setting]\n` +
                    `${guild.Prefix}nick translate [all:a / me:m / someone:some:s:one / whisper:whis:wis:w ] [:?member tag] [:?languagecode]\n` +
                    `${guild.Prefix}nick append [all:a / me:m / someone:some:s:one] [:?member tag] [suffix]\n` +
                    `${guild.Prefix}nick prepend [all:a / me:m / someone:some:s:one] [:?member tag] [prefix]\n` +
                    `${guild.Prefix}nick set [all:a / me:m / someone:some:s:one] [:?member tag] [newname]\n` +
                    `${guild.Prefix}nick reset [all:a / me:m / someone:some:s:one] [:?member tag]\n` +
                    `${guild.Prefix}nick freeze [member tag / lists:list:lis:li:l] [:?newname]\n` +
                    `${guild.Prefix}nick unfreeze [member tag]\n` +
                    `${guild.Prefix}nick ignore [:?lists:list:lis:li:l]\n\n` +
                    `Any ${guild.Prefix}nick [translate] command without a language specified will pick a random language.`
            },
            {
                name: 'Examples 1: ',
                value: `${guild.Prefix}nick translate all RU - (will translate everyone\'s name to Russian)\n` +
                    `${guild.Prefix}nick translate all\n` +
                    `${guild.Prefix}nick translate me RU - (will translate your name to Russuan)\n` +
                    `${guild.Prefix}nick translate me\n` +
                    `${guild.Prefix}nick translate someone ${randomMember.toString()} RU\n` +
                    `${guild.Prefix}nick translate someone ${randomMember.toString()}\n` +
                    `${guild.Prefix}nick translate whisper ${randomMember.toString()} EN ` +
                    `*(will play Chinese whispers with a members name through every single language and finish with EN. No end language code specificed will end on a random language)*\n\n` +
                    `${guild.Prefix}nick set all StuffAndThings\n` +
                    `${guild.Prefix}nick set me StuffAndThings\n` +
                    `${guild.Prefix}nick set someone ${randomMember.toString()} StuffAndThings\n` +
                    `${guild.Prefix}nick ignore *(will toggle you from the database of ` +
                    `multi-user command ignored members such as* **${guild.Prefix}nick set all StuffAndThings**)\n` +
                    `${guild.Prefix}nick ignore list`
            },
            {
                name: 'Examples 2: ',
                value: `${guild.Prefix}nick append all .APEX\n` +
                    `${guild.Prefix}nick append me .APEX\n` +
                    `${guild.Prefix}nick append someone ${randomMember.toString()} .APEX\n` +
                    `${guild.Prefix}nick prepend all Slacker-\n` +
                    `${guild.Prefix}nick prepend me Slacker-\n` +
                    `${guild.Prefix}nick prepend someone ${randomMember.toString()} Slacker-\n` +
                    `${guild.Prefix}nick reset all\n` +
                    `${guild.Prefix}nick reset me\n` +
                    `${guild.Prefix}nick reset someone ${randomMember.toString()}\n` +
                    `${guild.Prefix}nick freeze ${randomMember.toString()} StuffAndThings\n` +
                    `${guild.Prefix}nick freeze list\n` +
                    `${guild.Prefix}nick unfreeze ${randomMember.toString()}\n`
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