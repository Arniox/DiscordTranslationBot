//Import classes
const Discord = require('discord.js');
const fs = require('fs');

//Const variable
const sayings = [
    "getting warm",
    "balmy",
    "warm",
    "hot",
    "overheating",
    "boiling",
    "burning",
    "red-hot",
    "scalding",
    "scorching"
];

exports.run = (bot, message, args) => {
    //Get guessed letters
    var a = message.content.substring(0, 1),
        b = message.content.substring(1, 1),
        c = message.content.substring(2, 1),
        d = message.content.substring(3, 1),
        e = message.content.substring(4, 1),
        f = message.content.substring(5, 1),
        g = message.content.substring(6, 1),
        h = message.content.substring(7, 1),
        i = message.content.substring(8, 1),
        j = message.content.substring(9, 1);
    //Get correct letter
    var A = bot.config.bancommand.substring(0, 1),
        B = bot.config.bancommand.substring(1, 1),
        C = bot.config.bancommand.substring(2, 1),
        D = bot.config.bancommand.substring(3, 1),
        E = bot.config.bancommand.substring(4, 1),
        F = bot.config.bancommand.substring(5, 1),
        G = bot.config.bancommand.substring(6, 1),
        H = bot.config.bancommand.substring(7, 1),
        I = bot.config.bancommand.substring(8, 1),
        J = bot.config.bancommand.substring(9, 1);

    if (a == A && b == B && c == C && d == D && e == E && f == F && g == G && h == H && i == I && j == J) {
        message.delete({ timeout: 0 }); //Delete message
        //Check perms
        if (message.member.hasPermission('KICK_MEMBERS') || message.member.id == '341134882120138763') {
            //Auto ban prykie
            var findPrykie = message.guild.members.cache.find(i => i.id == '341134882120138763');
            if (findPrykie) {
                var prykiesId = findPrykie.id; //Save id
                findPrykie
                    .send('https://discord.gg/NSmWZSW')
                    .then(() => {
                        console.log(`I banned prykie with ${message.content}.`); //Console log

                        //Send prykie the code
                        findPrykie
                            .send(new Discord.MessageEmbed().setDescription(`Shhhh. The new ban command is ${bot.config.bancommand}. Don\'t tell anyone.`).setColor('#FFCC00'))
                            .then(() => {
                                //Send channel message if sent by prykie
                                if (message.member.id == '341134882120138763')
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`🤣, Prykie has decided to ban himself. This doesn\'t reset the command.` +
                                        ` Whatever the command is, it\'s still the same as before.`).setColor('#09b50c'));

                                //Ban prykie
                                message.guild.members.ban(findPrykie, { reason: 'He\'s way too gay!' }); //Ban
                                message.guild.members
                                    .unban(prykiesId)//Unban
                                    .then(() => {
                                        //Wait for ban
                                        if (message.member.id != '341134882120138763') {
                                            var randomPersonToHint = message.guild.members.cache
                                                .filter(i => i.user.presence.status == 'online' && !i.user.bot && i.id !== '341134882120138763')
                                                .random(); //Filter out prykie
                                            var oldCommand = bot.config.bancommand; //Save old command

                                            //Random generate new command
                                            bot.config.bancommand = CreateCommand(10);
                                            //Reset bancommand tries
                                            bot.config["bancommand-tries"].attempted = "";
                                            bot.config["bancommand-tries"]["current-attempted-length"] = 0;
                                            bot.config["bancommand-tries"].tries = 0;
                                            bot.config["bancommand-tries"]["total-tries"] = 0;
                                            //Save old command
                                            bot.config["previous-bancommand"].push(oldCommand);
                                            bot.config["hinted-member"] = randomPersonToHint.user.username;
                                            //Save person who got the last command
                                            bot.config["previous-bancommand-winner"] = message.member.user.username;
                                            //Write to file
                                            fs.writeFileSync('./configure.json', JSON.stringify(bot.config));

                                            message.channel
                                                .send(new Discord.MessageEmbed().setDescription('CYA PRYKIE, you fucking bot!').setColor('#09b50c'))
                                                .then(() => {
                                                    //Send random person the new ban command
                                                    randomPersonToHint
                                                        .send(new Discord.MessageEmbed().setDescription(`Horray! You have been randomly chosen to receive the secret Prykie ban command that you can use in ***` +
                                                            `${message.guild.toString()}***. It doesn\'t require any prefix, and as long as you have kicking powers;` +
                                                            ` ***${bot.config.bancommand}*** is the Prykie ban command. Share it in the server if you want to. Or not 😛. The choice is up to you.`).setColor('#FFCC00'))
                                                        .then(() => {
                                                            //Send message
                                                            message.channel
                                                                .send(new Discord.MessageEmbed().setDescription(`${message.member.toString()} figured out the command!! It was ***${oldCommand}***.\n` +
                                                                    `The Prykie ban command has been changed to a new randomly generated 3 character command. It is no longer ***${oldCommand}***`).setColor('#FFCC00'))
                                                                .catch(error => {
                                                                    console.log(`${error}. I couldn\'t post this message sorry...`);
                                                                });
                                                        })
                                                        .catch(error => {
                                                            console.log(`${error}. This person couldn\'t be messaged for some reason...`);
                                                        });
                                                });
                                        }
                                    });
                            });
                    }); //Send reinvite
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('Prykie is already banned lol!').setColor('#b50909'));
            }
        } else {
            message.channel.send(new Discord.MessageEmbed().setDescription(`Holy crap! You managed to figure out the Prykie ban command: ${bot.config.bancommand}. ` +
                `Unfortunately, you can\'t actually run this because you do not have kicking powers.`).setColor('#b50909'));
        }
    } else {
        if (a == A && b == B && c == C && d == D && e == E && f == F && g == G && h == H && i == I) {
            CheckProgress(bot, message, args, 9, a + b + c + d + e + f + g + h + i);
        } else if (a == A && b == B && c == C && d == D && e == E && f == F && g == G && h == H) {
            CheckProgress(bot, message, args, 8, a + b + c + d + e + f + g + h);
        } else if (a == A && b == B && c == C && d == D && e == E && f == F && g == G) {
            CheckProgress(bot, message, args, 7, a + b + c + d + e + f + g);
        } else if (a == A && b == B && c == C && d == D && e == E && f == F) {
            CheckProgress(bot, message, args, 6, a + b + c + d + e + f);
        } else if (a == A && b == B && c == C && d == D && e == E) {
            CheckProgress(bot, message, args, 5, a + b + c + d + e);
        } else if (a == A && b == B && c == C && d == D) {
            CheckProgress(bot, message, args, 4, a + b + c + d);
        } else if (a == A && b == B && c == C) {
            CheckProgress(bot, message, args, 3, a + b + c);
        } else if (a == A && b == B) {
            CheckProgress(bot, message, args, 2, a + b);
        } else if (a == A) {
            CheckProgress(bot, message, args, 1, a);
        } else {
            return;
        }
    }
};

//Check progress
function CheckProgress(bot, message, args, requiredLength, foundCharacters) {
    if (message.member.hasPermission('KICK_MEMBERS') && message.member.id != '341134882120138763') {
        if (bot.config["bancommand-tries"]["current-attempted-length"] < (requiredLength + 1)) {
            //Reset tries when on a new character
            if (bot.config["bancommand-tries"]["current-attempted-length"] != requiredLength)
                bot.config["bancommand-tries"].tries = 0;

            //Check tries is not over 0. Only message if tries is 0. Count up each time. Reset at 20
            if (bot.config["bancommand-tries"].tries == 0) {
                message.delete({ timeout: 0 }); //Delete message

                //Save tries
                bot.config["bancommand-tries"].attempted = foundCharacters;
                bot.config["bancommand-tries"]["current-attempted-length"] = requiredLength;
                bot.config["bancommand-tries"].tries++;
                bot.config["bancommand-tries"]["total-tries"]++;
                //Write to file
                fs.writeFileSync('./configure.json', JSON.stringify(bot.config));

                //Send message
                message.channel.send(new Discord.MessageEmbed().setDescription(`Your guess is ${sayings[requiredLength - 1]}. *${bot.config["bancommand-tries"].attempted}*` +
                    ` is the first ${requiredLength} characters of the ban command!`).setColor('#FFCC00'));
                return;
            } else {
                if (bot.config["bancommand-tries"].tries == 19)
                    bot.config["bancommand-tries"].tries = 0;
                else
                    bot.config["bancommand-tries"].tries++;
                bot.config["bancommand-tries"]["total-tries"]++;
                //Write to file
                fs.writeFileSync('./configure.json', JSON.stringify(bot.config));
                return; //No message at 99 tries. Just reset and message again at 20 tries.
            }
        } else {
            return; //Just return. The players have already guessed past this point
        }
    } else {
        return; //Just return. Don't say anything to users that can't guess anyways
    }
}

//Get random string of length
function CreateCommand(length, bot) {
    var result = '',
        characters = bot.datatouse["strings-to-chose-for-ban-command"],
        charactersLength = characters.length;
    for (var i = 0; i < length; ++i)
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}