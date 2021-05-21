//Import requirements
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const axios = require('axios');
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
            var query = args.join(' ');

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
                            message.WaffleResponse(`I need permissions to join and speak in your voice channel!`);
                        } else {
                            message.WaffleResponse(`Loading...`, MTYPE.Loading)
                                .then((sent) => {
                                    //Async function
                                    (async () => {
                                        try {
                                            //Get response from custom API
                                            const response = await axios.post(`https://youtube-link-api.herokuapp.com/query`, {
                                                search: query
                                            });
                                            const playListData = response.data.response;

                                            var messageToSend;
                                            var playListArray;
                                            var duration = 0;
                                            //Check type of response
                                            switch (playListData.Message) {
                                                case 'playlist':
                                                    //Get duration and send message
                                                    duration = (playListData.Array.map(v => v.duration_ms).reduce((a, b) => a + b) / 1000).toString().toTimeString(true);
                                                    messageToSend = new Discord.MessageEmbed()
                                                        .setDescription(`Queued **${playListData.Array.length}** song(s) - [${message.member.toString()}]`)
                                                        .setColor('#09b50c')
                                                        .addField('Total Playlist Duration: ', duration, true);
                                                    //Create playListArray
                                                    playListArray = playListData.Array;
                                                    break;
                                                case 'song':
                                                    //Get duration and send message
                                                    duration = (playListData.Array[0].duration_ms / 1000).toString().toTimeString(true);
                                                    messageToSend = new Discord.MessageEmbed()
                                                        .setDescription(`Queued **${playListData.Array[0].title}** - [${message.member.toString()}]`)
                                                        .setColor('#09b50c')
                                                        .addField('Song Duration: ', duration, true);
                                                    //Create playListArray
                                                    playListArray = playListData.Array;
                                                    break;
                                                case 'search':
                                                    //Get duration and send message
                                                    duration = (playListData.Array[0].duration_ms / 1000).toString().toTimeString(true);
                                                    messageToSend = new Discord.MessageEmbed()
                                                        .setDescription(`Found and Queued **${playListData.Array[0].title}** - [${message.member.toString()}]`)
                                                        .setColor('#09b50c')
                                                        .addField('Song Duration: ', duration, true);
                                                    //Create playListArray
                                                    playListArray = [playListData.Array[0]];
                                                    break;
                                            }

                                            //Edit message
                                            sent.edit(messageToSend).then((sent) => {
                                                //Create queue construct
                                                const queueConstruct = {
                                                    textChannel: message.channel,
                                                    voiceChannel: voiceChannel,
                                                    connection: null,
                                                    songs: [],
                                                    volume: 0.1,
                                                    playing: true,
                                                    skip: 0,
                                                    maxSkip: 3
                                                };
                                                //Set the queue to this server id
                                                if (!serverQueue) bot.musicQueue.set(message.guild.id, queueConstruct);
                                                const tempServerQueue = bot.musicQueue.get(message.guild.id);

                                                //Add to queue
                                                for (const song of playListArray) {
                                                    tempServerQueue.songs.push({ song: song, queuedBy: message.member });
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
                                                            //Play music
                                                            play(bot, message, message.guild, tempServerQueue.songs[0]);
                                                        }).catch((error) => {
                                                            console.error(error);
                                                            bot.musicQueue.delete(message.guild.id);
                                                            //Send message error
                                                            message.WaffleResponse(error);
                                                        });
                                                } else {
                                                    //Play music if paused
                                                    if (serverQueue.connection.dispatcher.paused) serverQueue.connection.dispatcher.resume();
                                                }
                                            });
                                        } catch (error) {
                                            //Send error message
                                            console.log(error);
                                            sent.edit(new Discord.MessageEmbed()
                                                .setDescription(`Sorry, there was an error. Is your link a super large playlist? I don't handle those too well.`)
                                                .setColor('#b50909')
                                                .setFooter('*Link Parser probably timed out. This is still a work in process.*'));
                                        }
                                    })();
                                });
                        }
                    }
                } else {
                    message.WaffleResponse('Please join a voice channel first');
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
                            message.WaffleResponse('Resumed ▶️', MTYPE.Information);
                        } else {
                            message.WaffleResponse('I am currently not playing anything so cannot be resumed.');
                        }
                    }
                } else {
                    message.WaffleResponse('Please join a voice channel first.');
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
                                message.WaffleResponse(`Skipped ⏩`, MTYPE.Information);
                            }

                            //Check if the member has a role named DJ
                            if (IsDJ(message) || IsManager(message)) {
                                skipThis();
                            } else {
                                //Check serverQueue construct skip stage
                                if (serverQueue.skip >= serverQueue.maxSkip) {
                                    skipThis();
                                } else {
                                    //Add one to skip
                                    serverQueue.skip += 1;
                                    message.WaffleResponse(`Skipped ${serverQueue.skip} / ${serverQueue.maxSkip} ❌`, MTYPE.Information);
                                }
                            }
                        } else {
                            message.WaffleResponse('There is no song playing that I could skip.');
                        }
                    } else {
                        message.WaffleResponse('I am currently not playing anything in any voice channel.');
                    }
                }
            } else {
                message.WaffleResponse('Please join a voice channel first.');
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
                        //Check user is either manager or has dj role
                        if (IsDJ(message) || IsManager(message)) {
                            //Clear queue
                            serverQueue.songs = [];
                            //Fire dispatcher event end to immediately exit recursion and exit
                            serverQueue.connection.dispatcher.end();
                            message.WaffleResponse('Stopped Playing ⏹️', MTYPE.Information);
                        } else {
                            message.WaffleResponse(`Sorry, only server moderators or DJ's can stop the music queue`);
                        }
                    } else {
                        message.WaffleResponse('I am not playing anything right now...', MTYPE.Information);
                    }
                }
            } else {
                message.WaffleResponse('Please join a voice channel first.');
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
                        //Check user is either manager or has dj role
                        if (IsDJ(message) || IsManager(message)) {
                            //Pause dispatcher
                            serverQueue.connection.dispatcher.pause(true);
                            message.WaffleResponse('Paused ⏸️', MTYPE.Information);
                        } else {
                            message.WaffleResponse(`Sorry, only server moderators or DJ's can pause the music.`);
                        }
                    } else {
                        message.WaffleResponse('I am currently not playing anything so cannot be paused.');
                    }
                }
            } else {
                message.WaffleResponse('Please join a voice channel first.');
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
                        //Check user is either manager or has dj role
                        if (IsDJ(message) || IsManager(message)) {
                            //Resume dispatcher
                            serverQueue.connection.dispatcher.resume();
                            message.WaffleResponse('Resumed ▶️', MTYPE.Information);
                        } else {
                            message.WaffleResponse(`Sorry, only server moderators or DJ's can resume the music`);
                        }
                    } else {
                        message.WaffleResponse('I am currently not playing anything so cannot be resumed.');
                    }
                }
            } else {
                message.WaffleResponse('Please join a voice channel first.');
            }
            break;
        case 'nowplaying': case 'nowp': case 'now': case 'np':
            //Check if bot is not in voice
            if (botVoice && (serverQueue && serverQueue.songs.length > 0)) {
                //Create details
                const title = serverQueue.songs[0].song.title.replace(/(\*|_|`|~|\\|\[|])/g, '');
                const url = serverQueue.songs[0].song.url;
                const duration = (serverQueue.songs[0].song.duration_ms / 1000).toString().toTimeString();
                const currentTime = (serverQueue.connection.dispatcher.streamTime / 1000).toString().toTimeString();
                const queuedBy = serverQueue.songs[0].queuedBy.toString();

                message.WaffleResponse(
                    `▶️ Now playing [${title}](${url}) ${queuedBy}\n\n` +
                    `**Song Duration:**\n${currentTime} - ${duration}`,
                    MTYPE.Information
                );
            } else {
                message.WaffleResponse('I am not playing anything right now...', MTYPE.Information);
            }
            break;
        case 'queue': case 'q':
            //Check if bot is not in voice
            if (botVoice && serverQueue) {
                //Get main details
                const totalDuration = (serverQueue.songs.map(v => v.song.duration_ms).reduce((a, b) => a + b) / 1000).toString().toTimeString(true);
                //Send message
                ListMessage(message, `Songs in Music Queue:\n\n**Total Queue Duration:**\n${totalDuration}\n\n`, '#0099ff', MessageToArray(() => {
                    //For loop them into an output
                    var output = '';
                    for (var i = 0; i < serverQueue.songs.length; i++) {
                        //Create details
                        const title = (`${serverQueue.songs[i].song.title.replace(/(\*|_|`|~|\\|\[|])/g, '')}`).trimString(25);
                        const url = serverQueue.songs[i].song.url;
                        const duration = (serverQueue.songs[i].song.duration_ms / 1000).toString().toTimeString();
                        const queuedBy = serverQueue.songs[i].queuedBy.toString();

                        //Create output per song
                        output += `${(i > 0 ? `${i}` : '▶️')} - [${title}](${url}) ${duration} ${queuedBy}\n`;
                    }
                    return output;
                }), 10, '#0099ff');
            } else {
                message.WaffleResponse('I am not playing anything right now...', MTYPE.Information);
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

                        //Message
                        message.WaffleResponse('Shuffled Queue 🔀', MTYPE.Information);
                    } else {
                        message.WaffleResponse('I am currently not playing anything so the queue cannot be shuffeled.');
                    }
                }
            } else {
                message.WaffleResponse('Please join a voice channel first.');
            }
            break;
        case 'movesong': case 'songmove':
            //Check if user not in voice
            if (voiceChannel) {
                //Check if bot voice already exists
                if (botVoice && (botVoice != voiceChannel)) {
                    cannotEffect(message, botVoice, 'move a song within the queue');
                } else {
                    //Check if bot is not in voice
                    if (botVoice && (serverQueue && serverQueue.songs.length > 0)) {
                        //Get old index
                        var oldIndex = args.shift();
                        if (oldIndex && /^\d+$/.test(oldIndex)) {
                            oldIndex = parseInt(oldIndex);
                            //Check that it's not outside queue
                            if (oldIndex < serverQueue.songs.length) {
                                //Get song
                                const title = serverQueue.songs[oldIndex].song.title.replace(/(\*|_|`|~|\\|\[|])/g, '');
                                const url = serverQueue.songs[oldIndex].song.url;
                                const queuedBy = serverQueue.songs[oldIndex].queuedBy.toString();

                                //Get new index
                                var newIndex = args.shift();
                                if (newIndex && /^\d+$/.test(newIndex)) {
                                    newIndex = parseInt(newIndex);
                                    //Move song to end of queue if value is over server length
                                    if (newIndex > serverQueue.songs.length) newIndex = serverQueue.songs.length - 1;

                                    //Get temp data on new song position
                                    var tempSong = serverQueue.songs[newIndex]; //Create temp song
                                    serverQueue.songs[newIndex] = serverQueue.songs[oldIndex]; //Move new song
                                    serverQueue.songs[oldIndex] = tempSong; //Save old song

                                    //Message
                                    message.WaffleResponse(`Swapped [${title}](${url}) ${queuedBy} with the ${newIndex.ordinal()} song 🔁`, MTYPE.Information);
                                } else {
                                    message.WaffleResponse(`Where did you want to move [${title}](${url}) to, within the queue?`);
                                }
                            } else {
                                message.WaffleResponse(`Sorry, I could not find the ${oldIndex.ordinal()} song.`);
                            }
                        } else {
                            message.WaffleResponse('Which song did you want to move somewhere within queue?');
                        }
                    } else {
                        message.WaffleResponse('I am currently not playing anything so you cannot move any songs around within the queue');
                    }
                }
            } else {
                message.WaffleResponse('Please join a voice channel first.');
            }
            break;
        case 'removesong': case 'songremove': case 'remove': case 'rem':
            //Check if user not in voice
            if (voiceChannel) {
                //Check if bot voice already exists
                if (botVoice && (botVoice != voiceChannel)) {
                    cannotEffect(message, botVoice, 'remove song from queue');
                } else {
                    //Check if bot is not in voice
                    if (botVoice && (serverQueue && serverQueue.songs.length > 0)) {
                        //Check if manager or DJ
                        if (IsDJ(message) || IsManager(message)) {
                            //Get index
                            var index = args.shift();
                            if (index && /^\d+$/.test(index)) {
                                index = parseInt(index);
                                //Remove song at the end of queue if value is over server length
                                if (index > serverQueue.songs.length) index = serverQueue.songs.length - 1;

                                //Get song
                                const title = serverQueue.songs[index].song.title.replace(/(\*|_|`|~|\\|\[|])/g, '');
                                const url = serverQueue.songs[index].song.url;
                                const queuedBy = serverQueue.songs[index].queuedBy.toString();

                                //Message
                                message.WaffleResponse(`Removed [${title}](${url}) ${queuedBy} ⏏️`, MTYPE.Information);
                            } else {
                                message.WaffleResponse(`Sorry, I could not find the song you wanted to remove`);
                            }
                        } else {
                            message.WaffleResponse('Sorry, only server moderators or DJ\'s can remove a song from the queue');
                        }
                    } else {
                        message.WaffleResponse('I am currently not playing anything so you cannot remove a song from the queue');
                    }
                }
            } else {
                message.WaffleResponse('Please join a voice channel first.');
            }
            break;
        default:
            HelpMessage(bot, guild, message, args);
    }
}

function HelpMessage(bot, guild, message, args) {
    //Send message
    message.WaffleResponse(
        'Used for playing and controlling your music in your discord!', MTYPE.Error,
        [
            { name: 'Play: ', value: `${guild.Prefix}[play:p] [link / search query]` },
            { name: 'Skip:', value: `${guild.Prefix}[skip:s] *(Members with a role named \"DJ\" and server managers can insta skip songs)*` },
            { name: 'Stop:', value: `${guild.Prefix}[stop] *(Only Members with a role named \"DJ\" and server managers can stop the queue)*` },
            { name: 'Pause:', value: `${guild.Prefix}[pause] *(Only Members with a role named \"DJ\" and server managers can pause the music)*` },
            { name: 'Resume:', value: `${guild.Prefix}[resume] *(Only Members with a role named \"DJ\" and server managers can resume the music)*` },
            { name: 'Now Playing:', value: `${guild.Prefix}[nowplaying:nowp:now:np]` },
            { name: 'Shuffle', value: `${guild.Prefix}[shuffle:shuff:shuf:sh]` },
            { name: 'Move Song', value: `${guild.Prefix}[movesong:songmove] [song index] [new song index]` }
        ],
        true, 'Thanks, and have a good day'
    );
}

//Functions
async function play(bot, message, guild, song) {
    const serverQueue = bot.musicQueue.get(guild.id);

    //Check if a song exists.
    if (!song) {
        //Send message
        message.WaffleResponse(`Finished playing music from the queue.`, MTYPE.Information, null, false, null, serverQueue.textChannel)

        //Leave channel
        serverQueue.voiceChannel.leave();
        bot.musicQueue.delete(guild.id);
        return;
    } else {
        //Song details
        const { title, url, duration_ms } = song.song;
        const queuedBy = song.queuedBy.toString();

        //Create readable video object
        var readable = await ytdl(url, { quality: "highestaudio", highWaterMark: 1 << 25 });
        //Create dispatcher and play
        const dispatcher = serverQueue.connection
            .play(readable, { highWaterMark: 1, bitrate: 'auto', fec: true, volume: 0.1 })
            .on('start', () => {
                //Send message
                message.WaffleResponse(
                    `Started playing [${title.replace(/(\*|_|`|~|\\|\[|])/g, '')}](${url})` +
                    ` ${queuedBy}\n\n**Song Duration:**\n${(duration_ms / 1000).toString().toTimeString()}`,
                    MTYPE.Information, null, false, null, serverQueue.textChannel
                );
            }).on("finish", () => {
                //Shift songs and play next recursively
                serverQueue.songs.shift();
                return play(bot, message, guild, serverQueue.songs[0]);
            }).on('error', (err) => {
                //Send message
                message.WaffleResponse(
                    `[${title}](${url}) encountered an error while streaming. Skipped.`, MTYPE.Error,
                    null, false, null, serverQueue.textChannel
                );
                //Shift songs and play next recursively
                serverQueue.songs.shift();
                return play(bot, message, guild, serverQueue.songs[0]);
            });
    }
}

//Error function
function cannotEffect(message, botVoice, whatAmIDoing) {
    message.WaffleResponse(
        `I am currently playing music in ${botVoice.toString()} so cannot ${whatAmIDoing} in your channel. ` +
        `Please either drag me to your channel or move into ${botVoice.toString()}`
    );
}