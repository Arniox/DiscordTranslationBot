//Requirements
const Discord = require('discord.js');
const moment = require('moment-timezone');

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        var command = args.shift().toLowerCase();
        //Get now
        var now = moment().tz(guild.Time_Zone_Offset);

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
            case 'timezones': case 'timezone': case 'zone': case 'z':
                //For timezone
                if (args.length > 0) {
                    var command = args.shift().toLowerCase();

                    //Check which command you want
                    switch (command) {
                        case 'change': case 'ch': case '=':
                            //Check if user has perms
                            if (message.member.hasPermission('MANAGE_GUILD')) {
                                //Get all timezones
                                var allTimeZones = moment.tz.names();
                                //Map
                                var allCountries = allTimeZones.map(v => v.match(/^([^\/])+/g).join('')).unique()
                                    .removeThese(['CET', 'CST6CDT', 'EET', 'EST', 'EST5EDT', 'Etc', 'GB', 'GB-Eire', 'GMT', 'GMT+0', 'GMT-0', 'GMT0', 'HST',
                                        'MET', 'MST', 'MST7MDT', 'NZ', 'NZ-CHAT', 'PRC', 'PST8PDT', 'ROC', 'ROK', 'UCT', 'US', 'UTC', 'W-SU', 'WET']);

                                //Send message
                                message.channel
                                    .send(new Discord.MessageEmbed().setDescription(`What country is your new timezone?\n${allCountries.join('\n')}`).setColor('#FFCC00'))
                                    .then((sent) => {
                                        //Message filter and collector
                                        const countryFilter = m => m.member.id == message.member.id && m.content;
                                        const countryCollector = sent.channel.createMessageCollector(countryFilter, { time: 20000 });

                                        //Await message collector on collect
                                        countryCollector.on('collect', m => {
                                            m.delete({ timeout: 100 }); //Delete message

                                            //Check if that country exists
                                            if (allCountries.map(i => i.toLowerCase()).includes(m.content.toLowerCase())) {
                                                //Countries timezones
                                                var countryTimeZones = allTimeZones.filter(i => i.toLowerCase().startsWith(m.content.toLowerCase())).map(v => v.match(/([^\/])+$/g)).unique();

                                                //Check if this country only has one option
                                                if (countryTimeZones.length > 1) {
                                                    //Send new message
                                                    sent.edit(new Discord.MessageEmbed().setDescription(`What specific timezone from ${m.content} do you want to select?\n${countryTimeZones.join('\n')}`).setColor('#FFCC00'))
                                                        .then((sent) => {
                                                            //Message filter and collector
                                                            const cityFilter = m => m.member.id == message.member.id && m.content;
                                                            const cityCollector = sent.channel.createMessageCollector(cityFilter, { time: 20000 });

                                                            //Await message collector on collect
                                                            cityCollector.on('collect', m2 => {
                                                                m2.delete({ timeout: 100 }); //Delete message

                                                                //Check if that city exists
                                                                if (countryTimeZones.map(i => i.toLowerCase()).includes(m2.content.toLowerCase())) {
                                                                    //Cityies timezones
                                                                    var cityTimeZone = countryTimeZones.find(i => i.toLowerCase() == m2.content.toLowerCase());

                                                                    //Update server database
                                                                    //Update new setting
                                                                    const update_cmd = `
                                                                    UPDATE servers
                                                                    SET Time_Zone_Offset = "${allTimeZones.find(i => i.toLowerCase().startsWith(m.content.toLowerCase()) && i.toLowerCase().endsWith(m2.content.toLowerCase()))}"
                                                                    WHERE ServerId = "${message.guild.id}"
                                                                    `;
                                                                    bot.con.query(update_cmd, (error, results, fields) => {
                                                                        if (error) return console.error(error); //Throw error and return
                                                                        //Message
                                                                        sent.edit(new Discord.MessageEmbed().setDescription(`Updated server timezone from ${guild.Time_Zone_Offset} to ${m.content}/${cityTimeZone}`).setColor('#09b50c'));
                                                                    });
                                                                } else {
                                                                    //Send error message
                                                                    message.channel
                                                                        .send(new Discord.MessageEmbed().setDescription(`Sorry, ${m.content} is not a city I recognize! Please type the city again.`).setColor('#b50909'))
                                                                        .then((sent) => {
                                                                            sent.delete({ timeout: 5000 });
                                                                        });
                                                                    //Empty the collector and reset the timer
                                                                    cityCollector.empty();
                                                                    cityCollector.resetTimer();
                                                                }
                                                            });
                                                            //Await message collector on end
                                                            cityCollector.on('end', m => {
                                                                //Do not save
                                                                if (m.size == 0)
                                                                    sent.edit(new Discord.MessageEmbed().setDescription(`No city was selected within 20s. Try again next time.`).setColor('#b50909'));
                                                            });
                                                        });
                                                } else {
                                                    //Update server database

                                                    //Update new setting
                                                    const update_cmd = `
                                                    UPDATE servers
                                                    SET Time_Zone_Offset = "${allTimeZones.find(i => i.toLowerCase().startsWith(m.content.toLowerCase()))}"
                                                    WHERE ServerId = "${message.guild.id}"
                                                    `;
                                                    bot.con.query(update_cmd, (error, results, fields) => {
                                                        if (error) return console.error(error); //Throw error and return
                                                        //Message
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`Updated server timezone from ${guild.Time_Zone_Offset} to ${countryTimeZones[0]}`).setColor('#09b50c'));
                                                    });
                                                }
                                            } else {
                                                //Send error message
                                                message.channel
                                                    .send(new Discord.MessageEmbed().setDescription(`Sorry, ${m.content} is not a country I recognize! Please type the country again.`).setColor('#b50909'))
                                                    .then((sent) => {
                                                        sent.delete({ timeout: 5000 });
                                                    });
                                                //Empty the collector and reset the timer
                                                countryCollector.empty();
                                                countryCollector.resetTimer();
                                            }
                                        });
                                        //Await message collector on end
                                        countryCollector.on('end', m => {
                                            //Do not go to next
                                            if (m.size == 0)
                                                sent.edit(new Discord.MessageEmbed().setDescription('No country was selected within 20s. Try again next time.').setColor('#b50909'));
                                        });
                                    });


                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you need to have server manager permissions to change the server timezone.').setColor('#b50909'));
                            }
                            break;
                        case 'current': case 'curr': case 'cur': case 'c':
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Current Time Zone is: **${now.format('zz | ZZ')}**`).setColor('#09b50c'));
                            break;
                        default:
                            HelpMessage(bot, guild, message, args);
                            break;
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Current Time Zone is: **${now.format('zz | ZZ')}**`).setColor('#09b50c'));
                }
                break;
            //Calculate time
            case 'calculate': case 'calc': case 'c':
                //Get the left over strings
                var strings = args.join('').match(/[+-][\d]+[a-z]{1,2}/gi);
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
                value: `${guild.Prefix}today [commands] [selection/time range]\n` +
                    `*For the commands and selection/time range's you can use most of the obvious abbreviations (year = y and etc)*`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}today [era/year/quarter/month/week/day/hour/minute/second/millisecond]\n` +
                    `${guild.Prefix}today [now:n] :?[short/full]\n` +
                    `${guild.Prefix}today [time:t]\n` +
                    `${guild.Prefix}today [timezones:timezone:zone:z]\n` +
                    `${guild.Prefix}today [calculate:calc:c] [[+, -]1y/1M/1d/1h/1m/1s/1ms]\n\n`,
                inline: true
            },
            {
                name: 'Calculation Example: ',
                value: `The *today calculation* command can stack multiple different time ranges and supports duplicate time ranges ` +
                    `such as adding 5 years, and then also subtracting 6 years\n**${guild.Prefix}today calc +12y +80M +6d +100000ms -6y -60h +5h**`
            }
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}