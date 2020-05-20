//Import classes
const googleApiKey = process.env.GOOGLE_API_KEY;
const Discord = require('discord.js');
const googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        var mentions = message.mentions.members //Get all mentions
        //Get option
        var command = args.shift().toLowerCase();

        //Check which option you want
        switch (command) {
            case 'all':
                //Check if correct perms
                if (member.hasPermission('MANAGE_GUILD')) {
                    var query = args.shift().toLowerCase();

                    //Check if query exists
                    if (query) {
                        //Check if selected code exists in the supported languages
                        googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                            if (languageCodes.find(i => i.language == query)) {
                                //Grab members
                                var members = message.guild.members.cache.filter(i => i.user.bot != true && !bot.config["nick-ignored-playerids"].includes(i.id));

                                //Message
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Translating ${members.size} members nickname\'s into ${languageCodes.find(i => i.language == query.toLowerCase()).name}` +
                                    `...\n This may take up to ${members.size} seconds on a good day...\n` +
                                    `${message.guild.members.cache.filter(i => i.user.bot != true && bot.config["nick-ignored-playerids"].includes(i.id)).size} nickname ignored members.`).setColor('#0099ff'));
                                //Send message
                                message.channel
                                    .send(new Discord.MessageEmbed().setDescription(`Done 0 / ${members.size}`).setColor('#FFCC00'))
                                    .then((sent) => {
                                        var count = 0;

                                        //For all members in the guild
                                        members.map((value, key) => {
                                            //Get current user nickname.
                                            var currentUserNickName = (value.nickname != null && typeof (value.nickname) !== undefined && value.nickname !== '' ? value.nickname : value.user.username);

                                            //Translate
                                            googleTranslate.translate(currentUserNickName, query, function (err, translation) {
                                                //Increase count
                                                count++
                                                //Check if the bot has perms
                                                if (message.guild.me.roles.highest.comparePositionTo(value.roles.highest) > 0) {
                                                    //Change name
                                                    value.setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName} to ` +
                                                        `${translation.translatedText.substring(0, 32)} in ${languageCodes.find(i => i.language == query.toLowerCase()).name}`);

                                                    //Edit message
                                                    if (count == members.size) {
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`✅ Done ${count} / ${members.size}`).setColor('#09b50c'));
                                                    } else {
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`Done ${count} / ${members.size}`).setColor('#FFCC00'));
                                                    }
                                                } else {
                                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I had a problem translating ${value.toString()}\'s` +
                                                        ` nickname due to Missing Permissions.`).setColor('#b50909'));
                                                }
                                            });
                                        });
                                    });
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Unfortunately, my translation capabilities do not support ${query} as a language.`).setColor('#b50909'));
                            }
                        });
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, what language code did you want to use to translate everyone\'s name to?').setColor('#b50909'))
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need management perms to run this command.').setColor('#b50909'));
                }
                break;
            case 'me':
                var query = args.shift().toLowerCase();

                //Check if query exists
                if (query) {
                    //Check if selected code exists in the supported languages
                    googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                        if (languageCodes.find(i => i.language == query)) {
                            //Get current member nickname.
                            var currentUserNickName = (message.member.nickname != null && typeof (message.member.nickname) !== undefined && message.member.nickname !== '' ? mmessage.ember.nickname : message.author.username);

                            //Translate name
                            googleTranslate.translate(currentUserNickName, query, function (err, translation) {
                                //Change name
                                message.member
                                    .setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName} to ${translation.translatedText.substring(0, 32)}` +
                                        ` in ${languageCodes.find(i => i.language == query).name}`)
                                    .then(() => {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`I have translated your nickname from ${currentUserNickName} to ${translation.translatedText}` +
                                            ` in ${languageCodes.find(i => i.language == query).name}`).setColor('#09b50c'));
                                    })
                                    .catch(error => {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`${error.toString().split(':')[1]}, I cannot translate your nickname ${message.member.toString()}.`).setColor('#b50909'));
                                    });
                            });
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Unfortunately, my translation capabilities do not support ${query.toUpperCase()} as a language.`).setColor('#b50909'));
                        }
                    });
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, what language code did you want to use to translate your name to?').setColor('#b50909'));
                }
                break;
            case 'ignore':
                var option = args.shift();

                //Check if option exists
                if (option) {
                    //Check option
                    switch (option) {
                        case 'list':
                            //List out members
                            var membersList = message.guild.members.cache
                                .filter((value, key) => bot.config["nick-ignored-playerids"].includes(key))
                                .map((value, key) => value.toString());

                            message.channel.send(new Discord.MessageEmbed().setDescription(`${membersList.length} members are being nickname ignored.\n${membersList.join('\n')}`).setColor('#0099ff'));
                            break;
                        default:
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, I am not sure what you want to do?').setColor('#b50909'));
                            break;
                    }
                } else {
                    //Check if you already exist in the database
                    if (!bot.config["nick-ignored-playerids"].find(i => i === message.member.id)) {
                        //Add user to database
                        bot.config["nick-ignored-playerids"].push(message.member.id);
                        //Write file
                        fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                        //Message
                        message.channel.send(new Discord.MessageEmbed().setDescription(`I have added you, ${message.member.toString()} to the nickname ignored members.`).setColor('#09b50c'));
                    } else {
                        //Remove user from database
                        bot.config["nick-ignored-playerids"] = bot.config["nick-ignored-playerids"].filter(i => i !== message.member.id);
                        //Write file
                        fs.writeFileSync('./configure.json', JSON.stringify(settings));
                        //Message
                        message.channel.send(new Discord.MessageEmbed().setDescription(`I have removed you, ${message.member.toString()} from the nick name ignored members.`).setColor('#09b50c'));
                    }
                }
                break;
            case 'someone':
                //Check perms
                if (message.member.hasPermission('MANAGE_NICKNAMES')) {
                    if (mentions.size != 0) {
                        if (mentions.size == 1) {
                            mentions.map((value, key) => {
                                //Check that they are not a nickname ignored member
                                if (!settings["nick-ignored-playerids"].includes(key)) {
                                    //Get query
                                    args.shift(); //Remove mention
                                    var query = args.shift();

                                    //Check if query exists
                                    if (query) {
                                        //Check if selected code exists in the supported languages
                                        googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                            if (languageCodes.find(i => i.language == query.toLowerCase())) {
                                                //Get current member nicknane,
                                                var currentUserNickName = (value.nickname != null && typeof (value.nickname) !== undefined && value.nickname !== '' ? value.nickname : value.user.username);

                                                //Translate name
                                                googleTranslate.translate(currentUserNickName, query, function (err, translation) {
                                                    //Change name
                                                    value
                                                        .setNickname(translation.translatedText.substring(0, 32), `Translating name from ${currentUserNickName} to ${translation.translatedText.substring(0, 32)}` +
                                                            ` in ${languageCodes.find(i => i.language == query.toLowerCase()).name}`)
                                                        .then(() => {
                                                            message.channel.send(new Discord.MessageEmbed().setDescription(`I have translated ${value.toString()}\'s nickname from ${currentUserNickName} to ` +
                                                                `${translation.translatedText} in ${languageCodes.find(i => i.language == query.toLowerCase()).name}`).setColor('#09b50c'))
                                                        })
                                                        .catch(error => {
                                                            message.channel.send(new Discord.MessageEmbed().setDescription(`${error.toString().split(':')[1]}, I cannot translate ${value.toString()}\'s nickname.`).setColor('#b50909'))
                                                        });
                                                });
                                            } else {
                                                message.channel.send(new Discord.MessageEmbed().setDescription(`Unfortunately, my translation capabilities` +
                                                    ` do not support ${query} as a language.`).setColor('#b50909'));
                                            }
                                        });
                                    } else {
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, what language code did you want to` +
                                            ` use to translate ${value.toString()}\'s nickname to?`).setColor('#b50909'));
                                    }
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`${value.toString()} has chosen to ignore his nickname from translation.` +
                                        ` You cannot change his nickname unfortunately. Sorry.`).setColor('#b50909'));
                                }

                            });
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you can only translate one person at a time.').setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you didn\'t select anyone to nickname.').setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need nickname managment permissions to run this command.').setColor('#b50909'));
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
function HelpMessage(bot, message, args) {
    //Get all available language codes
    googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
        var embeddedHelpMessage = new Discord.MessageEmbed()
            .setColor('#b50909')
            .setAuthor(bot.user.username, bot.user.avatarURL())
            .setDescription('Nick allows you to translate either you\'re own nickname into any supported language, someone specific granted you have nickname managemental permissions,' +
                ' or everyone\'s granted you have management permissions.\n' +
                `You can also run *${bot.config.prefix}nick ignore* to add/remove yourself from the nicknaming command.\n` +
                '*This will still allow you to translate your own name, but will remove you from being mass nicknamed or specifically nicknamed.*')
            .addFields(
                { name: 'Required Permissions: ', value: 'Manage Server (for translating eveyone\'s nickname).' },
                {
                    name: 'Command Patterns: ',
                    value: `${bot.config.prefix}nick [me/all] [language code]\n` +
                        `${bot.config.prefix}nick someone @mention\n` +
                        `${bot.config.prefix}nick ignore {optional: list}`
                },
                {
                    name: 'Examples: ',
                    value: `${bot.config.prefix}nick me RU\n\n` +
                        `${bot.config.prefix}nick me DE\n\n` +
                        `${bot.config.prefix}nick all HE\n\n` +
                        `${bot.config.prefix}nick someone ${message.guild.members.cache.random().toString()}\n\n` +
                        `${bot.config.prefix}nick ignore (If you\'re not in the database, you\'ll be added, otherwise you\'ll be removed).\n\n` +
                        `${bot.config.prefix}nick ignore list`
                },
                {
                    name: 'Available Language Codes: ',
                    value: `${languageCodes.map(i => i.language).join(', ')}`
                }
            )
            .setTimestamp()
            .setFooter('Thanks, and have a good day');

        //Send embedded message
        message.channel
            .send(embeddedHelpMessage)
            .catch(error => { console.log('Error. Ignored') });
    });
}