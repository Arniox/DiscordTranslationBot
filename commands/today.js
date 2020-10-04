//Requirements
const Discord = require('discord.js');
const moment = require('moment-timezone');

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        var command = args.shift().toLowerCase();
        //Get now
        var now = moment().tz('Australia/Sydney');

        //Switch on today command
        switch (command) {
            //Get time sections
            case 'eras': case 'era': case 'e':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Era: **${now.format('N')}**, **${now.format('NNNN')}**`).setColor('#09b50c'));
                break;
            case 'years': case 'year': case 'y':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Year: **${now.format('YYYY')}**`).setColor('#09b50c'));
                break;
            case 'quarters': case 'quarter': case 'q':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Yearly Quarter: **${now.format('Qo')}**`).setColor('#09b50c'));
                break;
            case 'months': case 'month': case 'm':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Month: **${now.format('MMMM')}**, the **${now.format('Mo')}** Month of the Year`).setColor('#09b50c'));
                break;
            case 'weeks': case 'week': case 'w':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Week of the Year: **${now.format('wo')}**`).setColor('#09b50c'));
                break;
            case 'days': case 'day': case 'd':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Date is the **${now.format('Do')}**; **${now.format('DDDo')}** of the Year - **${now.format('dddd')}**`).setColor('#09b50c'));
                break;
            case 'hours': case 'hour': case 'h':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Hour: **${now.format('HH')}**`).setColor('#09b50c'));
                break;
            case 'minutes': case 'minute': case 'min': case 'mm':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Minute: **${now.format('mm')}**`).setColor('#09b50c'));
                break;
            case 'seconds': case 'second': case 'sec': case 's':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Second: **${now.format('ss')}**`).setColor('#09b50c'));
                break;
            case 'milliseconds': case 'millisecond': case 'milli': case 'mill': case 'mmm': case 'mi':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Millisecond: **${now.format('SSS')}**`).setColor('#09b50c'));
                break;
            //Get extra details
            case 'time': case 't':
                message.channel.send(new Discord.MessageEmbed().setDescription(`Current Date & Time in Milliseconds is **${now.format('x')}**`).setColor('#09b50c'));
                break;
            case 'now': case 'n':
                //Get the user selected range
                var range = args.map(i => i.toLowerCase()).join('');
                switch (range) {
                    case 'short': case 's':
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Today is: **${now.format('LTS - L z | ZZ')}**`).setColor('#09b50c'));
                        break;
                    case 'long': case 'l':
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Today is: **${now.format('LLLL zz | ZZ')}**`).setColor('#09b50c'));
                        break;
                    default:
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Today is: **${now.format('lll z')}**`).setColor('#09b50c'));
                        break;
                }
                break;
            case 'calculate': case 'calc': case 'c':
                //Get the left over strings
                var strings = args.shift().match(/[+-][\d]+[a-z]{1,2}/gi);
                if (strings.length > 0) {
                    //For each of the strings
                    var rightNow = moment().tz('Australia/Sydney');

                    //Create key value list
                    var usefulDigits = {
                        'y': { 'name': 'year' },
                        'Q': { 'name': 'quarter' },
                        'M': { 'name': 'month' },
                        'w': { 'name': 'week' },
                        'd': { 'name': 'day' },
                        'h': { 'name': 'hour' },
                        'm': { 'name': 'minute' },
                        's': { 'name': 'second' },
                        'ms': { 'name': 'millisecond' }
                    };

                    //Foreach
                    for (const e of strings) {
                        //Get ID
                        var identifier = e.match(/[+-]|[a-z]+|[^a-z]+/gi);
                        //Get the Mathematical Sign
                        var sign = identifier.shift();
                        //Get the number
                        var number = identifier.shift();
                        if (/^\d+$/.test(number)) {
                            //Get digit range
                            var digitRange = identifier.shift();

                            //Check if exists
                            if (digitRange in usefulDigits) {
                                //Switch on mathematical method
                                switch (sign) {
                                    case '+':
                                        rightNow.add(parseInt(number), digitRange);
                                        break;
                                    case '-':
                                        rightNow.subtract(parseInt(number), digitRange);
                                        break;
                                    default:
                                        return message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${sign} is not a supported math method right now.`).setColor('#b50909'));
                                }
                            } else {
                                return message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${digitRange} was not a date type I understood.\n` +
                                    `You can apply years (y), quarters (Q), months (M), days (d), hours (h), minutes (m), seconds (s), and milliseconds (ms)`).setColor('#b50909'));
                            }
                        } else {
                            return message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${number} was not a number I understood.`).setColor('#b50909'));
                        }
                    }

                    //Print
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Today **(${now.format('llll')})**\n` +
                        `${strings.map(i => `${i.match(/[+-]/gi)[0]} ${i.match(/[\d]+/gi)[0]} ${usefulDigits[i.match(/[a-z]+/gi)[0]]["name"]}(s)`).join('\n')} is:\n` +
                        `**${rightNow.format('llll')}**`).setColor('#09b50c'));
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I did not understand the time range you wanted.`).setColor('#b50909'));
                }
                break;
            default:
                HelpMessage(bot, guild, message, args);
                break;
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
}

function HelpMessage(bot, guild, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Use this command to calculate days and print out different formats for time.')
        .addFields(
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}today [commands] [selection/time range]`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}today get [year/month/date/day/hour/min/sec/milli/time/time zone offset]\n` +
                    `${guild.Prefix}today now [short/full]\n` +
                    `${guild.Prefix}today [UTC/ISO]\n` +
                    `${guild.Prefix}today [+, -] [1y/1M/1d/1h/1m/1s/1ms]`,
                inline: true
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}