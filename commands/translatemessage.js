//Import classes
const googleApiKey = process.env.GOOGLE_API_KEY;
const Discord = require('discord.js');
const googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });

exports.run = (bot, guild, message, args) => {
    //message.content = RemoveByMatches(message.content, bot.config.google["translate-ignored-patterns"]);
    if (!message.content) return;
    //If discord server is not allowed translation
    if (guild.Allowed_Translation == 0) return;

    //Ignore specific channels
    if (bot.config.google["translate-ignored-channels"].find(i => i.id == message.channel.id)) return;
    //Cut out translation ignored patterns
    var messy = message.content;
    bot.config.google["translate-ignored-patterns"].forEach((e) => {
        messy = messy.replace(new RegExp(e.pattern, 'g'), '');
    });
    //If message is entirely emojis, just exit because it will be nothing after.
    if (!message.content) return;

    //Detect
    googleTranslate.detectLanguage(messy, function (err, detection) {
        //Translate if not english or link
        if (detection.language != 'en' && detection.language != 'und' && detection.confidence > bot.config.google["confidence-restriction"]) {
            //Translate
            googleTranslate.translate(message.content, detection.language, 'en', function (err, translation) {
                if (translation.translatedText !== message.content) {
                    message.delete({ timeout: 0 }); //Delete message
                    //Get country
                    googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                        //Create embedded message
                        var embeddedTranslation = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setAuthor(message.author.username, message.author.avatarURL())
                            .setDescription(translation.translatedText)
                            .addFields(
                                { name: 'Original text', value: `${message.content}` },
                                {
                                    name: 'Detected Language',
                                    value: `${languageCodes.find(i => i.language == detection.language).name} - ` +
                                        `${(detection.confidence * 100).floor().toString()}% confidence.`,
                                    inline: true
                                }
                            )
                            .setTimestamp()
                            .setFooter('Powered by Google Translate');
                        //Send
                        message.channel.send(embeddedTranslation);
                    });
                }
            });
        }
    });
};

//Functions
//Remove from mathes
function RemoveByMatches(string, expressions) {
    if (expressions.length == 0) {
        return string.replace(expressions, "");
    } else {
        var outPut = '';
        for (var i = 0; i < expressions.length; ++i) {
            outPut += string.replace(expressions[i], "");
        }
    }
}