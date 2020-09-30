//Import classes
const googleApiKey = process.env.GOOGLE_API_KEY;
const Discord = require('discord.js');
const googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        var command = args.shift().toLowerCase();

        //Check which command you want help with
        switch (command) {
            case 'ping':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription(`The ping command is very simple. It prints out the bot uptime and current server prefix. Just use *${guild.Prefix}ping* to run this command.`)
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'prefix':
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(bot.user.username, bot.user.avatarURL())
                    .setDescription(`You can use prefix by running *${guild.Prefix}prefix current* to list the current prefix, or *${guild.Prefix}prefix change [new prefix]* to change the prefix.`)
                    .addFields(
                        { name: 'Required Permissions: ', value: 'Manage Server' },
                        { name: 'Example: ', value: `${guild.Prefix}prefix current\n\n${guild.Prefix}prefix change =` }
                    )
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
                            value: `${guild.Prefix}muterole [add/remove] [@role]\n\n` +
                                `${guild.Prefix}muterole remove {optional: all}\n\n` +
                                `${guild.Prefix}muterole list`
                        },
                        {
                            name: 'Examples: ',
                            value: `${guild.Prefix}muterole add ${randomRole}\n\n` +
                                `${guild.Prefix}muterole remove ${randomRole}\n\n` +
                                `${guild.Prefix}muterole remove all\n\n` +
                                `${guild.Prefix}muterole list`
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
                        { name: 'Command Patterns: ', value: `${guild.Prefix}mute [voice channel name]` },
                        {
                            name: 'Examples: ',
                            value: `${guild.Prefix}mute ${randomChannel}`
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
                        { name: 'Command Patterns: ', value: `${guild.Prefix}unmute [voice channel name]` },
                        {
                            name: 'Examples: ',
                            value: `${guild.Prefix}unmute ${randomChannel}`
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
                                `${guild.Prefix}leave first and then ${guild.Prefix}listen for it to listen to your current voice channel.`
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
                            value: `${guild.Prefix}translate [add/remove] [pattern / (Remove by index)]\n\n${guild.Prefix}translate patterns`
                        },
                        {
                            name: 'Examples: ',
                            value: `${guild.Prefix}translate add /(<:[A-Za-z]+:\d+>)/gi\n\n` +
                                `${guild.Prefix}translate remove 1\n\n` +
                                `${guild.Prefix}translate patterns`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
                message.channel.send(embeddedHelpMessage);
                break;
            case 'nick':
                var randomMember = message.guild.members.cache.random();

                //Get all available language codes
                var embeddedHelpMessage = new Discord.MessageEmbed()
                    .setColor('#0099ff')
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
                            value: `${guild.Prefix}move [Selector] [Split/Direct command prefix] [Channel(s)]\n\n` +
                                `${guild.Prefix}move [Selector] - [Channel]\n\n` +
                                `${guild.Prefix}move [Selector] = [Channel] & [Channel] & [Channel]`
                        },
                        {
                            name: 'Examples: ',
                            value: `${guild.Prefix}move ${randomChannel1} - ${randomChannel2} (Move everyone in one voice channel to another voice channel)\n\n` +
                                `${guild.Prefix}move * - ${randomChannel1} (Move everyone currently in any voice channel to a specific voice channel)\n\n` +
                                `${guild.Prefix}move 5 > ${randomChannel1} - ${randomChannel2} (Move 5 randomly picked players from one voice channel to another voice channel)\n\n` +
                                `${guild.Prefix}move ${randomChannel1} = ${randomChannel2} & ${randomChannel3} (Equally split everyone in one voice channel into any number of voice channels seperated by &)\n\n` +
                                `${guild.Prefix}move * = ${randomChannel1} & ${randomChannel2} (Split everyone currently in any voice channel into any number of voice channels seperated by &)\n\n` +
                                `${guild.Prefix}move 5 > ${randomChannel1} = ${randomChannel2} & ${randomChannel3}` +
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
                        { name: 'Command Patterns: ', value: `${guild.Prefix}softban [mention]+` },
                        {
                            name: 'Examples: ', value: `${guild.Prefix}softban ${message.guild.members.cache.random().toString()}\n\n` +
                                `${guild.Prefix}softban ${randomPerson1.toString()}${randomPerson2.toString()}`
                        },
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Send embedded message
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
                            value: `${guild.Prefix}harrass [number] [member mention] [message]`
                        },
                        {
                            name: 'Examples: ',
                            value: `${guild.Prefix}harrass 10 ${randomPerson.toString()} Hello, wake up. It's wakey wakey time!`
                        }
                    )
                    .setTimestamp()
                    .setFooter('Thanks, and have a good day');

                //Set embedded message
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
            .setDescription(`You asked for help? Well here it is. The following commands can be used. You can use **${guild.Prefix}help [command]** to view more settings on the command`)
            .addFields({
                name: `${guild.Prefix}ping`,
                value: 'Ping allows you to see the current uptime and current prefix of the server and double checks that the bot is running.'
            }, {
                name: `${guild.Prefix}prefix`,
                value: 'Prefix allows you to view and edit the prefix of the server granted you have manage server permissions.'
            }, {
                name: `${guild.Prefix}muterole`,
                value: 'Muterole allows you to add, list, or remove (all or some) roles to a list that is ignored by the mute command, granted you have mute role permissions.'
            }, {
                name: `${guild.Prefix}mute`,
                value: 'Mute a voice channel but ignore the mute ignored roles, granted you have mute members permissions.'
            }, {
                name: `${guild.Prefix}unmute`,
                value: 'Unmute a voice channel but leave the mute ignored roles muted, granted you have mute members permissions.'
            }, {
                name: `${guild.Prefix}listen`,
                value: '[WIP] Currently this command wont do much. It\'ll simply connect the bot to your current voice channel.'
            }, {
                name: `${guild.Prefix}leave`,
                value: '[WIP] Currently this command wont do much. It\'ll simply disconnect the bot from it\'s current voice channel.'
            }, {
                name: `${guild.Prefix}translate`,
                value: 'List, add or remove translation ignored patterns/channels or set the translation confidence restriction for your server, granted you have management permissions.\n' +
                    `You can also use **${guild.Prefix}translate languages** to list out available languages codes and more info.`
            }, {
                name: `${guild.Prefix}nick`,
                value: `Translate your nickname into a specified language code. Use **${guild.Prefix}translate languages** to see all the available language codes and more info.`
            }, {
                name: `${guild.Prefix}move`,
                value: 'Use a selector to move players from voice channels to voice channels all at once. Easy way to move players around, granted you have move member permissions.'
            }, {
                name: `${guild.Prefix}ban`,
                value: `${guild.Prefix}ban soft will ban and then instantly unban any mentioned members (supports pinging multiple members at once). Then sends them an invite.\n` +
                    `${guild.Prefix}ban hard will just ban any mentioned members (supports pining multiple members at once).`
            }, {
                name: `${guild.Prefix}harrass`,
                value: 'You can spam people with messages or spam move someone back and forth in a channel.'
            }, {
                name: 'Other Features',
                value: `If you have premium, ${bot.user.username} will automatically read all messages sent in any chat and detect message languages.` +
                    ` If the bot has over ${(guild.Translation_Confidence * 100).toString()}% confidence that the language is not english, it will replace your message with an English translated version.`
            })
            .setTimestamp()
            .setFooter('Thanks, and have a good day');

        //Send embedded message
        message.channel.send(embeddedHelpMessage);
    }
};