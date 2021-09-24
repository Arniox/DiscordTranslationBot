//Import classes
const Discord = require('discord.js');
const vision = require('@google-cloud/vision');
const axios = require('axios');
//Create vision client
const client = new vision.ImageAnnotatorClient({
    credentials: {
        client_id: process.env.GOOGLE_SERVICE_CLIENT_ID,
        client_email: process.env.GOOGLE_SERVICE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_PRIVATE_KEY.replace(/\\n/gm, '\n')
    }
});

exports.run = (bot, guild, message, command, args) => {
    //Get message attachments
    const attachments = message.attachments.map((value, key) => value);

    //Check that an image exists
    if (attachments.length > 0) {
        //Image stats
        const { name, id, size, url, height, width } = attachments[0];

        //Check args
        if (args.length != 0) {
            //Get option
            var option = args.shift().toLowerCase();

            //Switch on option
            switch (option) {
                case 'dominate_colour': case 'dominate_color': case 'dominate':
                case 'colour': case 'color': case 'dom': case 'col': case 'domcol':
                    //Loading message
                    message.WaffleResponse(`Processing Image __${name}__...`, MTYPE.Loading)
                        .then(async (sent) => {
                            //Recognise image properties
                            const [results] = await client.imageProperties(`${url}`);
                            const dominateColours = results.imagePropertiesAnnotation.dominantColors.colors
                                .sort((a, b) => a.score < b.score ? 1 : -1);

                            //Get details on top
                            var top = dominateColours.shift(),
                                topHex = rgbToHex(top.color.red, top.color.green, top.color.blue),
                                topColourName = '',
                                topColourScore = 0,
                                topColourExactMatch = false,
                                otherColourNames = [],
                                imageUrl = `https://singlecolorimage.com/get/${topHex.replace(/\#/g, '')}/${width}x${height}.png`,
                                colourNameUrl = `http://thecolorapi.com/id?hex=${topHex.replace(/\#/g, '')}`;

                            //Get colour name
                            axios.get(colourNameUrl).then((response) => {
                                new Promise(async (resolve, reject) => {
                                    //Top colour name
                                    topColourName = response.data.name.value;
                                    topColourScore = (top.score * 100).toFixedCut(2);
                                    topColourExactMatch = response.data.name.exact_match_name;

                                    //Get all other colours
                                    try {
                                        for (var otherCol of dominateColours) {
                                            var otherHex = rgbToHex(otherCol.color.red, otherCol.color.green, otherCol.color.blue),
                                                otherColourNameUrl = `http://thecolorapi.com/id?hex=${otherHex.replace(/\#/g, '')}`,
                                                otherResponse = await axios.get(otherColourNameUrl);
                                            //Get other colours names
                                            otherColourNames.push({
                                                colourName: otherResponse.data.name.value,
                                                exactMatch: otherResponse.data.name.exact_match_name,
                                                colourHex: otherHex,
                                                colourImageUrl: `https://singlecolorimage.com/get/${otherHex.replace(/\#/g, '')}/${width}x${height}.png`,
                                                colourPercentage: (otherCol.score * 100).toFixedCut(2)
                                            });
                                        }
                                        resolve();
                                    } catch (error) {
                                        console.error(error);
                                        reject(`Sorry, I couldn't find one of the colour's names`);
                                    }
                                }).then(() => {
                                    //Edit final message
                                    const editNow = new Discord.MessageEmbed()
                                        .setDescription(`Finished Processing __${name}__ to find dominate colour.\n\n` +
                                            `Dominate Colour: **${(topColourExactMatch ? '~' : '')}` +
                                            `${topColourName} ([${topHex}](${imageUrl})) - ${topColourScore}%**`)
                                        .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                        .setColor('#09b50c')
                                        .setThumbnail(imageUrl)
                                        .setImage(url);

                                    //If found other colours, then add as fields
                                    if (otherColourNames.length > 0)
                                        editNow.addFields(
                                            {
                                                name: 'Other Colours:',
                                                value: `${otherColourNames.map((v, i) => `${i + 1} - ${(v.exactMatch ? '~' : '')}` +
                                                    `${v.colourName} ([${v.colourHex}](${v.colourImageUrl})) - ${v.colourPercentage}%`).join('\n')}`,
                                                inline: true
                                            })

                                    //Edit message
                                    sent.edit(editNow);
                                }).catch((error) => {
                                    message.WaffleResponse(error, MTYPE.Error);
                                });
                            }).catch((error) => {
                                message.WaffleResponse(`Sorry, I couldn't find the top colour's name!`, MTYPE.Error);
                            });
                        }).catch((error) => {
                            message.WaffleResponse(`Couldn't process ${name} for some reason. Please try again`, MTYPE.Error);
                        });
                    break;
                case 'what_is_this': case 'whatisthis': case 'whatis': case 'whatthis':
                case 'what': case 'whati': case 'wutis': case 'wutisthis': case 'wutthis':
                    //Loading message
                    message.WaffleResponse(`Processing Image __${name}__...`, MTYPE.Loading)
                        .then(async (sent) => {
                            //Recognise image labels
                            const [results] = await client.labelDetection(`${url}`);
                            const labels = results.labelAnnotations
                                .sort((a, b) => a.score < b.score ? 1 : -1);

                            if (labels.length > 0) {
                                //Edit final message
                                sent.edit(new Discord.MessageEmbed()
                                    .setDescription(`Finished Processing __${name}__ and I think I know what this is...`)
                                    .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                    .addFields(
                                        {
                                            name: 'Guesses:',
                                            value: `${labels.map((v, i) => `${i + 1} - **${v.description}** - ${(v.score * 100).toFixedCut(2)}%`).join('\n')}`,
                                            inline: true
                                        })
                                    .setColor('#09b50c')
                                    .setImage(url));
                            } else {
                                sent.edit(new Discord.MessageEmbed()
                                    .setDescription(`Sorry, I could not figure out what __${name}__ is.`)
                                    .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                    .setColor('#09b50c')
                                    .setImage(url));
                            }
                        }).catch((error) => {
                            console.error(error);
                            message.WaffleResponse(`Couldn't process ${name} for some reason. Please try again`, MTYPE.Error);
                        });
                    break;
                case 'where_is_this': case 'whereisthis': case 'whereis': case 'wherethis':
                case 'where': case 'wherei': case 'findthis': case 'findwhere': case 'find':
                    //Load message
                    message.WaffleResponse(`Processing Image __${name}__...`, MTYPE.Loading)
                        .then(async (sent) => {
                            //Recognise image landmarks
                            const [results] = await client.landmarkDetection(`${url}`);
                            const landmarks = results.landmarkAnnotations
                                .sort((a, b) => a.score < b.score ? 1 : -1);

                            if (landmarks.length > 0) {
                                var top = landmarks.shift(),
                                    topDescription = top.description,
                                    topScore = (top.score * 100).toFixedCut(2),
                                    topLocations = top.locations[0].latLng,
                                    topUrl = `https://www.google.com/maps/search/?api=1&query=${topDescription}`.replace(/[ ]/gm, '+'),
                                    topUrl2 = `https://www.google.com/maps/search/?api=1&query=${topLocations.latitude},${topLocations.longitude}`;

                                //Edit final message
                                const editNow = new Discord.MessageEmbed()
                                    .setDescription(`Finished Processing __${name}__ and I belive I know where this is.\n\n` +
                                        `This is probably [${topDescription}](${topUrl}) which is at Latitude, Longitude of ` +
                                        `[${topLocations.latitude}, ${topLocations.longitude}](${topUrl2}) - ${topScore}%`)
                                    .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                    .setColor('#09b50c')
                                    .setImage(url);

                                //If found other landmarks, then save as fields
                                if (landmarks.length > 0)
                                    editNow.addFields(
                                        {
                                            name: 'It could also be:',
                                            value: `${landmarks.map((v, i) =>
                                                `${i + 1} - [${v.description}]` +
                                                `${(`(https://www.google.com/maps/search/?api=1&query=${v.description})`).replace(/[ ]/gm, '+')}` +
                                                ` - ${(v.score * 100).toFixedCut(2)}%`).join('\n')}`,
                                            inline: true
                                        });

                                //Edit message
                                sent.edit(editNow);
                            } else {
                                sent.edit(new Discord.MessageEmbed()
                                    .setDescription(`Sorry, I could not find where __${name}__ was taken.`)
                                    .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                    .setColor('#09b50c')
                                    .setImage(url));
                            }
                        }).catch((error) => {
                            console.error(error);
                            message.WaffleResponse(`Couldn't process ${name} for some reason. Please try again`, MTYPE.Error);
                        });
                    break;
                default:
                    HelpMessage(bot, guild, message, args);
                    break;
            }
        } else {
            HelpMessage(bot, guild, message, args);
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
}

//Functions
function HelpMessage(bot, guild, message, args) {
    //Send
    message.WaffleResponse(
        `Image command allows you to auto detect image properties such as dominant colours, labels, landmarks, and etc.`,
        MTYPE.Error,
        [
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}image [dominate_colour:dominate_color:dominate:colour:color:dom:col:domcol] {uploaded image}\n` +
                    `${guild.Prefix}image [what_is_this:whatisthis:whatis:whatthis:what:whati:wutis:wutisthis:wutthis] {upload image}\n` +
                    `${guild.Prefix}image [where_is_this:whereisthis:whereis:wherethis:where:wherei:findthis:findwhere:find] {upload image}`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}image dominate_colour\n` +
                    `${guild.Prefix}image what_is_this\n` +
                    `${guild.Prefix}image where_is_this`
            }
        ],
        true, 'Thanks, and have a good day');
}