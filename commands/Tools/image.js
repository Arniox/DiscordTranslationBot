//Import classes
const Discord = require('discord.js');
const vision = require('@google-cloud/vision');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { createCanvas, Image } = require('canvas');
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
        const { name, id, size, url } = attachments[0];
        var tempHeight = attachments[0].height,
            tempWidth = attachments[0].width;
        const height =
            (tempHeight * tempWidth > 2073600 ? //1080p (1k) 1920x1080
                (tempHeight * tempWidth > 3686400 ? //1440p (2k) 2560x1440
                    (tempHeight * tempWidth > 8294400 ? //2160p (4k) 3840x2160
                        (tempHeight * tempWidth > 33177600 ? //4320p (8k) 7680x4320
                            (tempHeight * tempWidth > 132710400 ? //8640p (16k) 15360x8640
                                tempHeight / 16 : tempHeight / 8) : tempHeight / 4) : tempHeight / 2) : (tempHeight / 1.5).floor()) : tempHeight);
        const width =
            (tempHeight * tempWidth > 2073600 ?
                (tempHeight * tempWidth > 3686400 ?
                    (tempHeight * tempWidth > 8294400 ?
                        (tempHeight * tempWidth > 33177600 ?
                            (tempHeight * tempWidth > 132710400 ?
                                tempWidth / 16 : tempWidth / 8) : tempWidth / 4) : tempWidth / 2) : (tempWidth / 1.5).floor()) : tempWidth);

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
                                    message.WaffleResponse(error);
                                });
                            }).catch((error) => {
                                message.WaffleResponse(`Sorry, I couldn't find the top colour's name!`);
                            });
                        }).catch((error) => {
                            message.WaffleResponse(`Couldn't process ${name} for some reason. Please try again`);
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
                            message.WaffleResponse(`Couldn't process ${name} for some reason. Please try again`);
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
                            message.WaffleResponse(`Couldn't process ${name} for some reason. Please try again`);
                        });
                    break;
                case 'describe_this': case 'describe_me': case 'describethis': case 'describeme': case 'describe': case 'this':
                    //Load message
                    message.WaffleResponse(`Processing Image __${name}__...`, MTYPE.Loading)
                        .then(async (sent) => {
                            //Recognise object locations
                            const [results] = await client.objectLocalization(`${url}`);
                            const objects = results.localizedObjectAnnotations;

                            //Create canvas and image
                            const canvas = createCanvas(width, height);
                            const ctx = canvas.getContext('2d');
                            const img = new Image();
                            img.dataMode = Image.MODE_IMAGE;

                            //Loading
                            sent.edit(new Discord.MessageEmbed()
                                .setDescription(`Finding Objects in __${name}__...`)
                                .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                .setColor('#FFCC00'));
                            drawCanvas(ctx, url, img, objects, width, height).then(() => {
                                //Edit loading
                                sent.edit(new Discord.MessageEmbed()
                                    .setDescription(`Saving Image __${name}__...`)
                                    .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                    .setColor('#FFCC00'));

                                //Get attachments
                                var newAttachmentName = `describe-me-${name.replace(/\.[^/.]+$/, "")}.png`,
                                    newAttachment = new Discord.MessageAttachment(canvas.toBuffer(), newAttachmentName);
                                const newEmbed = new Discord.MessageEmbed()
                                    .setDescription(`Finished Processing __${name}__. I've described as many things as I can see.`)
                                    .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                    .setColor('#09b50c')
                                    .setImage(`attachment://${newAttachmentName}`);

                                //If found objects
                                if (objects.length > 0)
                                    newEmbed.addFields(
                                        {
                                            name: 'List of things found:',
                                            value: `${objects.map((v, i) => `${i + 1} - **${v.name}** - ` +
                                                `${(v.score * 100).toFixedCut(2)}%`).join('\n')}`,
                                            inline: true
                                        });

                                //Send final message
                                sent.delete({ timeout: 200 }).catch(() => { return; }); //Delete message
                                message.channel.send({ embed: newEmbed, files: [newAttachment] }).catch((error) => console.error(error));
                            });
                        }).catch((error) => {
                            console.error(error);
                            message.WaffleResponse(`Couldn't process ${name} for some reason. Please try again`);
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
        //Check args
        if (args.length != 0) {
            //Get option
            var option = args.shift().toLowerCase();

            switch (option) {
                case 'processcolors':
                    //Check if me
                    if (IsMe(message) && false) {
                        const cardsToProcess = DeckTypes.Standard;
                        var cardCount = 0;

                        message.WaffleResponse(`Processing [${cardCount}/${cardsToProcess.length}]...`, MTYPE.Loading)
                            .then(async (sent) => {
                                const pixelDescriptorID = uuidv4();
                                //Create pixelDescriptor
                                const create_cmd = `
                                INSERT INTO pixel_descriptors (descriptorId, descriptorName)
                                    VALUES ("${pixelDescriptorID}", "CardPixels")
                                `;
                                bot.con.query(create_cmd, (error, results, fields) => {
                                    if (error) return console.error(error); //Return console error
                                });

                                //For each card image
                                for (const card of cardsToProcess) {
                                    //Create new connection
                                    bot.con = await bot.dbpool.then((p) => { return p.getConnection(); });
                                    //Get data
                                    var name = `${card.value} of ${card.suit}`,
                                        image = card.image,
                                        averageColour = await AverageColorFromImage(image),
                                        averageHex = rgbToHex(averageColour.r, averageColour.g, averageColour.b),
                                        averageResult = await axios.get(`http://thecolorapi.com/id?hex=${averageHex.replace(/\#/g, '')}`),
                                        averageName = averageResult.data.name.value,
                                        [results] = await client.imageProperties(`${image}`),
                                        dominateColours = results.imagePropertiesAnnotation.dominantColors.colors
                                            .sort((a, b) => a.score < b.score ? 1 : -1),
                                        topColor = dominateColours.shift(),
                                        dominantHex = rgbToHex(topColor.color.red, topColor.color.green, topColor.color.blue),
                                        dominantResult = await axios.get(`http://thecolorapi.com/id?hex=${dominantHex.replace(/\#/g, '')}`),
                                        dominantName = dominantResult.data.name.value;

                                    //Save to database
                                    const create_pixel_cmd = `
                                    INSERT INTO pixels (descriptorId, pixelName, pixelImage, pixelAverage, averageName, pixelDominant, dominantName)
                                        VALUES (
                                            "${pixelDescriptorID}", 
                                            "${name}", 
                                            "${image}", 
                                            "${averageColour.r},${averageColour.g},${averageColour.b}",
                                            "${averageName}",
                                            "${topColor.color.red},${topColor.color.green},${topColor.color.blue}",
                                            "${dominantName}"
                                            )`;
                                    bot.con.query(create_pixel_cmd, (error, results, fields) => {
                                        if (error) return console.error(error); //Return console error
                                    });

                                    //Increment count
                                    cardCount++;

                                    sent.edit(new Discord.MessageEmbed()
                                        .setDescription(`Processing [${cardCount}/${cardsToProcess.length}]...\n\n**${name}**`)
                                        .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                        .setColor('#FFCC00')
                                        .addFields([
                                            {
                                                name: `Average Colour`,
                                                value: `${averageHex}, ${averageName}`,
                                                inline: true
                                            }, {
                                                name: `Dominant Color`,
                                                value: `${dominantHex}, ${dominantName}`
                                            }
                                        ])
                                        .setThumbnail(`https://singlecolorimage.com/get/${averageHex.replace(/\#/g, '')}/500x500.png`)
                                        .setImage(`https://singlecolorimage.com/get/${dominantHex.replace(/\#/g, '')}/500x500.png`));

                                    //Release old connection
                                    bot.con.release();
                                }

                                sent.edit(new Discord.MessageEmbed()
                                    .setDescription(`Finished Processing all ${cardsToProcess.length} cards`)
                                    .setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL())
                                    .setColor('#09b50c'));
                            });
                    } else {
                        HelpMessage(bot, guild, message, args);
                    }
                    break;
                default:
                    HelpMessage(bot, guild, message, args);
                    break;
            }
        } else {
            HelpMessage(bot, guild, message, args);
        }
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
                value: `${guild.Prefix}image[dominate_colour: dominate_color: dominate: colour: color: dom: col: domcol] { uploaded image }\n` +
                    `${guild.Prefix}image[what_is_this: whatisthis: whatis: whatthis: what: whati: wutis: wutisthis: wutthis] { upload image }\n` +
                    `${guild.Prefix}image[where_is_this: whereisthis: whereis: wherethis: where: wherei: findthis: findwhere: find] { upload image }\n` +
                    `${guild.Prefix}image[describe_this: describe_me: describethis: describeme: describe: this:] { upload image }`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}image dominate_colour\n` +
                    `${guild.Prefix}image what_is_this\n` +
                    `${guild.Prefix}image where_is_this\n` +
                    `${guild.Prefix}image describe_this`
            }
        ],
        true, 'Thanks, and have a good day');
}

//Draw boxes
var drawBox = (ctx, AA, AB, AC, AD, detail) => {
    // AA   AB
    // 
    // AC   AD
    var rectWidth = AB.x - AA.x,
        rectHeight = AC.y - AA.y;
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
    ctx.rect(AA.x, AA.y, rectWidth, rectHeight);
    ctx.stroke();
}
//Draw text
var drawText = (ctx, AA, AB, AC, AD, detail, index, canvasHeight) => {
    //Write text
    ctx.font = '900 15px Sans';
    //Write highlight for text
    var measurement = ctx.measureText(`${detail.name} - ${(detail.score * 100).toFixedCut(2)}% `),
        highLightWidth = measurement.actualBoundingBoxRight + measurement.actualBoundingBoxLeft, //Width of text + 1 pixel right side
        highLightHeight = measurement.actualBoundingBoxAscent + measurement.actualBoundingBoxDescent, //Height of text + 1 pixel top
        placementTopY = AA.y - (5 + measurement.actualBoundingBoxDescent), //Place top position
        placementBottomY = AC.y + (5 + measurement.actualBoundingBoxAscent), //Place bottom position
        X = (index % 2 == 0 ? AA.x : AC.x), //Always place text on the far left of box
        Y = (index % 2 == 0 && (placementTopY - measurement.actualBoundingBoxAscent) > 0 ? placementTopY : //Place top if can fit in canvas
            ((placementBottomY + measurement.actualBoundingBoxDescent) < canvasHeight ? placementBottomY : //Otherwise place bottom if can fit in canvas
                placementBottomY - (5 + measurement.actualBoundingBoxAscent + 3 /*Line Width*/))), //Otherwise place bottom INSIDE box
        highLightX = X - measurement.actualBoundingBoxLeft, //Highlight X + 1 pixel left side
        highLightY = Y - (measurement.actualBoundingBoxAscent + measurement.actualBoundingBoxDescent); //High light Y + 1 pixel bottom
    ctx.beginPath();
    ctx.lineWidth = 0;
    ctx.rect(highLightX, highLightY, highLightWidth, highLightHeight);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
    ctx.fillText(`${detail.name} - ${(detail.score * 100).toFixedCut(2)}% `, X, Y);
}
//Draw for all
var drawForAll = (ctx, objects, canvasWidth, canvasHeight) => {
    //For each object
    objects.forEach((object, index) => {
        var detail = { name: object.name, score: object.score },
            vertices = object.boundingPoly.normalizedVertices.map((v) => {
                v.x = v.x * canvasWidth;
                v.y = v.y * canvasHeight;
                return v;
            }), //Un-normalize the vertexes
            AA = vertices[0],
            AB = vertices[1],
            AC = vertices[3],
            AD = vertices[2];

        //Draw
        drawBox(ctx, AA, AB, AC, AD, detail);
        drawText(ctx, AA, AB, AC, AD, detail, index, canvasHeight);
    });
}

//Draw image
var drawCanvas = (ctx, url, img, objects, canvasWidth, canvasHeight) => {
    return new Promise((resolve, reject) => {
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            drawForAll(ctx, objects, canvasWidth, canvasHeight);
            resolve();
        }
        //Set image url
        img.src = url;
    });
}