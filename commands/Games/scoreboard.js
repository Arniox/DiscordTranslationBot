//Import classes
const Discord = require('discord.js');
const vision = require('@google-cloud/vision');

exports.run = (bot, guild, message, command, args) => {
    //Create vision client
    const client = new vision.ImageAnnotatorClient({
        keyFilename: "../../googleAPIKeys.json"
    });

    //Get message attachements
    const attachments = message.attachments.map((value, key) => value);

    //Check that args exist
    if (args.length != 0) {
        console.log(args);
    } //Check that an image exists
    else if (attachments.length > 0) {
        //Image stats
        const { name, id, size, url, height, width } = attachments[0];
        //Loading message
        message.WaffleResponse(`Processing Image "${name}"...`, MTYPE.Loading)
            .then(async (sent) => {
                //Recognise text
                const [results] = await client.textDetection(`${url}`);
                const detections = results.textAnnotations;
                console.log('Text:');
                detections.forEach(text => console.log(text));
            });
    } else {
        HelpMessage(bot, guild, message, args);
    }
}

//Functions
function HelpMessage(bot, guild, message, args) {
    //Send
    message.WaffleResponse(
        'Scoreboard command allows you to upload an image of any final scoreboard from any game and the users and their score will be saved for counting purposes.',
        MTYPE.Error,
        [
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}scoreboard [attached image]`
            }
        ],
        true, 'Thanks, and have a good day');
}