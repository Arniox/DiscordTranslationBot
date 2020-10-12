//Import
const Discord = require('discord.js');
const moment = require('moment-timezone');

exports.run = (bot) => {
    //Get connection
    bot.dbpool.then((p) => {
        return p.getConnection();
    }).then((connection) => {
        //Attach connection to bot
        bot.con = connection;

        //Get all subscribed subreddits
        const sql_cmd = `SELECT * FROM server_subbed_reddits`;
        bot.con.query(sql_cmd, (error, results, fields) => {
            if (error) return console.error(error); //Return error console log and continue

            //For each server
            bot.guilds.cache.map((value, key) => {
                //Grab all the subscribed subreddits for this server
                var thisServer = results.filter(i => i.ServerId == key);

                //For each subscription
                thisServer.forEach((sub) => {
                    (sub.Last_After ?
                        bot.reddit.get(`/r/${sub.SubName}/new`, {
                            after: sub.Last_After
                        }) : bot.reddit.get(`/r/${sub.SubName}/new`))
                        .then((res) => {
                            //Last after save
                            const save_cmd = `
                            UPDATE server_subbed_reddits
                            SET Last_After = "${res.data.after}"
                            WHERE ServerId = "${sub.ServerId}"
                            AND Id = "${sub.Id}"
                            `;
                            bot.con.query(save_cmd, (error, results, fields) => {
                                if (error) return console.error(error); //Throw error and return
                            });

                            //Found posts from this sub reddit
                            //Get variables to use
                            var channelToPostTo = bot.guilds.cache.get(sub.ServerId).channels.cache.get(sub.ChannelId);
                            var flairFilter = sub.Flair_Filter;
                            //Filter the posts
                            var filteredRes = (flairFilter ? res.data.children.filter(i => i.data.link_flair_text == flairFilter) : res.data.children);

                            redditPost(channelToPostTo, sub.SubImage, filteredRes, 0)
                                .then(() => {
                                    console.log('done');
                                });
                        }).catch((err) => {
                            throw err; //Throw error
                        });
                });
            });
        });

        //Release connection when done
        bot.con.release();
    }).catch((err) => {
        console.log(err, `Connection failed on redditpost`);
    });
}

//Function post
function redditPost(channel, subImage, posts, i) {
    if (posts.length != 0) {
        //Get post variables
        var kind = posts[i].kind;
        var subReddit = posts[i].data.subreddit_name_prefixed;
        var postTitle = posts[i].data.title;
        var postAuthor = posts[i].data.author;
        var postFlair = posts[i].data.link_flair_text;
        var postMedia = posts[i].data.media;
        var postThumb = posts[i].data.thumbnail;
        var postCreated = moment(posts[i].data.created_utc * 1000);
        var postUps = posts[i].data.ups;
        var postRewards = posts[i].data.total_awards_received;
        var postViewCount = posts[i].data.view_count;
        var postArchived = posts[i].data.archived;
        var postPinned = posts[i].data.pinned;
        var postPreview = posts[i].data.preview;
        var postURL = posts[i].data.url_overridden_by_dest;

        console.log(kind);
        console.log(subReddit);
        console.log(postTitle);
        console.log(postAuthor);
        console.log(postFlair);
        console.log(postMedia);
        console.log(postThumb);
        console.log(postCreated);
        console.log(postUps);
        console.log(postRewards);
        console.log(postViewCount);
        console.log(postArchived);
        console.log(postPinned);
        console.log(postPreview.images[0].source);
        console.log(postURL);

        if (i < posts.length)
            return channel.send(new Discord.MessageEmbed()
                .setColor('#FF5700')
                .setAuthor(postAuthor, subImage)
                .setTitle(postTitle)
                .setURL(postURL)
                .setThumbnail(postThumb)
                .setDescription(``)
                .addFields(
                    { name: 'Post URL: ', value: `${postURL}` }
                )
                .setTimestamp(postCreated.toDate())
            ).then(() => redditPost(channel, posts, i + 1))
                .catch((err) => { throw err; }); //Most likely the channel was deleted mid post
    } else
        return new Promise((resolve, reject) => { return resolve('') });
}