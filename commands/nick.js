//Import classes
const googleApiKey = process.env.GOOGLE_API_KEY;
const Discord = require('discord.js');
const googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });
const fs = require('fs');

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        //Get all message mentions
        var mentions = message.mentions.members;
        //Get option
        var upperCommand = args.shift().toLowerCase();

        //Switch on upper command
        switch (upperCommand) {
            case 'translate':
                //Get command
                var command = args.shift().toLowerCase();
                //Switch case on command
                switch (command) {
                    case 'all':
                        //Check if correct perms
                        if (IsManager(message)) {
                            var query = args.shift().toLowerCase();

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
                                        resolve(languageCodes[SiteRand(languageCodes.length - 1, 0)]);
                                    });
                                }
                            }).then((value) => {
                                //Grab members
                                var members = message.guild.memebers.cache.filter(i => i.user.bot && !bot.config["nick-ignored-playerids"].includes(i.id));
                                var discludedMembers = message.guild.members.cache.fiter(i => !i.user.bot && bot.config["nick-ignored-playerids"].includes(i.id));

                                //Message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Translating ${members.size} members nickname\'s into ${value.name}` +
                                    `...\nThis may take up to ${members.size} seconds on a good day...\n${discludedMembers.size} nickname ignored members`).setColor('#0099ff'));
                                //Send message
                                message.channel
                                    .send(new Discord.MessageEmbed().setDescription(`Done 0 / ${members.size}`).setColor('#FFCC00'))
                                    .then((sent) => {
                                        var count = 0;

                                        //For all members in the guild
                                        members.map((v, key) => {
                                            if (IsLowerRoles(message, v)) {
                                                //Get current user nickname
                                                var currentUserNickName = NickName(v);

                                                //Translate
                                                googleTranslate.translate(currentUserNickName, value.language, function (err, translation) {
                                                    //Increase count
                                                    count++;
                                                    //Check if the bot has perms
                                                    //Change name
                                                    v.setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName} to ${translation.translatedText} in ${value.name}`);
                                                    //Edit message
                                                    sent.edit(new Discord.MessageEmbed().setDescription(`Done ${count} / ${members.size}`).setColor('#FFCC00'));
                                                });
                                            } else {
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`I hade problem translating ${v.toString()}\'s` +
                                                    ` nickname due to Missing Permissions`).setColor('#b50909'));
                                            }
                                        });
                                        sent.edit(new Discord.MessageEmbed().setDescription(`✅ Done ${count} / ${members.size}`).setColor('#09b50c'));
                                    });
                            }).catch((err) => {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`${err}`).setColor('#b50909'));
                            });
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need management perms to run this command.').setColor('#b50909'));
                        }
                        break;
                    case 'me':
                        var query = args.shift().toLowerCase();
                        if (IsLowerRoles(message, message.member)) {
                            //Check if query eixsts
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
                                        resolve(languageCodes[SiteRand(languageCodes.length - 1, 0)]);
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

                        //Check if option exists
                        if (option) {
                            //Switch on option
                            switch (option) {
                                case 'list':
                                    //List out members
                                    var membersList = message.guild.members.cache
                                        .filter((value, key) => bot.config["nick-ignored-playerids"].includes(key))
                                        .map((value, key) => value.toString());
                                    //Send message
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`${membersList.length} members are being nickname ignored.\n` +
                                        `${membersList.join(`\n`)}`).setColor('#0099ff'));
                                    break;
                                default:
                                    HelpMessage(bot, message, args);
                                    break;
                            }
                        } else {
                            //Check if you already exists in the data base
                            if (!bot.config["nick-ignored-playerids"].includes(message.member.id)) {
                                //Add user to database
                                bot.config["nick-ignored-playerids"].push(message.member.id);
                                //Write to file
                                fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                                //Message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`I have added you, ${message.member.toString()} to the nickname ignored members list.`).setColor('#09b50c'));
                            } else {
                                //Remove user from database
                                bot.config["nick-ignored-playerids"] = bot.config["nick-ignored-playerids"].filter(i => i !== message.member.id);
                                //Write file
                                fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                                //Message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`I have removed you, ${message.member.toString()} from the nickname ignored members list.`).setColor('#09b50c'));
                            }
                        }
                        break;
                    case 'someone':
                        //Check if correct perms
                        if (IsNickNamer(message)) {
                            if (mentions.size == 1) {
                                mentions.map((v, key) => {
                                    if (IsLowerRoles(message, v)) {
                                        if (!bot.config("nick-ignored-playersid").includes(key)) {
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
                                                        resolve(languageCodes[SiteRand(languageCodes.length - 1, 0)]);
                                                    });
                                                }
                                            }).then((value) => {
                                                //Get current member nickname
                                                var currentUserNickName = NickName(v);

                                                //Translate name
                                                googleTranslate.translate(currentUserNickName, value.language, function (err, translation) {
                                                    //Change name
                                                    message.member.setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName} to ${translation.translatedText} in ${value.name}`);
                                                    //Send message
                                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I have translated ${v, toString()}\'s nickname from ${currentUserNickName} to ${translation.translate}` +
                                                        ` in ${value.name}`).setColor('#09b50c'));
                                                });
                                            }).catch((err) => {
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`${err}`).setColor('#b50909'));
                                            });
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`${v.toString()} has chosen to ignore his nickname from translation.` +
                                                ` You cannot change his nickname unfortunately. Sorry.`).setColor('#b50909'));
                                        }
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
                                        if (!bot.config("nick-ignored-playersid").includes(key)) {
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
                                                        resolve(languageCodes[SiteRand(languageCodes.length - 1, 0)]);
                                                    });
                                                }
                                            }).then((value) => {
                                                //Get current member nickname
                                                var currentUserNickName = NickName(v);

                                                //Send message and uodate
                                                message.channel
                                                    .send(new Discord.MessageEmbed().setDescription(`Playing Chinese whispers with ${v.toString()}\'s nickname...`).setColor('#FFCC00'))
                                                    .then((sent) => {
                                                        var langCount = 0;
                                                        var previousLanguage = '***Auto Detected****';
                                                        //Shuffle array
                                                        languageCodes = Shuffle(languageCodes);
                                                        var firstLanguage = `${languageCodes[0].name}`;
                                                        var outPutName = currentUserNickName;

                                                        //Create promise
                                                        new Promise((resolve, reject) => {
                                                            languageCodes.forEach((lang, index, array) => {
                                                                googleTranslate.translate(outPutName, lang.language, function (err, translation) {
                                                                    langCount++;
                                                                    //Edit message
                                                                    sent.edit(new Discord.MessageEmbed()
                                                                        .setColor('#FFCC00')
                                                                        .setDescription(`Playing Chinese whispers with ${v.toString()}\'s nickname...`)
                                                                        .addFields(
                                                                            {
                                                                                name: 'Language -> Language',
                                                                                value: `Gone through \`${langCount} / ${languageCodes.length}\` languages.` +
                                                                                    ` Just did \`${previousLanguage}\ to \`${lang.name}\``,
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
                                                                    //Resolve once the loop is done
                                                                    if (index === array.length - 1) resolve();
                                                                });
                                                            });
                                                        }).then(() => {
                                                            //After loop, google translate to end language
                                                            googleTranslate.translate(outPutName, value.language, function (err, translation) {
                                                                //Change username
                                                                v.setNickname(translation.translatedText.substring(0, 32), `Chinese whispers with ${v.toString()}\'s` +
                                                                    ` nickname from ${firstLanguage} to ${value.name}`)
                                                                    .then(() => {
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
                        HelpMessage(bot, message, args);
                        break;
                }
                break;
            case 'set':
                //Get command
                var command = args.shift().toLowerCase();
                //switch case on command
                switch (command) {
                    case 'all':
                        //Check if correct perms
                        if (IsManager(message)) {
                            var query = args.shift();

                            //Check if query exists
                            if (query) {
                                //Grab members
                                var members = message.guild.members.cache.filer(i => !i.user.bot); //Forget about nick ignored players here. That's only for translation

                                //Message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Setting ${members.size} members nickname\'s to ${query}...\n` +
                                    `This may take up to ${members.size} seconds on a good day...\n`).setColor('#0099ff'));
                                //Send message
                                message.channel
                                    .send(new Discord.MessageEmbed().setDescription(`Done 0 / ${members.size}`).setColor('#FFCC00'))
                                    .then((sent) => {
                                        var count = 0;

                                        //For all members in the guild
                                        members.map((value, key) => {
                                            //Get current user nickname
                                            var currentUserNickName = NickName(value);
                                            //Increase count
                                            count++;
                                            //Check if bot has perms
                                            if (IsLowerRoles(message, value)) {
                                                //Change nickname
                                                value.setNickname(query.substring(0, 32), `Set ${value.toString()}\'s nickname to ${query}.`);
                                                //Edit message
                                                sent.edit(new Discord.MessageEmbed().setDescription(`Done ${count} / ${members.size}`).setColor('#FFCC00'));
                                            } else {
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem setting ${value.toString()}\'s nickname due to Missing Permissions.`).setColor('#b50909'));
                                            }
                                        });
                                        sent.edit(new Discord.MessageEmbed().setDescription(`✅ Done ${count} / ${members.size}`).setColor('#09b50c'));
                                    });
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot set everyone\'s name to nothing.').setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need management perms to run this command.').setColor('#b50909'));
                        }
                        break;
                    case 'me':
                        var query = args.shift();

                        //Check if query exists
                        if (query) {
                            if (IsLowerRoles(message, message.member)) {
                                //Get current user nickname
                                var currentUserNickName = NickName(message.member);
                                //Change nickname
                                message.member.setNickname(query.substring(0, 32), `Set ${message.member.toString()}\'s nickname to ${query}.`);
                                //send message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`I have changed your name, ${currentUserNickName}, to ${query}`));
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
                                        var query = args.shift();

                                        //Check if query exists
                                        if (query) {
                                            //Get current user nickname
                                            var currentUserNickName = NickName(value);
                                            //Change nickname
                                            value.setNickname(query.substring(0, 32), `Set ${value.toString()}\'s nickname to ${query}.`);
                                            //send message
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I have changed ${value.toString()}\'s nickname to ${query}`));
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I cannot set ${value.toString()}\'s nickname to nothing.`));
                                        }
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
                        HelpMessage(bot, message, args);
                        break;
                }
                break;
            case 'reset':
                //Get command
                var command = args.shift().toLowerCase();
                //switch case on command
                switch (command) {
                    case 'all':
                        //Check if correct perms
                        if (IsManager(message)) {
                            //Grab members
                            var members = message.guild.members.cache.filter(i => !i.user.bot); //Forget abouit nick ignored members. That's only for translation

                            //Message
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Resetting ${members.size} members nicknames to their default usernames...\n` +
                                `This may take up to ${members.size} seconds on a good day...\n`).setColor('#0099ff'));
                            //Send message
                            message.channel
                                .send(new Discord.MessageEmbed().setDescription(`Done 0 / ${members.size}`).setColor('#FFCC00'))
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
                                            sent.edit(new Discord.MessageEmbed().setDescription(`Done ${count} / ${members.size}`).setColor('#FFCC00'));
                                        } else {
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem resetting ${value.toString()}\'s nickname due to Missing Permissions.`).setColor('#b50909'));
                                        }
                                    });
                                    sent.edit(new Discord.MessageEmbed().setDescription(`✅ Done ${count} / ${members.size}`).setColor('#09b50c'));
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
                            message.channel.send(new Discord.MessageEmbed().setDescription(`I have reset your nickname, ${currentUserNickName}, to your default username (${message.member.user.username})`));
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
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`I have reset ${currentUserNickName}\'s nickname to their default username (${value.user.username})`));
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
                        HelpMessage(bot, message, args);
                        break;
                }
                break;
            default:
                HelpMessage(bot, message, args);
                break;
        }
    } else {
        HelpMessage(bot, message, args);
    }
};

//Functions

function IsLowerRoles(message, member) {
    return message.guild.me.roles.highest.comparePositionTo(member.roles.highest) > 0;
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
function HelpMessage(bot, message, args) {
    var randomMember = message.guild.members.cache.random();

    //Get all available language codes
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Nick allows you to translate (into any supported language), set, and reset either you\'re own nickname, someone specific granted you have nickname managemental permissions,' +
            ' or everyone\'s granted you have management permissions.\n' +
            `You can also run *${bot.config.prefix}nick ignore* to add/remove yourself from being translated.`)
        .addFields(
            {
                name: 'Required Permissions: ', value: 'Manage Server (for translating, setting, or resetting eveyone\'s nickname)\n' +
                    'Manage Nicknames (for translating, setting, or resetting someone\'s specific name.'
            },
            {
                name: 'Command Patterns: ',
                value: `${bot.config.prefix}nick [translate/set/reset] [all/me/someone/{translate:ignore/whisper}] [newname/{translate: languagecode (optional)}]\n\n` +
                    `${bot.config.prefix}nick translate [all/me/someone/ignore/whisper] {translate:languagecode (optional)}\n\n` +
                    `${bot.config.prefix}nick set [all/me/someone] newname\n\n` +
                    `${bot.config.prefix}nick reset [all/me/someone]\n\n` +
                    `Any ${bot.config.prefix}nick [translate] command without a language specified will pick a random language.`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix}nick translate all RU - (will translate everyone\'s name to Russian)\n` +
                    `${bot.config.prefix}nick translate all\n` +
                    `${bot.config.prefix}nick translate me RU - (will translate your name to Russuan)\n` +
                    `${bot.config.prefix}nick translate me\n` +
                    `${bot.config.prefix}nick translate someone ${randomMember.toString()} RU\n` +
                    `${bot.config.prefix}nick translate someone ${randomMember.toString()}\n` +
                    `${bot.config.prefix}nick translate ignore - ` +
                    `(will add/remove you from the database of translation ignored members. This still allows you personally to use ***${bot.config.prefix}nick translate me*** still)\n` +
                    `${bot.config.prefix}nick translate whisper ${randomMember.toString()} EN - ` +
                    `(will play Chinese whispers with a members name through every single language and finish with EN. No language specificed remember will end on a random language)\n` +
                    `${bot.config.prefix}nick set all StuffAndThings\n` +
                    `${bot.config.prefix}nick set me StuffAndThings\n` +
                    `${bot.config.prefix}nick set someone ${randomMember.toString()} StuffAndThings\n` +
                    `${bot.config.prefix}nick reset all\n` +
                    `${bot.config.prefix}nick reset me\n` +
                    `${bot.config.prefix}nick reset someone ${randomMember.toString()}`
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