module.exports = (bot) => {
    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot
        bot.con = connection;

        //Check all guilds
        const sql_cmd = `SELECT ServerId FROM servers`;
        bot.con.query(sql_cmd, (error, results, fields) => {
            if (error) return console.error(error); //Return error console log and continue

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
                }
            });

            //Release connection when done
            bot.con.release();
            //Clear bot.con to nothing
            bot.con = null;
            //Handle error once released
            if (error) throw error;
        });
    }).catch((err) => {
        console.log(err, `Connection failed on ready`);
    });

    //log
    console.log('Connected!');
    console.log(`Logged in as ${bot.user.username} - (${bot.user.id})`);
    console.log(`Ready to serve in ${bot.channels.cache.size} channels on ${bot.guilds.cache.size} servers, for a total of ${bot.users.cache.size} users.`);
    //Generate invite link
    bot.generateInvite(['ADMINISTRATOR', 'SEND_MESSAGES', 'MANAGE_GUILD', 'MENTION_EVERYONE'])
        .then((link) => {
            console.log(`Generated bot invite link: ${link}`);
        });

    //Get print schedules command
    const cmd = bot.commands.get("PrintSchedules");
    //If command doesn't exist, exit and do nothing

    if (cmd) {
        //Function variables / Globals
        const hours = 24, interval = hours * 60 * 60 * 1000;
        setInterval(function () {
            //check if sunday
            var now = new Date();
            if (now.getDay() == 6) {
                //Run command
                cmd.run(bot, now);
            } else {
                //Log
                console.log(`Another day, another dollar. Today is ${now.toString()}`);
            }
        }, interval);
    }
};