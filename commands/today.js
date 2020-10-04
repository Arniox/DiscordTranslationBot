const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        var command = args.shift().toLowerCase();

        //Switch on today command
        switch (command) {
            case 'get':
                if (args.length != 0) {
                    //Get the user selected range
                    var range = args.map(i => i.toLowerCase()).join('');
                    switch (range) {
                        case 'y': case 'year': case 'years':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Today's full year is: ${ToTimeZone('Australia/Sydney', new Date()).getFullYear()}.`).setColor('#09b50c'));
                            break;
                        case 'month': case 'months':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Today's month is the: ${(ToTimeZone('Australia/Sydney', new Date()).getMonth() + 1).ordinal()} month of the year.`).setColor('#09b50c'));
                            break;
                        case 'date':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Today's date is the: ${(ToTimeZone('Australia/Sydney', new Date()).getDate()).ordinal()}.`).setColor('#09b50c'));
                            break;
                        case 'day': case 'days':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Today is the : ${(ToTimeZone('Australia/Sydney', new Date()).getDay() + 1).ordinal()} day of the week.`).setColor('#09b50c'));
                            break;
                        case 'h': case 'hour': case 'hours':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`It is ${ToTimeZone('Australia/Sydney', new Date()).getHours().toString().padEnd(3, '0').padStart(4, '0')} hours.`).setColor('#09b50c'));
                            break;
                        case 'm': case 'min': case 'mins': case 'minute': case 'minutes':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`It is ${ToTimeZone('Australia/Sydney', new Date()).getMinutes().toString().padStart(4, '0')} minutes.`).setColor('#09b50c'));
                            break;
                        case 's': case 'sec': case 'secs': case 'second': case 'seconds':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`It is ${ToTimeZone('Australia/Sydney', new Date()).getSeconds()} seconds right now.`).setColor('#09b50c'));
                            break;
                        case 'mill': case 'milli': case 'millisecond': case 'milliseconds':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`It is ${ToTimeZone('Australia/Sydney', new Date()).getMilliseconds()} milliseconds right now.`).setColor('#09b50c'));
                            break;
                        case 'time':
                            message.channel.send(
                                new Discord.MessageEmbed()
                                    .setDescription(`The time in milliseconds is ${ToTimeZone('Australia/Sydney', new Date()).getTime()}.`)
                                    .addField('Fact: ', 'This value in programming is the number of milliseconds after the incredably specific date of Jan 1, 1970, 00:00:00.000 GMT').setColor('#09b50c'));
                            break;
                        case 'timezoneoffset': case 'timezoneoff': case 'timezone': case 'zone':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Your timezone offset is ${ToTimeZone('Australia/Sydney', new Date()).getTimezoneOffset()} `).setColor('#09b50c'));
                            break;
                        default:
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you need to select something to get from today's date.`).setColor('#b50909'));
                            break;
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you need to select something to get from today's date.`).setColor('#b50909'));
                }
                break;
            case 'now':
                //Get the user selected range
                var range = args.map(i => i.toLowerCase()).join('');
                switch (range) {
                    case 'short':
                        message.channel.send(new Discord.MessageEmbed().setDescription(`The local date & time right now is: ${ToTimeZone('Australia/Sydney', new Date()).toDateString()}`).setColor('#09b50c'));
                        break;
                    case 'long':
                        message.channel.send(new Discord.MessageEmbed().setDescription(`The local date & time right now is: ${ToTimeZone('Australia/Sydney', new Date()).toString()}`).setColor('#09b50c'));
                        break;
                    default:
                        message.channel.send(new Discord.MessageEmbed().setDescription(`The local date & time right now is: ${ToTimeZone('Australia/Sydney', new Date()).toString()}`).setColor('#09b50c'));
                        break;
                }
                break;
            case 'utc':
                message.channel.send(new Discord.MessageEmbed().setDescription(`The date & time GMT 00 is: ${ToTimeZone('Australia/Sydney', new Date()).toUTCString()}`).setColor('#09b50c'));
                break;
            case 'iso':
                message.channel.send(new Discord.MessageEmbed().setDescription(`The ISO date & time is: ${ToTimeZone('Australia/Sydney', new Date()).toISOString()}`).setColor('#09b50c'));
                break;
            default:
                if (args.length != 0) {
                    //get the left over strings
                    var strings = args.shift().match(/[a-z]+|[^a-z]+/gi);
                    if (strings.length >= 2) {
                        //get the number
                        var number = strings.shift();
                        if (/^\d+$/.test(number)) {
                            //get digit range
                            var digitRange = strings.shift();

                            //Create key value list
                            var usefulDigits = {
                                'y': { 'name': 'year', 'value': 31556952000 },
                                'M': { 'name': 'month', 'value': 2592000000 },
                                'd': { 'name': 'day', 'value': 86400000 },
                                'h': { 'name': 'hour', 'value': 3600000 },
                                'm': { 'name': 'minute', 'value': 60000 },
                                's': { 'name': 'second', 'value': 1000 },
                                'ms': { 'name': 'millisecond', 'value': 1 }
                            };

                            //Get today
                            var now = new Date();

                            if (digitRange in usefulDigits) {
                                //Switch on the mathematical method
                                switch (command) {
                                    case '+':
                                        message.channel.send(
                                            new Discord.MessageEmbed()
                                                .setDescription(`Today (${now.toDateString()})\n+${number} ${usefulDigits[digitRange]["name"]}(s) is: \n${new Date(now.getTime() + (usefulDigits[digitRange]["value"] * parseInt(number))).toString()}`)
                                                .setColor('#09b50c'));
                                        break;
                                    case '-':
                                        message.channel.send(
                                            new Discord.MessageEmbed()
                                                .setDescription(`Today (${now.toDateString()})\n-${number} ${usefulDigits[digitRange]["name"]}(s) is: \n${new Date(now.getTime() - (usefulDigits[digitRange]["value"] * parseInt(number))).toString()}`)
                                                .setColor('#09b50c'));
                                        break;
                                    default:
                                        message.channel.send(
                                            new Discord.MessageEmbed()
                                                .setDescription(`Sorry, the mathematical method you selected is not possible right now.`).setColor('#b50909'));
                                        break;
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${digitRange} was not a date type I understood.\n` +
                                    `You can apply years (y), months (M), days (d), hours (h), minutes (m), seconds (s), and milliseconds (ms)`).setColor('#b50909'));
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${number} was not a number I understood.`).setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, I did not understand the time range you wanted.`).setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, you need to select a time range to apply to today's date.`).setColor('#b50909'));
                }
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

function ToTimeZone(timeZone, date) {
    return DateWithTimeZone(
        timeZone,
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    );
}

//Get time with timezone
function DateWithTimeZone(timeZone, year, month, day, hour, minute, second) {
    let date = new Date(Date.UTC(year, month, day, hour, minute, second));

    let utcDate = new Date(date.toLocaleDateString('en-US', { timeZone: "UTC" }));
    let tzDate = new Date(date.toLocaleDateString('en-US', { timeZone: timeZone }));
    let offset = utcDate.getTime() - tzDate.getTime();

    date.setTime(date.getTime() + offset);

    return date;
}