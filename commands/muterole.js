//Import
const Discord = require('discord.js');

exports.run = (bot, guild, message, args) => {
    if (args.length != 0) {
        var roles = message.mentions.roles;
        var direction = args.shift().toLowerCase();

        //Check which direction you want the role to go
        switch (direction) {
            case 'add': case 'a': case '+':
                if (message.member.hasPermission('MUTE_MEMBERS')) {
                    if (roles.size != 0) {
                        if (roles.size < 2) {
                            //Look for existing role
                            const sql_cmd = `
                            SELECT * FROM ignored_muteroles
                                WHERE ServerId = "${message.guild.id}"
                            `;
                            bot.con.query(sql_cmd, (error, results, fields) => {
                                if (error) return console.error(error); //Return error console log and return

                                //Add role
                                if (!results.map(v => v.RoleId).includes(roles.first().id)) {
                                    //Create new entry in the database
                                    const create_cmd = `
                                    INSERT INTO ignored_muteroles (RoleId, ServerId)
                                        VALUES ("${roles.first().id}", "${message.guild.id}")
                                    `;
                                    bot.con.query(create_cmd, (error, results, fields) => {
                                        if (error) return console.error(error); //Throw error and return
                                        //Send message
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Added: ${roles.first().toString()} to mute ignored roles`).setColor('#09b50c'));
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`${roles.first().toString()} is *already* a mute ignored role.`).setColor('#b50909'));
                                }
                            });
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you can only add one mute ignored role at a time.').setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('I did not detect any roles to add/remove...').setColor('#b50909'));
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot add or remove mute ignored roles. You need to be a server manager/admin to use these commands.').setColor('#b50909'));
                }
                break;
            case 'remove': case 'r': case '-':
                if (message.member.hasPermission('MUTE_MEMBERS')) {
                    if (roles.size != 0) {
                        if (roles.size < 2) {
                            //Look for existing role
                            const sql_cmd = `
                            SELECT * FROM ignored_muteroles
                                WHERE ServerId = "${message.guild.id}"
                            `;
                            bot.con.query(sql_cmd, (error, results, fields) => {
                                if (error) return console.error(error); //Return error console log and return

                                //Remove role
                                if (results.map(v => v.RoleId).includes(roles.first().id)) {
                                    //Remove entry in the database
                                    const delete_cmd = `
                                    DELETE FROM ignored_muteroles
                                        WHERE RoleId = "${roles.first().id}"
                                        AND ServerId = "${message.guild.id}"
                                    `;
                                    bot.con.query(delete_cmd, (error, results, fields) => {
                                        if (error) return console.error(error); //Throw error and return
                                        //send message
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Deleted: ${roles.first().toString()} from mute ignored roles`).setColor('#09b50c'));
                                    });
                                } else {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`${roles.first().toString()} is *not* a mute ignored role so cannot be removed.`).setColor('#b50909'));
                                }
                            });
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you can only remove one mute ignored role at a time.').setColor('#b50909'));
                        }
                    } else {
                        if (args.length != 0) {
                            var isAll = args.shift().toLowerCase();

                            //Check if the user wants to remove all roles
                            switch (isAll) {
                                case 'all': case 'a':
                                    //Remove all roles
                                    const delete_all_cmd = `
                                    DELETE FROM ignored_muteroles
                                        WHERE ServerId = "${message.guild.id}"
                                    `;
                                    bot.con.query(delete_all_cmd, (error, results, fields) => {
                                        if (error) return console.error(error); //Throw error and return
                                        //send message
                                        message.channel.send(new Discord.MessageEmbed().setDescription(`Removed all; ${results.length}; roles from mute ignored roles`).setColor('#09b50c'));
                                    });
                                    break
                                default:
                                    message.channel.send(new Discord.MessageEmbed().setDescription('I\'m afraid I don\'t understand the command...').setColor('#b50909'));
                                    break;
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('I did not detect a roles to add/remove...').setColor('#b50909'));
                        }
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Sorry, you cannot add or remove mute ignored roles. You need to be a server manager/admin to use these commands.').setColor('#b50909'));
                }
                break;
            case 'lists': case 'list': case 'l':
                var output = "";
                //Get a list of all roles in this server
                const sql_cmd = `
                SELECT * FROM ignored_muteroles
                    WHERE ServerId = "${message.guild.id}"
                `;
                bot.con.query(sql_cmd, (error, results, fields) => {
                    if (error) return console.error(error); //Throw error and return

                    //For each role found
                    results.forEach(e => {
                        output += message.guild.roles.cache.find(i => i.id == e.RoleId).toString() + '\n';
                    });
                    message.channel.send(new Discord.MessageEmbed().setDescription(`***${results.length} mute ignored roles.***\n\n${output}`).setColor('#0099ff'));
                });
                break;
            default:
                HelpMessage(bot, guild, message, args);
                break;
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
};

function HelpMessage(bot, guild, message, args) {
    var randomRole = message.guild.roles.cache.random().toString();

    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('The muterole command allows you to add, list, or remove mute ignored roles to the server database.')
        .addFields(
            { name: 'Required Permissions: ', value: 'Mute Members' },
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
}