//Include
const mysql = require('promise-mysql');
const Discord = require('discord.js');
const { create, all } = require('mathjs');
const maths = create(all, {
    number: 'BigNumber'
});

module.exports = (bot, message) => {
    //Ignore all bots
    if (message.author.bot) return;

    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot
        bot.con = connection;

        //Check that the message still exists
        if (message || message.guild || message.guild.id) {
            //Get servers
            const sql_cmd = `
            SELECT *
                FROM servers
                WHERE ServerId = "${message.guild.id}"
            `;
            bot.con.query(sql_cmd, (error, results, fields) => {
                if (error || !results || results.length < 1) throw error; //Return error console log and return

                //Check if message is empty
                if (message.content) {
                    //if else on message that starts with prefix
                    if (message.content.startsWith(results[0].Prefix)) {
                        //Argument/command name definition.
                        var args = message.content.substring(results[0].Prefix.length).split(' ');
                        var command = args.shift().toLowerCase();

                        //Switch case on command to allow for command synonyms
                        new Promise((resolve, reject) => {
                            switch (command) {
                                case 'activate':
                                    return resolve(bot.commands.get('activate'));
                                case 'deactivate':
                                    return resolve(bot.commands.get('deactivate'));
                                case 'help': case 'h':
                                    return resolve(bot.commands.get('help'));
                                case 'info': case 'i':
                                    return resolve(bot.commands.get('info'));
                                case 'ping': case 'pin':
                                    return resolve(bot.commands.get('ping'));
                                case 'inviteme': case 'invite': case 'inv': case 'in': case 'iv':
                                    return resolve(bot.commands.get('invite'));
                                case 'prefix': case 'pref': case 'pre': case 'pr':
                                    return resolve(bot.commands.get('prefix'));
                                case 'ban': case 'ba': case 'bn': case 'b':
                                    return resolve(bot.commands.get('ban'));
                                case 'clone': case 'clo':
                                    return resolve(bot.commands.get('clone'));
                                case 'harrass': case 'harass': case 'harr': case 'har': case 'ha':
                                    return resolve(bot.commands.get('harrass'));
                                case 'listen': case 'lis': case 'li':
                                    return resolve(bot.commands.get('listen'));
                                case 'leave': case 'lea': case 'le':
                                    return resolve(bot.commands.get('leave'));
                                case 'move': case 'mov': case 'mo':
                                    return resolve(bot.commands.get('move'));
                                case 'mute': case 'mu': case 'm':
                                    return resolve(bot.commands.get('mute'));
                                case 'unmute': case 'unmu': case 'unm': case 'um':
                                    return resolve(bot.commands.get('unmute'));
                                case 'muterole': case 'muter': case 'mr':
                                    return resolve(bot.commands.get('muterole'));
                                case 'today': case 'tod': case 'to': case 't':
                                    return resolve(bot.commands.get('today'));
                                case 'translate': case 'trans': case 'tran': case 'tra': case 'tr':
                                    return resolve(bot.commands.get('translate'));
                                case 'nick': case 'nic': case 'ni': case 'n':
                                    return resolve(bot.commands.get('nick'));
                                case 'reddit': case 'redd': case 'r':
                                    return resolve(bot.commands.get('reddit'));
                                case 'math': case 'mat': case 'ma':
                                    return resolve(bot.commands.get('math'));
                                case 'play': case 'p': case 'skip': case 's': case 'stop':
                                case 'pause': case 'resume': case 'nowplaying': case 'nowp':
                                case 'now': case 'np': case 'queue': case 'q':
                                case 'shuffle': case 'shuff': case 'shuf': case 'sh':
                                case 'movesong': case 'songmove':
                                case 'removesong': case 'songremove': case 'remove': case 'rem':
                                case 'loop': case 'lo': case 'l':
                                    return resolve(bot.commands.get('music'));
                                case 'clean': case 'c':
                                    return resolve(bot.commands.get('clean'));
                                case 'basedcounter': case 'based':
                                    return resolve(bot.commands.get('basedcounter'));
                                case 'akinator': case 'aki':
                                    return resolve(bot.commands.get('akinator'));
                                case 'scoreboard': case 'score': case 'board': case 'sb':
                                    return resolve(bot.commands.get('scoreboard'));
                                case 'conjecture': case 'collatz': case 'collats': case 'collat':
                                    return resolve(bot.commands.get('collatz'));
                                default:
                                    return reject();
                            }
                        }).then((cmd) => {
                            //If command doesn't exist, exit and do nothing
                            if (!cmd) return;
                            //Run the command
                            cmd.run(bot, results[0], message, command, args);
                            message.delete({ timeout: 200 }).catch(() => { return; }); //Delete message
                        }).catch((error) => {
                            //Return console error
                            return console.error(error || 'Unknown command');
                        });
                    } else if (evaluate(message.content) && !message.content.includes('true')) {
                        message.channel.send(new Discord.MessageEmbed().setDescription(`> ${message.member.toString()}: **${message.content}**\n = ${evaluate(message.content)}`.trimString(2048)).setColor('#0099ff'));
                    } else {
                        if (!bot.akinatorGames.get(message.member.id)) {
                            //Get the specific translatemessage command data from client.commands Enmap
                            const trans = bot.commands.get("translatemessage");
                            //If command doesn't exist, exit and do nothing
                            if (!trans) return;

                            //Run translation
                            trans.run(bot, results[0], message, args);

                            //Check if message is based
                            if (message.content.toLowerCase().includes("based")) {
                                //Get the specific basedcounter command data from client.commands Enmap
                                const based = bot.commands.get("basedcounter");
                                //If command doesn't exist, exit and do nothing
                                if (!based) return;

                                //Run based counter
                                based.run(bot, results[0], message, 'count', args);
                            }
                        }
                    }
                }
            });
        }

        //Release connection when done
        bot.con.release();
    }).catch((err) => {
        console.log(err, `Connection failed on message`);
    });
}

//Function evaluate the calculation
function evaluate(expr) {
    try {
        return `${maths.format(maths.evaluate(expr), { notation: 'fixed' })}`;
    } catch (err) {
        return '';
    }
}
