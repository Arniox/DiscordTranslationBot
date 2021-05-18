//Include
const mysql = require('promise-mysql');
const JobManager = require('../classes/jobs.js');

module.exports = (bot) => {
    //Create main jobs manager
    const mainJobsManager = new JobManager();
    //Attach to ID of 'main'
    bot.jobsManager.set('main', mainJobsManager);

    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot
        bot.con = connection;
        //Get redditpost command
        const redditcmd = bot.commands.get("redditpost");

        //Check all guilds
        const sql_cmd = `SELECT * FROM servers`;
        bot.con.query(sql_cmd, (error, results, fields) => {
            if (error) throw error; //Return error console log and continue

            //Check all guilds
            bot.guilds.cache.map((value, key) => {
                //Create job manager per server
                const newJobManager = new JobManager();
                //Attach job manager to guild
                bot.jobsManager.set(key, newJobManager);

                //If command doesn't exist, do nothing
                if (redditcmd) {
                    //Create job for every 30m
                    bot.jobsManager.get(key).CreateJob('30m', () => {
                        redditcmd.run(bot, key);
                    }, 'Reddit Post');
                }

                //If this guild isn't in database, then add
                if (!results.map(v => v.ServerId).includes(key)) {
                    //Create default server controller
                    const server_controller_cmd = `
                    INSERT INTO servers (ServerId, ServerName, Prefix, Active)
                        VALUES("${key}", "${value.name}", "$", 1)
                    `;
                    //Insert new server details
                    bot.con.query(server_controller_cmd, (error, results, fields) => {
                        if (error) return console.error(error); //Throw error and return
                    });
                }

                //Set
                const activate_cmd = `
                UPDATE servers
                SET Active = 1
                WHERE ServerId = "${key}"
                `;
                //Update server
                bot.con.query(activate_cmd, (error, results, fields) => {
                    if (error) throw error; //Throw error and return
                });
            });
        });

        //Check all based counters
        const sql2_cmd = `SELECT * FROM based_counter`;
        bot.con.query(sql2_cmd, (error, results, fields) => {
            if (error) throw error; //Return error console log and continue

            //Check all guilds
            bot.guilds.cache.map((value, key) => {
                //If this guild isn't in database, then add
                if (!results.map(v => v.ServerId).includes(key)) {
                    //Create default based counter
                    const based_counter_cmd = `
                    INSERT INTO based_counter (ServerId)
                        VALUES("${key}")
                    `;
                    //Insert new based counter
                    bot.con.query(based_counter_cmd, (error, results, fields) => {
                        if (error) return console.error(error); //Throw error and return
                    });
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
    console.log(`Ready to serve in ${bot.channels.cache.size}` +
        ` channels on ${bot.guilds.cache.size}` +
        ` servers, for a total of ${bot.users.cache.size} users.`);
    //Generate invite link
    bot.generateInvite({
        permissions: ['ADMINISTRATOR', 'SEND_MESSAGES', 'MANAGE_GUILD', 'MENTION_EVERYONE']
    }).then((link) => {
        console.log(`Generated bot invite link: ${link}`);
    });

    //Set global bot activity
    bot.user.setActivity(`the $ prefix`, { type: 'WATCHING' });

    //Ping bot
    bot.jobsManager.get('main').CreateJob('30m', () => {
        console.log('I am currently alive.');
    }, 'Ping Server');
};