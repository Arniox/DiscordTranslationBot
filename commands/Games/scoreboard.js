//Import classes
const Discord = require('discord.js');
const vision = require('@google-cloud/vision');
//Create vision client
const client = new vision.ImageAnnotatorClient({
    credentials: {
        client_id: process.env.GOOGLE_SERVICE_CLIENT_ID,
        client_email: process.env.GOOGLE_SERVICE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_PRIVATE_KEY.replace(/\\n/gm, '\n')
    }
});
const supportedGames = [
    {
        name: 'league of legends',
        abbreviations: ['league of legends', 'legends', 'league', 'lol'],
        callback: (detections) => {
            return new Promise((resolve, reject) => {
                //Check that lol scoreboard has 
                //Number | player names | score / score / score | number | number
                const immediateDetails = detections.shift().description.split('\n').join(',');
                if (/([a-zA-Z\d]+,[\d ]+\/[\d ]+\/[\d ]+,[\d]+,[\d]+)/gmi.test(immediateDetails)) {
                    //Get other details
                    const detailsArray = detections;
                    const regex = /((\d+)|(\/\d+)|(\d+[ ]*)|([ ]*\d+)|(\d+\/)|(\/[ ]*\d+)|(\d+[ ]*\/)|(\/))/gmi;
                    //Get scores
                    const scores = detailsArray.map((v, i) => {
                        if (/^([ ]*\/[ ]*)$/gi.test(v.description)) {
                            v.description = `${detailsArray[i - 1].description}${v.description}`
                        }
                    });
                    console.log(scores);
                    //console.log(detailsArray[0].boundingPoly.vertices);
                    //console.log(detailsArray[0].boundingPoly.normalizedVertices);

                    // ΤEAM 2, 30 / 19 / 26 %, 54, 276 O, 16, Kiraric, 5 / 2 / 10, 195, 12, 447, +14 LP, FunnyWolfy, OB, 10, 062, 14, 4 / 3 / 3, 131, 王急15(, 45 LP, 2 LEGM, 12 / 4 / 3, 159, 12, 818, 15, 1GRIS, 6 / 1 / 5, 176, 10, 921, SILVER II, 12, chuckyD, 3 / 9 / 5, 49, 8, 028, TEAM 1, 19 / 30 / 20 %, 43, 727 O, 13, Metalloy, 3 / 7 / 3, 140, 9, 109, MASTERY 4, S -, +889 PTS, 争14, 6 / 6 / 4, bffew, 169, 10, 469, 12, TD Black, 3, 137, 9, 251, LEVEL 126, 126, +205 XP, A 13, xXMajesticPonyXx, 1 / 5 / 9, 150, 8, 571, 10, Vaccine, 2 / 6 / 1, 33, 6, 327, we could have done better if, you guys just stfu, LEGM was the most honorable player on your, team,

                    resolve();
                } else {
                    reject();
                }
            });
        }
    }
]

exports.run = (bot, guild, message, command, args) => {
    //Get message attachements
    const attachments = message.attachments.map((value, key) => value);

    //Check that an image exists
    if (attachments.length > 0) {
        //Get args for games
        if (args.length != 0) {
            //Get game
            var gameSelected = args.shift();
            if (supportedGames.filter(v => v.abbreviations.includes(gameSelected)).length > 0) {
                //Get supported game
                const gameDetails = supportedGames.filter(v => v.abbreviations.includes(gameSelected))[0];

                //Image stats
                const { name, id, size, url, height, width } = attachments[0];
                //Loading message
                message.WaffleResponse(`Processing Image "${name}"...`, MTYPE.Loading)
                    .then(async (sent) => {
                        //Recognise text
                        const [results] = await client.textDetection(`${url}`);
                        const detections = results.textAnnotations;

                        //detections.forEach(text => console.log(text));
                        gameDetails.callback(detections)
                            .then((details) => {

                            }).catch((error) => {
                                message.WaffleResponse(`Couldn't process ${name}. I didn't recognise the style of this scoreboard. Please try again with a clearer image`, MTYPE.Error);
                            });
                    });
            } else {
                message.WaffleResponse(`Sorry, **${gameSelected}** may not yet be supported or is a game abbreviation I do not understand`, MTYPE.Error);
            }
        } else {
            HelpMessage(bot, guild, message, args);
        }
    } //Check that args exist
    else if (args.length != 0) {
        console.log(args);
    } else {
        HelpMessage(bot, guild, message, args);
    }
}

//Functions
function HelpMessage(bot, guild, message, args) {
    //Send
    message.WaffleResponse(
        'Scoreboard command allows you to upload an image of any final scoreboard from supported games and the users and their score will be saved for counting purposes.\n' +
        `Supported games include: ${supportedGames.map(v => v.name).join(', ')}`,
        MTYPE.Error,
        [
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}scoreboard [game name (and abbreviations)] {attached image}`
            },
            {
                name: 'Examples: ',
                value: `${guild.Prefix}scoreboard ${supportedGames.map(v => v.name).random()}`
            }
        ],
        true, 'Thanks, and have a good day');
}