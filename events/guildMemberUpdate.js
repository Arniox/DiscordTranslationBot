//Import
const mysql = require('promise-mysql');

module.exports = (bot, oldMember, newMember) => {
    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot
        bot.con = connection;

        //Check if guild member is nickname frozen
        const sql_cmd = `
        SELECT * FROM player_frozen_names
            WHERE ServerId = "${newMember.guild.id}"
            AND MemberId = "${newMember.id}"
        `;
        bot.con.query(sql_cmd, (error, results, fields) => {
            if (error) throw error; //Return error and return
            else if (results && results.length) {
                //Get current person
                var thisFrozenPlayer = results.find(i => i.MemberId == newMember.id);
                var frozenByMember = newMember.guild.members.cache.get(thisFrozenPlayer.FrozenById);

                //Check if the nicknames have been changed
                if (NickName(oldMember) != NickName(newMember) && NickName(newMember) != thisFrozenPlayer.FrozenName) {

                    //Set nickname back to frozen one
                    newMember.setNickname(thisFrozenPlayer.FrozenName, `${newMember.user.username} tried to change his nickname but their nickname is frozen as ${thisFrozenPlayer.FrozenName}`)
                        .catch(() => {
                            //Remove from database and return an error. 
                            //This is probably a frozen member that became a mod
                            const unsave_sql = `
                            DELETE FROM player_frozen_names
                                WHERE Id = "${thisFrozenPlayer.Id}"
                                AND ServerId = "${thisFrozenPlayer.ServerId}"
                            `;
                            bot.con.query(unsave_sql, (error, results, fields) => {
                                if (error) throw error; //Return error and return
                            });
                            return;
                        });

                    //Send message to frozen member
                    newMember.send(`Sorry ***${newMember.user.username}***, your nickname has been frozen by ***${frozenByMember.user.username}*** and cannot be changed until unfrozen.`)
                    //Send message to freezer
                    frozenByMember.send(`***${newMember.user.username}***; who you nickname froze as ***${thisFrozenPlayer.FrozenName}***; tried to change his nickname but his actions where reversed.`);
                } else return; //Just do nothing if username was not changed 
            } else return; //Just do nothing if member is not frozen
        });

        //Release connection when done
        bot.con.release();
    }).catch((err) => {
        console.log(err, `Connection failed on guildMemberUpdate`);
    });
}

//Get nickname / name of member
function NickName(member) {
    return (member.nickname ? member.nickname : member.user.username);
}