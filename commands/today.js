const Discord = require('discord.js');

exports.run = (bot, message, args) => {
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
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Today's full year is: ${new Date().getFullYear()}.`).setColor('#09b50c'));
                            break;
                        case 'month': case 'months':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Today's month is the: ${Ordinal(new Date().getMonth() + 1)} month of the year.`).setColor('#09b50c'));
                            break;
                        case 'date':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Today's date is the: ${Ordinal(new Date().getMonth())}.`).setColor('#09b50c'));
                            break;
                        case 'day': case 'days':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Today is the : ${Ordinal(new Date().getDay() + 1)} day of the week.`).setColor('#09b50c'));
                            break;
                        case 'h': case 'hour': case 'hours':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`It is ${new Date().getHours().toString().padEnd(3, '0').padStart(4, '0')} hours.`).setColor('#09b50c'));
                            break;
                        case 'm': case 'min': case 'mins': case 'minute': case 'minutes':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`It is ${new Date().getMinutes().toString().padStart(4, '0')} minutes.`).setColor('#09b50c'));
                            break;
                        case 's': case 'sec': case 'secs': case 'second': case 'seconds':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`It is ${new Date().getSeconds()} seconds right now.`).setColor('#09b50c'));
                            break;
                        case 'mill': case 'milli': case 'millisecond': case 'milliseconds':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`It is ${new Date().getMilliseconds()} milliseconds right now.`).setColor('#09b50c'));
                            break;
                        case 'time':
                            message.channel.send(
                                new Discord.MessageEmbed()
                                    .setDescription(`The time in milliseconds is ${new Date().getTime()}.`)
                                    .addField('Fact: ', 'This value in programming is the number of milliseconds after the incredably specific date of Jan 1, 1970, 00:00:00.000 GMT').setColor('#09b50c'));
                            break;
                        case 'timezoneoffset': case 'timezoneoff': case 'timezone': case 'zone':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Your timezone offset is ${new Date().getTimezoneOffset()}`).setColor('#09b50c'));
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
                        message.channel.send(new Discord.MessageEmbed().setDescription(`The local date & time right now is: ${new Date().toDateString()}`).setColor('#09b50c'));
                        break;
                    case 'long':
                        message.channel.send(new Discord.MessageEmbed().setDescription(`The local date & time right now is: ${new Date().toString()}`).setColor('#09b50c'));
                        break;
                    default:
                        message.channel.send(new Discord.MessageEmbed().setDescription(`The local date & time right now is: ${new Date().toString()}`).setColor('#09b50c'));
                        break;
                }
                break;
            case 'utc':
                message.channel.send(new Discord.MessageEmbed().setDescription(`The date & time GMT 00 is: ${new Date().toUTCString()}`).setColor('#09b50c'));
                break;
            case 'iso':
                message.channel.send(new Discord.MessageEmbed().setDescription(`The ISO date & time is: ${new Date().toISOString()}`).setColor('#09b50c'));
                break;
            default:
                //Get the user selected math method
                var mathmethod = args.map(i => i.trim()).shift();
                if (args.length != 0) {
                    //get the left over strings
                    var strings = args.join('').split('');
                    if (strings.length > 2) {
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
                                switch (mathmethod) {
                                    case '+':
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Today (${now.toDateString()}) + ${number} ${usefulDigits[digitRange]["name"]}(s) is: ${new Date(now.getTime() + usefulDigits[digitRange]["value"]).toString()}`));
                                        break;
                                    case '-':
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Today (${now.toDateString()}) - ${number} ${usefulDigits[digitRange]["name"]}(s) is: ${new Date(now.getTime() - usefulDigits[digitRange]["value"]).toString()}`));
                                        break;
                                    case '*':
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Today (${now.toDateString()}) * ${number} ${usefulDigits[digitRange]["name"]}(s) is: ${new Date(now.getTime() * usefulDigits[digitRange]["value"]).toString()}`));
                                        break;
                                    case '/':
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Today (${now.toDateString()}) / ${number} ${usefulDigits[digitRange]["name"]}(s) is: ${new Date(now.getTime() / usefulDigits[digitRange]["value"]).toString()}`));
                                        break;
                                    default:
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, the mathematical method you selected is not possible right now.`).setColor('#b50909'));
                                        break;
                                }
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Sorry, ${digitRange} was not a date type I understood. You can apply years (y), months (M), days (d), hours (h), minutes (m), seconds (s), and milliseconds (ms)`).setColor('#b50909'));
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
        HelpMessage(bot, message, args);
    }
}

function HelpMessage(bot, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Use this command to calculate days and print out different formats for time.')
        .addFields(
            {
                name: 'Command Patterns: ',
                value: `${bot.config.prefix} today[commands]`
            },
            {
                name: 'Examples: ',
                value: `${bot.config.prefix} today`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}

//Ordinal
function Ordinal(number) {
    var ones = number % 10;
    var tens = (number / 10).floor() % 10;
    var stuff = "";

    if (tens == 1) {
        stuff = "th";
    } else {
        switch (ones) {
            case 1:
                stuff = "st";
                break;
            case 2:
                stuff = "nd";
                break;
            case 3:
                stuff = "rd";
                break;
            default:
                stuff = "th";
        }
    }

    return number.toString() + stuff;
}