//Include
const mysql = require('promise-mysql');

module.exports = (bot) => {
    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot
        bot.con = connection;

        //Check all guilds
        const sql_cmd = `SELECT * FROM servers`;
        bot.con.query(sql_cmd, (error, results, fields) => {
            if (error) throw error; //Return error console log and continue

            //Check all guilds
            bot.guilds.cache.map((value, key) => {
                //If this guild isn;t in database, then add
                if (!results.map(v => v.ServerId).includes(key)) {
                    //Create default server controller
                    const server_controller_cmd = `
                    INSERT INTO servers (ServerId, ServerName, Prefix)
                        VALUES("${key}", "${value.name}", "$")
                    `;
                    //Insert new server details
                    bot.con.query(server_controller_cmd, (error, results, fields) => {
                        if (error) return console.error(error); //Throw error and return
                    });
                } else {
                    //Set the bot user activity for this specific server
                    value.me.user.setActivity(`the ${results.find(i => i.ServerId == key).Prefix} prefix`, { type: 'WATCHING' });
                }
            });
        });

        //Release connection when done
        bot.con.release();
    }).catch((err) => {
        console.log(err, `Connection failed on ready`);
    });

    //log
    console.log('Bot Connected!');
    console.log(`Logged in as ${bot.user.username} - (${bot.user.id})`);
    console.log(`Ready to serve in ${bot.channels.cache.size} channels on ${bot.guilds.cache.size} servers, for a total of ${bot.users.cache.size} users.`);
    //Generate invite link
    bot.generateInvite(['ADMINISTRATOR', 'SEND_MESSAGES', 'MANAGE_GUILD', 'MENTION_EVERYONE'])
        .then((link) => {
            console.log(`Generated bot invite link: ${link}`);
        });

    //Set global bot activity
    bot.user.setActivity(`the $ prefix`, { type: 'WATCHING' });

    //Get redditpost command
    const redditcmd = bot.commands.get("redditpost");
    //If command doesn't exist, exit and do nothing
    if (redditcmd) {
        //Function variables / Globals
        const minutes = 30, interval = minutes * 60 * 1000;
        setInterval(function () {
            //Post
            redditcmd.run(bot);
        }, interval);
    }

    //Get print schedules command
    const printcmd = bot.commands.get("printschedules");
    //If command doesn't exist, exit and do nothing
    if (printcmd) {
        //Function variables / Globals
        const hours = 24, interval = hours * 60 * 60 * 1000;
        setInterval(function () {
            //check if sunday
            var now = new Date();
            if (now.getDay() == 6) {
                //Run command
                printcmd.run(bot);
            } else {
                //Log
                console.log(`Another day, another dollar. Today is ${now.toString()}`);
            }
        }, interval);
    }
};