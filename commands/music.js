//Import requirements
const Discord = require('discord.js');
const moment = require('moment-timezone');
const ytdl = require('ytdl-core');

//Server queue
const queue = new Map();

exports.run = (bot, guild, message, command, args) => {
    if (args.length != 0) {
        //Get server queue
        const serverQueue = queue.get(message.guild.id);

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
                            //Check if bot is not in voice
                            if (!botVoice) {
                                //Get permissions for joining channels
                                var permissions = voiceChannel.permissionsFor(message.client.user);
                                if (!permissions.has('CONNECT') && !permissions.has("SPEAK")) {
                                    message.channel.send(new Discord.MessageEmbed().setDescription(`I need permissions to join and speak in your voice channel!`).setColor('#b50909'));
                                } else {
                                    //Promise based ytdl-core
                                    new Promise(async (resolve, reject) => {
                                        //Get song info
                                        var songInfo = await ytdl.getInfo(query);
                                        resolve(songInfo);
                                    }).then((songInfo) => {
                                        console.log(songInfo);

                                        //Get song
                                        var song = {
                                            title: songInfo.videoDetails.title,
                                            url: songInfo.videoDetails.video_url
                                        };
                                        //If server queue empty, then create it for this server
                                        if (!serverQueue) {
                                            //Create queue construct
                                            const queueConstruct = {
                                                textChannel: message.channel,
                                                voiceChannel: voiceChannel,
                                                connection: null,
                                                songs: [],
                                                volume: 5,
                                                playing: true
                                            };

                                            //Set the queue to this server id
                                            queue.set(message.guild.id, queueConstruct);
                                            queueConstruct.songs.push({ song: song, queuedBy: message.member });

                                            //Defean bot
                                            message.guild.me.voice.setDeaf(true);
                                            //Join voice channel
                                            voiceChannel
                                                .join()
                                                .then((connection) => {
                                                    //Attach connection to the queueConstruct
                                                    queueConstruct.connection = connection;
                                                    //Play music
                                                    play(message.guild, queueConstruct.songs[0]);
                                                }).catch(error => {
                                                    console.error(error);
                                                    queue.delete(message.guild.id);
                                                    //Send message error
                                                    message.channel.send(new Discord.MessageEmbed().setDescription(err).setColor('#b50909'));
                                                });
                                        } else {
                                            serverQueue.songs.push(song);
                                            //Play music if paused
                                            if (serverQueue.connection.dispatcher.paused)
                                                play(message.guild, serverQueue.songs[0]);
                                            //Send message
                                            message.channel.send(new Discord.MessageEmbed().setDescription(`${song.title} has been added to the queue.`).setColor('#09b50c'));
                                        }
                                    }).catch((err) => {
                                        console.error(err); //Return console error
                                    });
                                }
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
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('I am currently not playing anything so cannot be resumed.').setColor('#b50909'));
                            }
                        }
                    } else {
                        message.channel.send(new Discord.MessageEmbed().setDescription('Please join a voice channel first.').setColor('#b50909'));
                    }
                }
                break;
            case 'skip':
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
                                //Fire dispatcher event end to skip song
                                serverQueue.connection.dispatcher.end();
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setDescription('There is no song playing that I could skip.').setColor('#b50909');)
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
                    message.channel.send(new Discord.MessageEmbed().setDescription(`Now playing: **${serverQueue.songs[0].song.title}** - ` +
                        `Queued by: ${serverQueue.songs[0].queuedBy.toString()}`).setColor('#0099ff'));
                } else {
                    message.channel.send(new Discord.MessageEmbed().setDescription('I am not playing anything right now...').setColor('#0099ff'));
                }
                break;
            default:
                HelpMessage(bot, guild, message, args);
        }

        //Check every now and then if the music bot is not playing anything for a while
        const interval = setInterval(() => {
            //Check if the bot is in a voice
            if (botVoice && (!serverQueue || !serverQueue.songs.length > 0)) {
                //Check if bot has been paused for 5 minutes (300,000 milliseconds)
                if (serverQueue.connection.dispatcher.pausedTime > 300000) {
                    //Send message
                    serverQueue.textChannel.send(new Discord.MessageEmbed().setDescription(`I have not played anything new in over 5 minutes now so have left the channel.`).setColor('#0099ff'));
                    serverQueue.voiceChannel.leave(); //Leave the voice channel
                    queue.delete(message.guild.id); //Delete the server queue

                    //Clear the interval
                    clearInterval(interval);
                }
            }
        }, 60000);
    } else {
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
            { name: 'Skip:', value: `${guild.Prefix}[skip:s]` },
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
function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    //Check if a song exists.
    if (!song) {
        //Pause with silence so can be continued later
        serverQueue.connection.dispatcher.pause(true);
        return;
    } else {
        //Create dispatcher and play
        const dispatcher = serverQueue.connection
            .play(ytld(song.song.url))
            .on("finish", () => {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));

        //Set volume
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(new Discord.MessageEmbed().setDescription(`Started playing: **${song.song.title}** - Queued by: ${song.queuedBy.toString()}`).setColor('#0099ff'));
    }
}

//Error function
function cannotEffect(message, botVoice, whatAmIDoing) {
    message.channel.send(new Discord.MessageEmbed().setDescription(`I am currently playing music in ${botVoice.toString()} so cannot ${whatAmIDoing} in your channel. ` +
        `Please either drag me or move into ${botVoice.toString()}`).setColor('#b50909'));
}