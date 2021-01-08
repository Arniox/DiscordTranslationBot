//Import requirements
const Discord = require('discord.js');
const moment = require('moment-timezone');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
//Import functions
require('../message-commands.js')();

exports.run = (bot, guild, message, command, args) => {
    //Get server queue
    const serverQueue = bot.musicQueue.get(message.guild.id);

    //Get user voice and bot voice
    const voiceChannel = message.member.voice.channel;
    const botVoice = message.guild.me.voice.channel;

    //Switch on music command
    switch (command) {
        case 'play': case 'p':
            var query = args.shift();

            //Check that query exists
            if (query) {
                //Check if user not in voice
                if (voiceChannel) {
                    //Check if bot voice already exists
                    if (botVoice && (botVoice != voiceChannel)) {
                        cannotEffect(message, botVoice, 'queue up any music');
                    } else {
                        //Get permissions for joining channels
                        var permissions = voiceChannel.permissionsFor(message.client.user);
                        if (!permissions.has('CONNECT') && !permissions.has("SPEAK")) {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`I need permissions to join and speak in your voice channel!`).setColor('#b50909'));
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription(`Loading...`).setColor('#FFCC00'))
                                .then((sent) => {
                                    //Check if the link is a playlist
                                    (ytpl.validateID(query) ? new Promise((resolve, reject) => {
                                        ytpl(query, { limit: Infinity }).then(playlist => resolve(playlist.items.map(v => v.shortUrl)));
                                    }) : new Promise((resolve, reject) => { return resolve([query]); }))
                                        .then((playlist) => {
                                            //Edit message
                                            sent.edit(new Discord.MessageEmbed().setDescription(`Queueing **${playlist.length}** songs...`).setColor('#FFCC00'))
                                                .then((sent) => {
                                                    //Create queue construct
                                                    const queueConstruct = {
                                                        textChannel: message.channel,
                                                        voiceChannel: voiceChannel,
                                                        connection: null,
                                                        songsPromise: [],
                                                        songs: [],
                                                        volume: 5,
                                                        playing: true,
                                                        skip: 0,
                                                        maxSkip: 3
                                                    };
                                                    //Set the queue to this server id
                                                    if (!serverQueue) bot.musicQueue.set(message.guild.id, queueConstruct);
                                                    const tempServerQueue = bot.musicQueue.get(message.guild.id);

                                                    //Push a promise of each song into the songs array
                                                    playlist.map((link) => {
                                                        //Create a promise and push it into the songs array.
                                                        tempServerQueue.songsPromise.push(
                                                            new Promise(async (resolve, reject) => {
                                                                resolve({
                                                                    songInfo: await ytdl.getInfo(link),
                                                                    queuedBy: message.member
                                                                });
                                                            }));
                                                    });







                                                    // //Promise that every song will be gathered
                                                    // playlist.map((link) => {
                                                    //     //Return promise
                                                    //     new Promise(async (resolve, reject) => {
                                                    //         //ytld-core get song info
                                                    //         resolve(await ytdl.getInfo(link));
                                                    //     }).then((songInfo) => {
                                                    //         //Take each song up on it's promise
                                                    //         //Get song
                                                    //         var song = {
                                                    //             title: songInfo.videoDetails.title,
                                                    //             url: (songInfo.videoDetails.video_url || songInfo.videoDetails.videoId)
                                                    //         };
                                                    //         //Add to queue
                                                    //         tempServerQueue.songs.push({ song: song, queuedBy: message.member });
                                                    //     }).catch((error) => {
                                                    //         console.error(error); //console error
                                                    //     });
                                                    // });

                                                    //Anon function
                                                    const sendMessage = () => {
                                                        //Print message
                                                        sent.edit(new Discord.MessageEmbed().setDescription(`**${playlist.length}** song${(playlist.length > 1 ? 's' : '')} queued - [${message.member.toString()}]`).setColor('#09b50c'));
                                                    }

                                                    //Check if bot is in voice or not
                                                    if (!botVoice || !tempServerQueue.connection) {
                                                        //Defean the bot
                                                        message.guild.me.voice.setDeaf(true);
                                                        //Join voice channel
                                                        voiceChannel
                                                            .join()
                                                            .then((connection) => {
                                                                //Attach connection to the queue
                                                                tempServerQueue.connection = connection;
                                                                //Send message
                                                                sendMessage();
                                                                //Play music
                                                                play(bot, message, message.guild, tempServerQueue.songsPromise[0]);
                                                            }).catch((error) => {
                                                                console.error(error);
                                                                bot.musicQueue.delete(message.guild.id);
                                                                //Send message error
                                                                message.channel.send(new Discord.MessageEmbed().setDescription(error).setColor('#b50909'));
                                                            });
                                                    } else {
                                                        //Play music if paused
                                                        if (serverQueue.connection.dispatcher.paused) serverQueue.connection.dispatcher.resume();
                                                        //Send message
                                                        sendMessage();
                                                    }
                                                });
                                        });
                                });
                        }
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first').setColor('#b50909'));
                }
            } else {
                //Resume queue if queue is empty
                //Check if user not in voice
                if (voiceChannel) {
                    //Check if bot voice already exists
                    if (botVoice && (botVoice != voiceChannel)) {
                        cannotEffect(message, botVoice, 'resume playing music');
                    } else {
                        //Check if bot is not in voice
                        if (botVoice && (serverQueue && serverQueue.songs.length > 0)) {
                            //Resume dispatcher
                            serverQueue.connection.dispatcher.resume();
                            message.channel.send(new Discord.MessageEmbed().setDescription('Resumed ▶️').setColor('#0099ff'));
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('I am currently not playing anything so cannot be resumed.').setColor('#b50909'));
                        }
                    }
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first.').setColor('#b50909'));
                }
            }
            break;
        case 'skip': case 's':
            //Check if user not in voice
            if (voiceChannel) {
                //Check if bot voice already exists
                if (botVoice && (botVoice != voiceChannel)) {
                    cannotEffect(message, botVoice, 'skip any music');
                } else {
                    //Check if bot is not in voice
                    if (botVoice) {
                        //Check if there are any songs queued
                        if (serverQueue && serverQueue.songs.length > 0) {
                            //Create end function
                            skipThis = () => {
                                //Set skip to 0
                                serverQueue.skip = 0;
                                //Fire dispatcher event end to skip song
                                serverQueue.connection.dispatcher.end();
                                message.channel.send(new Discord.MessageEmbed().setDescription(`Skipped ⏩`).setColor('#0099ff'));
                            }

                            //Check if the member has a role named DJ
                            if (message.member.roles.cache.map((v, k) => v).find(i => i.name.toLowerCase() == 'dj') || message.member.hasPermission('MANAGE_GUILD')) {
                                skipThis();
                            } else {
                                //Check serverQueue construct skip stage
                                if (serverQueue.skip >= serverQueue.maxSkip) {
                                    skipThis();
                                } else {
                                    //Add one to skip
                                    serverQueue.skip += 1;
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`Skipped ${serverQueue.skip} / ${serverQueue.maxSkip} ❌`).setColor('#0099ff'));
                                }
                            }
                        } else {
                            message.channel.send(new Discord.MessageEmbed().setDescription('There is no song playing that I could skip.').setColor('#b50909'));
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('I am currently not playing anything in any voice channel.').setColor('#b50909'));
                    }
                }
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first.').setColor('#b50909'));
            }
            break;
        case 'stop':
            //Check if user not in voice
            if (voiceChannel) {
                //Check if bot voice already exists
                if (botVoice && (botVoice != voiceChannel)) {
                    cannotEffect(message, botVoice, 'stop playing music');
                } else {
                    //Check if bot is not in voice
                    if (botVoice) {
                        //Clear queue
                        serverQueue.songs = [];
                        //Fire dispatcher event end to immediately exit recursion and exit
                        serverQueue.connection.dispatcher.end();
                        message.channel.send(new Discord.MessageEmbed().setDescription('Stopped Playing ⏹️').setColor('#0099ff'));
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('I am already stopped!').setColor('#b50909'));
                    }
                }
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first.').setColor('#b50909'));
            }
            break;
        case 'pause':
            //Check if user not in voice
            if (voiceChannel) {
                //Check if bot voice already exists
                if (botVoice && (botVoice != voiceChannel)) {
                    cannotEffect(message, botVoice, 'pause the music');
                } else {
                    //Check if bot is not in voice
                    if (botVoice) {
                        //Pause dispatcher
                        serverQueue.connection.dispatcher.pause(true);
                        message.channel.send(new Discord.MessageEmbed().setDescription('Paused ⏸️').setColor('#0099ff'));
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('I am currently not playing anything so cannot be paused.').setColor('#b50909'));
                    }
                }
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first.').setColor('#b50909'));
            }
            break;
        case 'resume':
            //Check if user not in voice
            if (voiceChannel) {
                //Check if bot voice already exists
                if (botVoice && (botVoice != voiceChannel)) {
                    cannotEffect(message, botVoice, 'resume playing music');
                } else {
                    //Check if bot is not in voice
                    if (botVoice && (serverQueue && serverQueue.songs.length > 0)) {
                        //Resume dispatcher
                        serverQueue.connection.dispatcher.resume();
                        message.channel.send(new Discord.MessageEmbed().setDescription('Resumed ▶️').setColor('#0099ff'));
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('I am currently not playing anything so cannot be resumed.').setColor('#b50909'));
                    }
                }
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first.').setColor('#b50909'));
            }
            break;
        case 'nowplaying': case 'nowp': case 'now': case 'np':
            //Check if bot is not in voice
            if (botVoice && (serverQueue && serverQueue.songs.length > 0)) {
                message.channel.send(new Discord.MessageEmbed().setDescription(`Now playing [${serverQueue.songs[0].song.title}](${serverQueue.songs[0].song.url})` +
                    ` [${serverQueue.songs[0].queuedBy.toString()}]`).setColor('#0099ff'));
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('I am not playing anything right now...').setColor('#0099ff'));
            }
            break;
        case 'queue': case 'q':
            //Check if bot is not in voice
            if (botVoice && serverQueue) {
                //Send message
                ListMessage(message, `Music Queue:\n`, '#0099ff', MessageToArray(() => {
                    //For loop them into an output
                    var output = '';
                    for (var i = 0; i < serverQueue.songs.length; i++) {
                        //Create output per song
                        output += (`${i} - ${serverQueue.songs[i].song.title}`).trimString(40) + ` [${serverQueue.songs[i].queuedBy.toString()}]\n`;
                    }
                    return output;
                }), 10, '#0099ff');
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('I am not playing anything right now...').setColor('#0099ff'));
            }
            break;
        case 'shuffle': case 'shuff': case 'shuf': case 'sh':
            //Check if user not in voice
            if (voiceChannel) {
                //Check if bot voice already exists
                if (botVoice && (botVoice != voiceChannel)) {
                    cannotEffect(message, botVoice, 'shuffle the queue');
                } else {
                    //Check if bot is not in voice
                    if (botVoice && (serverQueue && serverQueue.songs.length > 0)) {
                        //Shuffle queue but keep playing current song
                        var currentSong = serverQueue.songs.shift(); //Get current song and pull out from queue
                        serverQueue.songs.shuffle(); //Shuffle queue
                        serverQueue.songs.unshift(currentSong); //Add current song to front
                        message.channel.send(new Discord.MessageEmbed().setDescription('Shuffled Queue 🔀').setColor('#0099ff'));
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('I am currently not playing anything so the queue cannot be shuffeled.').setColor('#b50909'));
                    }
                }
            } else {
                message.channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first.').setColor('#b50909'));
            }
            break;
        default:
            HelpMessage(bot, guild, message, args);
    }
}

function HelpMessage(bot, guild, message, args) {
    var embeddedHelpMessage = new Discord.MessageEmbed()
        .setColor('#b50909')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('Used for playing and controlling your music in your discord!')
        .addFields(
            { name: 'Play: ', value: `${guild.Prefix}[play:p] [link / search query]` },
            { name: 'Skip:', value: `${guild.Prefix}[skip:s] *(Members with a role named \"DJ\" and server managers can insta skip songs)*` },
            { name: 'Stop:', value: `${guild.Prefix}[stop]` },
            { name: 'Pause:', value: `${guild.Prefix}[pause]` },
            { name: 'Resume:', value: `${guild.Prefix}[resume]` },
            { name: 'Now Playing:', value: `${guild.Prefix}[nowplaying:nowp:now:np]` },
        )
        .setTimestamp()
        .setFooter('Thanks, and have a good day');

    //Send embedded message
    message.channel.send(embeddedHelpMessage);
}

//Functions
function play(bot, message, guild, songPromise) {
    const serverQueue = bot.musicQueue.get(guild.id);
    //Check if a song exists
    if (!songPromise) {
        //Send message
        serverQueue.textChannel.send(new Discord.MessageEmbed().setDescription(`Finished playing music from the queue.`).setColor('#0099ff'));

        //Leave channel
        serverQueue.voiceChannel.leave();
        bot.musicQueue.delete(guild.id);
        return;
    } else {
        //On song promise fulfilled
        songPromise.then(async (struc) => {
            //Take each song up on it's promise
            //Get song
            var song = {
                title: struc.songInfo.videoDetails.title,
                url: (struc.songInfo.videoDetails.video_url || struc.songInfo.videoDetails.videoId)
            };
            //Add to queue
            serverQueue.songs.push({ song: song, queuedBy: struc.queuedBy });

            //Create readable video 
            var readable = await ytdl(song.song.url, { quality: "highestaudio", highWaterMark: 1 << 25 });
            //Create dispatcher and play
            const dispatcher = serverQueue.connection
                .play(readable, { highWaterMark: 96, bitrate: 96, fec: true, volume: false })
                .on("finish", () => {
                    serverQueue.songsPromise.shift();
                    return play(bot, message, guild, serverQueue.songPromise[0]);
                });

            //Set volume
            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            serverQueue.textChannel.send(new Discord.MessageEmbed().setDescription(`Started playing [${song.song.title}](${song.song.url})` +
                ` [${song.queuedBy.toString()}]`).setColor('#0099ff'));
        });
    }
}

//Error function
function cannotEffect(message, botVoice, whatAmIDoing) {
    message.channel.send(new Discord.MessageEmbed().setDescription(`I am currently playing music in ${botVoice.toString()} so cannot ${whatAmIDoing} in your channel. ` +
        `Please either drag me or move into ${botVoice.toString()}`).setColor('#b50909'));
}