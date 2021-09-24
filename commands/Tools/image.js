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
                                        reject(`Sorry, I couldn't find one of the colour's names`);
                                    }
                                }).then(() => {
                                    //Edit final message
                                    sent.edit(new Discord.MessageEmbed()
                                        .setDescription(`Finished Processing __${name}__ to find dominate colour.\n` +
                                            `Dominate Colour: **${(topColourExactMatch ? '~' : '')}` +
                                            `${topColourName} ([${topHex}](${imageUrl})) - ${topColourScore}%**`)
                                        .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                        .addFields(
                                            {
                                                name: 'Other Colours:',
                                                value: `${otherColourNames.map((v, i) => `${i + 1} - ${(topColourExactMatch ? '~' : '')}` +
                                                    `${v.colourName} ([${v.colourHex}](${v.colourImageUrl})) - ${v.colourPercentage}%`).join('\n')}`,
                                                inline: true
                                            })
                                        .setColor('#09b50c')
                                        .setThumbnail(imageUrl)
                                        .setImage(url));
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
                value: `${guild.Prefix}image [dominate_colour:dominate_color:dominate:colour:color:dom:col:domcol] {uploaded image}`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}image dominate_colour`
            }
        ],
        true, 'Thanks, and have a good day');
}