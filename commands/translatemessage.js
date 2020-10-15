//Import classes
const Discord = require('discord.js');
const googleApiKey = process.env.GOOGLE_API_KEY;
const googleTranslate = require('google-translate')(googleApiKey, { "concurrentLimit": 20 });

exports.run = (bot, guild, message, args) => {
    if (!message.content) return;
    //If discord server is not allowed translation
    if (guild.Allowed_Translation == 0) return;

    //Ignore specific channels
    const channels_cmd = `
    SELECT * FROM translation_ignored_channels
        WHERE ServerId = "${message.guild.id}"
    `;
    bot.con.query(channels_cmd, (error, results, fields) => {
        if (error) return console.error(error); //Return error console log

        //Only continue if channel is not blacklisted
        if (!results.find(i => i.ChannelId == message.channel.id)) {
            //Cut out translation ignored patterns
            const patterns_cmd = `
            SELECT * FROM translation_ignored_patterns
                WHERE ServerId = "${message.guild.id}"
            `;
            bot.con.query(patterns_cmd, (error, results, fields) => {
                if (error) return console.error(error); //Return error console log

                //Cut out translationn ignored patterns
                //Cut out default ignored patterns
                var messy = message.content
                    .replace(/<:[a-zA-Z]+:\d+>/g, '') //Get rid of emojis
                    .replace(/<[@]?[!]?d+>/g, '') //Get rid of tagging members
                    .replace(/<[#]?[!]?d+>/g, ''); //Get rid of tagging channels
                results.map(v => v.Pattern).forEach((e) => {
                    //Replace the text
                    messy = messy.replace(new RegExp(e, 'g'), '');
                });

                //If the message no longer exists after being sliced appart
                if (messy) {
                    //Detect
                    googleTranslate.detectLanguage(messy, function (err, detection) {
                        //Translate if not english or link
                        if (detection.language != 'en' && detection.language != 'und' && detection.confidence > guild.Translation_Confidence) {
                            //Translate
                            googleTranslate.translate(message.content, detection.language, 'en', function (err, translation) {
                                if (translation.translatedText !== message.content) {
                                    //Auto delete messages if turned on
                                    if (guild.Auto_Delete_Translation == 1) message.delete({ timeout: 100 }); //Delete message
                                    //Get country
                                    googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                                        //Check if server has embedded translation on
                                        if (guild.Embedded_Translations == 1) {
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
                                        } else {
                                            //Send normal message
                                            message.channel.send(`${translation.translatedText} | **${languageCodes.find(i => i.language == detection.language).name}** | *${message.author.username}*`);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};