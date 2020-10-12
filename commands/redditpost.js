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
                    bot.reddit.get(`/r/${sub.SubName}/new`, { limit: 100 })
                        .then((res) => {
                            //Last after save
                            const save_cmd = `
                            UPDATE server_subbed_reddits
                            SET Last_After = "${moment().format('YYYY-MM-DD HH:mm:ss')}"
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
                            var filteredbyTime = res.data.children.filter(i => moment(i.data.created_utc * 1000).isAfter(moment(sub.Last_After)));
                            var filteredRes = (flairFilter ? filteredbyTime.filter(i => i.data.link_flair_text == flairFilter) : filteredbyTime);

                            //Post sequentially with promise loop
                            redditPost(channelToPostTo, sub.SubImage, filteredRes, 0)
                                .then(() => { });
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
    if (posts.length != 0 && i < posts.length) {
        //Get post variables
        //Sub reddit name + Post author
        var messageAuthor = `${posts[i].data.subreddit_name_prefixed} - ${posts[i].data.author}`;
        //Post Flair + Post title
        var messageTitle = `${(posts[i].data.link_flair_text ?
            `(${posts[i].data.link_flair_text}) - ` : '')}${posts[i].data.title}`.trimString(255);

        var postContent = posts[i].data.selftext.trimString(2047); //Post content (not null)
        var postMedia = (posts[i].data.media ?
            (posts[i].data.media.reddit_video ?
                posts[i].data.media.reddit_video.fallback_url : '') : ''); //Post media (video. Media can be null)
        var postThumb = (posts[i].data.thumbnail == 'self' ?
            '' : posts[i].data.thumbnail); //Post thumbnail (can be non existant)
        var postCreated = moment(posts[i].data.created_utc * 1000); //Post creation date
        var postUps = posts[i].data.ups; //Post upvotes (not null)
        var postRewards = posts[i].data.total_awards_received; //Post rewards received (not null)
        var postViewCount = posts[i].data.view_count; //Post view count (can be null)
        var postPreview = (/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g.test(posts[i].data.url) ? posts[i].data.url : ''); //Post preview images (can be null)
        var postURL = 'https://www.reddit.com' + posts[i].data.permalink; //Post url (not null)

        return channel.send(new Discord.MessageEmbed()
            .setColor('#FF5700')
            .setAuthor(messageAuthor, subImage)
            .setTitle(messageTitle)
            .setThumbnail(postThumb)
            .setDescription(postContent)
            .setImage(postPreview)
            .addFields(
                { name: 'Stats: ', value: `${postUps} ⬆️ | ${postRewards} 🏅 | ${(postViewCount ? postViewCount : 0)} 👁️` },
                { name: 'Post URL: ', value: `[Reddit Perma Link](${postURL})` }
            )
            .setTimestamp(postCreated.toDate())
        ).then(() => {
            //If media exists then send it after
            (postMedia ? channel.send(`${postMedia}`) : new Promise((resolve, reject) => { return resolve('') }))
                .then(() => {
                    redditPost(channel, subImage, posts, i + 1);
                });
        }).catch((err) => { throw err; }); //Most likely the channel was deleted mid post
    } else
        return new Promise((resolve, reject) => { return resolve('') });
}