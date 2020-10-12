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
                            before: sub.Last_After
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

                            console.log('POSTS LENGTH: ' + filteredRes.length + '\n\n------------------------------------\n\n');

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
        console.log(posts[i]);

        //Get post variables
        var subReddit = posts[i].data.subreddit_name_prefixed; //Sub reddit name (not null)
        var postTitle = posts[i].data.title; //Post title (not null)
        var postAuthor = posts[i].data.author; //Post author (not null)
        var postFlair = posts[i].data.link_flair_text; //Post flair (not null)
        var postMedia = (posts[i].data.media ?
            (posts[i].data.media.reddit_video ?
                posts[i].data.media.reddit_video.fallback_url : '') : ''); //Post media (video. Media can be null)
        var postThumb = (posts[i].data.thumbnail == 'self' ?
            '' : posts[i].data.thumbnail); //Post thumbnail (can be non existant)
        var postCreated = moment(posts[i].data.created_utc * 1000); //Post creation date
        var postUps = posts[i].data.ups; //Post upvotes (not null)
        var postRewards = posts[i].data.total_awards_received; //Post rewards received (not null)
        var postViewCount = posts[i].data.view_count; //Post view count (can be null)
        var postArchived = posts[i].data.archived; //Post archived bool (not null)
        var postPinned = posts[i].data.pinned; //Post pinned bool (not null)
        var postPreview = (posts[i].data.preview ?
            (posts[i].data.preview.images[0] ?
                posts[i].data.preview.images[0].source : '') : ''); //Post preview images (can be null)
        var postURL = 'https://www.reddit.com' + posts[i].data.permalink; //Post url (not null)

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
        console.log(posts[i].data.preview);
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
            ).then(() => redditPost(channel, subImage, posts, i + 1))
                .catch((err) => { throw err; }); //Most likely the channel was deleted mid post
    } else
        return new Promise((resolve, reject) => { return resolve('') });
}