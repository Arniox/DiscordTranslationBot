//Import classes
const googleApiKey = process.env.GOOGLE_API_KEY;
const Discord = require('discord.js');
const googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });

exports.run = (bot, message, args) => {
    if (args.length != 0) {
        var command = args.shift().toLowerCase();

        //Check which command you want help with
        switch (command) {
            case 'ping':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription(`The ping command is very simple. It prints out the bot uptime and current server prefix. Just use *${bot.config.prefix}ping* to run this command.`)
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'prefix':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription(`You can use prefix by running *${bot.config.prefix}prefix current* to list the current prefix, or *${bot.config.prefix}prefix change [new prefix]* to change the prefix.`)
                    .addFields(
                        { name: 'Required Permissions: ', value: 'Manage Server' },
                        { name: 'Example: ', value: `${bot.config.prefix}prefix current\n\n${bot.config.prefix}prefix change =` }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'when':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription(`The when command is very simple. It just prints out a random sarcastic comment. Just use *${bot.config.prefix}when* to run this command.`)
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'muterole':
                var randomRole = message.guild.roles.cache.random().toString();

                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#b50909')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('The muterole command allows you to add, list, or remove mute ignored roles to the server database.')
                    .addFields(
                        { name: 'Required Permissions: ', value: 'Manage Server' },
                        {
                            name: 'Command Patterns: ',
                            value: `${bot.config.prefix}muterole [add/remove] [@role]\n\n` +
                                `${bot.config.prefix}muterole remove {optional: all}\n\n` +
                                `${bot.config.prefix}muterole list`
                        },
                        {
                            name: 'Examples: ',
                            value: `${bot.config.prefix}muterole add ${randomRole}\n\n` +
                                `${bot.config.prefix}muterole remove ${randomRole}\n\n` +
                                `${bot.config.prefix}muterole remove all\n\n` +
                                `${bot.config.prefix}muterole list`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'mute':
                var randomChannel = message.guild.channels.cache.filter(i => i.type == 'voice').random().name;

                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('The mute command allows you to server mute everyone in a selected voice channel barring mute ignored roles. This works fine with spaces in the name and is case insensitive.')
                    .addFields(
                        { name: 'Command Patterns: ', value: `${bot.config.prefix}mute [voice channel name]` },
                        {
                            name: 'Examples: ',
                            value: `${bot.config.prefix}mute ${randomChannel}`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'unmute':
                var randomChannel = message.guild.channels.cache.filter(i => i.type == 'voice').random().name;

                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('The unmute command allows you to server unmute everyone in a selected voice channel barring mute ignored roles. This works fine with spaces in the name and is case insensitive.')
                    .addFields(
                        { name: 'Command Patterns: ', value: `${bot.config.prefix}unmute [voice channel name]` },
                        {
                            name: 'Examples: ',
                            value: `${bot.config.prefix}unmute ${randomChannel}`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'listen':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('[WIP] This command is a work in progress. Currently it\'s a bit buggy and can cause bot crashes. It will simply connect the bot to the current voice channel you\'re in.')
                    .addFields(
                        {
                            name: 'Required: ',
                            value: 'You must be in a voice channel for this to work.' +
                                ' If the bot is already listening to a channel, it wont move to a new one. You must ' +
                                `${bot.config.prefix}leave first and then ${bot.config.prefix}listen for it to listen to your current voice channel.`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'leave':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('[WIP] This command is a work in progress. Currently it\'s a bit buggy and can cause bot crashes. It will simply disconnect the bot from it\'s current voice channel.')
                    .addFields(
                        { name: 'Required: ', value: 'You must be in the same voice channel as the bot for this to work.' }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'translate':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('[WIP] Currently the command works, but the Regex patterns don\'t do anything. This command allows you to list, add, and remove Regex patterns for the translation to ignore.')
                    .addFields(
                        { name: 'Required Permissions: ', value: 'Manage Server (for adding and removing. Everyone else can use list the current patterns).' },
                        {
                            name: 'Command Patterns: ',
                            value: `${bot.config.prefix}translate [add/remove] [pattern / (Remove by index)]\n\n${bot.config.prefix}translate patterns`
                        },
                        {
                            name: 'Examples: ',
                            value: `${bot.config.prefix}translate add /(<:[A-Za-z]+:\d+>)/gi\n\n` +
                                `${bot.config.prefix}translate remove 1\n\n` +
                                `${bot.config.prefix}translate patterns`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'nick':
                //Get all available language codes
                googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                    var embeddedHelpMessage = new Discord.MessageEmbed()
                        .setColor('#0099ff')
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
                break;
            case 'prykie':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('The prykie command allows you to list, add, remove or print out a random prykie quote. Removing a quote needs server management permissions.')
                    .addFields(
                        { name: 'Required Permissions: ', value: 'Just for removing quotes; Manage Server is needed.' },
                        {
                            name: 'Command Patterns: ',
                            value: `${bot.config.prefix}prykie\n\n` +
                                `${bot.config.prefix}prykie [add/remove] [quote]\n\n` +
                                `${bot.config.prefix}prykie list`
                        },
                        {
                            name: 'Examples: ',
                            value: `${bot.config.prefix}prykie\n\n` +
                                `${bot.config.prefix}prykie add I love massive black cocks!\n\n` +
                                `${bot.config.prefix}prykie remove I love massive black cocks!\n\n` +
                                `${bot.config.prefix}prykie list`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'move':
                var randomChannel1 = message.guild.channels.cache.filter(i => i.type == 'voice').random().name;
                var randomChannel2 = message.guild.channels.cache.filter(i => i.type == 'voice').random().name;
                var randomChannel3 = message.guild.channels.cache.filter(i => i.type == 'voice').random().name;

                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('Use selectors to move people in voice channels to other voice channels. This command has a lot of different options. It works fine with spaces in the name and is case insensitive.')
                    .addFields(
                        { name: 'Required Permissions: ', value: 'Move Members' },
                        {
                            name: 'Command Patterns: ',
                            value: `${bot.config.prefix}move [Selector] [Split/Direct command prefix] [Channel(s)]\n\n` +
                                `${bot.config.prefix}move [Selector] - [Channel]\n\n` +
                                `${bot.config.prefix}move [Selector] = [Channel] & [Channel] & [Channel]`
                        },
                        {
                            name: 'Examples: ',
                            value: `${bot.config.prefix}move ${randomChannel1} - ${randomChannel2} (Move everyone in one voice channel to another voice channel)\n\n` +
                                `${bot.config.prefix}move * - ${randomChannel1} (Move everyone currently in any voice channel to a specific voice channel)\n\n` +
                                `${bot.config.prefix}move 5 > ${randomChannel1} - ${randomChannel2} (Move 5 randomly picked players from one voice channel to another voice channel)\n\n` +
                                `${bot.config.prefix}move ${randomChannel1} = ${randomChannel2} & ${randomChannel3} (Equally split everyone in one voice channel into any number of voice channels seperated by &)\n\n` +
                                `${bot.config.prefix}move * = ${randomChannel1} & ${randomChannel2} (Split everyone currently in any voice channel into any number of voice channels seperated by &)\n\n` +
                                `${bot.config.prefix}move 5 > ${randomChannel1} = ${randomChannel2} & ${randomChannel3}` +
                                ` (Equally split 5 randomly picked players from one voice channel into any number of voice channels seperated by &).`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'softban':
                var randomPerson1 = message.guild.members.cache.random();
                var randomPerson2 = message.guild.members.cache.random();

                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('Selected members will get banned and then instantly unbanned and sent a reinvite to the server. If you have server settings set up to auto ' +
                        'delete messages on a ban, this is a good way to clear a players messages.')
                    .addFields(
                        { name: 'Required Permissions: ', value: 'Administrator (banning multiple players at once needs max permissions).' },
                        { name: 'Command Patterns: ', value: `${bot.config.prefix}softban [mention]+` },
                        {
                            name: 'Examples: ', value: `${bot.config.prefix}softban ${message.guild.members.cache.random().toString()}\n\n` +
                                `${bot.config.prefix}softban ${randomPerson1.toString()}${randomPerson2.toString()}`
                        },
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'bancommand':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#b50909')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('Lets admins view and change the currently randomly generated Prykie ban command. It is always a three (10) letter/number command with no prefix.')
                    .addFields(
                        { name: 'Required Permissions: ', value: 'Administrator' },
                        {
                            name: 'Command Patterns: ',
                            value: `${bot.config.prefix}bancommand\n\n${bot.config.prefix}bancommand [change] [new 10 character ban command]`
                        },
                        {
                            name: 'Examples: ',
                            value: `${bot.config.prefix}bancommand\n\n` +
                                `${bot.config.prefix}bancommand change ${CreateCommand(10, bot)}\n\n` +
                                `${bot.config.prefix}bancommand change ${CreateCommand(20, bot)}` +
                                ` (This will automatically cut away the rest of the command change the command to the first 10 characters).\n\n` +
                                `${bot.config.prefix}bancommand change ${CreateCommand(4, bot)}` +
                                ` (This will not work and will give you an error. The command must be 10 characters long).`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Set embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'harrass':
                var randomPerson = message.guild.members.cache.random();

                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription(`Use this command to spam a mentioned member with any number of messages. Useful to get them to listen to you. Only available to administrators.`)
                    .addFields(
                        { name: 'Required Permissions: ', value: 'Administrator' },
                        {
                            name: 'Command Patterns: ',
                            value: `${bot.config.prefix}harrass [number] [member mention] [message]`
                        },
                        {
                            name: 'Examples: ',
                            value: `${bot.config.prefix}harrass 10 ${randomPerson.toString()} Hello, wake up. It's wakey wakey time!`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Set embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'f10':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription('This command is a meme. It will instantly ban Prykie and only Prykie. After banning, it will instantly unban and then send a reinvite to the server in a dm.\n' +
                        'Each time someone uses this command, the prefix will randomly change to a new 5 character command. Letters and numbers are used.')
                    .addFields(
                        { name: 'Required Permissions: ', value: 'Kick Members' },
                        { name: 'Info: ', value: 'This is the only command that does not require a prefix. It can just be run with f10 by itself in chat.' },
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            default:
                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${command} is not a command I can help you with.`).setColor('#b50909'));
                break;
        }
    } else {
        //All help
        var embeddedHelpMessage = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(bot.user.username, bot.user.avatarURL())
            .setDescription(`You asked for help? Well here it is. The following commands can be used. You can use *${bot.config.prefix}help [command]* to view more settings on the command`)
            .addFields({
                name: `${bot.config.prefix}ping`,
                value: 'Ping allows you to see the current uptime and current prefix of the server and double checks that the bot is running.'
            }, {
                name: `${bot.config.prefix}prefix`,
                value: 'Prefix allows you to view and edit the prefix of the server granted you have management permissions.'
            }, {
                name: `${bot.config.prefix}when`,
                value: 'Will post a randomly chosen sarcastic quote.'
            }, {
                name: `${bot.config.prefix}muterole`,
                value: 'Muterole allows you to add, list, or remove (all or some) roles to a list that is ignored by the mute command, granted you have management permissions.'
            }, {
                name: `${bot.config.prefix}mute`,
                value: 'Mute a voice channel but ignore the mute ignored roles, granted you have mute members permissions.'
            }, {
                name: `${bot.config.prefix}unmute`,
                value: 'Unmute a voice channel completely. This command wont ignore mute ignored roles. So everyone in the voice channel will be server unmuted, granted you have mute members permissions.'
            }, {
                name: `${bot.config.prefix}listen`,
                value: '[WIP] Currently this command wont do much. It\'ll simply connect the bot to your current voice channel.'
            }, {
                name: `${bot.config.prefix}leave`,
                value: '[WIP] Currently this command wont do much. It\'ll simply disconnect the bot from it\'s current voice channel.'
            }, {
                name: `${bot.config.prefix}translate`,
                value: 'List, add or remove translation ignored patterns to the database for your server. Adding or removing needs the management permissions.'
            }, {
                name: `${bot.config.prefix}nick`,
                value: `Translate your nickname into a specified language code.Use ${bot.config.prefix}help nick to see all the available language codes and more info.`
            }, {
                name: `${bot.config.prefix}prykie`,
                value: 'Used on it\'s own, it will post a random prykie quote. Otherwise, you can list, add or remove prykie quotes. Removing quotes needs the management permissions.'
            }, {
                name: `${bot.config.prefix}move`,
                value: 'Use a selector to move players from voice channels to voice channels all at once. Easy way to move players around, granted you have move member permissions.'
            }, {
                name: `${bot.config.prefix}softban`,
                value: 'Bans and then instantly unbans any mentioned members. Then sends them an invite.'
            }, {
                name: `${bot.config.prefix}bancommand`,
                value: 'Lets only admins see and change the current randomly generated Prykie ban command.'
            }, {
                name: `${bot.config.prefix}harrass`,
                value: 'Lets only admins spam someone with a specified message.'
            }, {
                name: 'f10',
                value: 'Instantly ban, unban and reinvite Prykie from the server, granted you have kick member permissions.',
                inline: true
            }, {
                name: 'Other Features',
                value: `${bot.user.username} will automatically read all messages sent in any chat and detect message languages. If the bot has over 75% confidence that the language is not english, it will replace your message with an English translated version.`
            })
            .setTimestamp()
            .setFooter('Thanks, and have a good day');

        //Send embedded message
        message.channel.send(embeddedHelpMessage);
    }
};


//Get random string of length
function CreateCommand(length, bot) {
    var result = '',
        characters = bot.datatouse["strings-to-chose-for-ban-command"],
        charactersLength = characters.length;
    for (var i = 0; i < length; ++i)
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}