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
                    //Try catch validate the regex
                    var isValid = true;
                    try { new RegExp(e, 'g'); }
                    catch (e) { isValid = false; }

                    //Replace the text
                    messy = messy.replace((isValid ? new RegExp(e, 'g') : e), '');
                });

                //If the message no longer exists after being sliced appart
                if (messy) {
                    //Get supported languages
                    //Always get all the supported languages in english for readability
                    googleTranslate.getSupportedLanguages('en', function (err, languageCodes) {
                        //Detect
                        googleTranslate.detectLanguage(messy, function (err, detection) {
                            //Check whether this is a custom translation channel link
                            const custom_trans_links_cmd = `
                            SELECT * FROM custom_translation_channels
                                WHERE ServerId = "${message.guild.id}"
                            `;
                            bot.con.query(custom_trans_links_cmd, (error, results, fields) => {
                                if (error) return console.error(error); //Return console error

                                if (results.find(i => i.Channel_From == message.channel.id)) {
                                    //For each custom translation link
                                    results.filter(i => i.Channel_From == message.channel.id).forEach(channelLink => {
                                        //Check if channel to exists
                                        if (!(message.guild.channels.cache.get(channelLink.Channel_To))) {
                                            //If not exist, delete from db and return
                                            const remove_custom_trans_cmd = `
                                            DELETE FROM custom_translation_channels
                                                WHERE (Channel_To = "${channelLink.Channel_To}")
                                                AND ServerId = "${message.guild.id}"
                                            `;
                                            bot.con.query(remove_custom_trans_cmd, (error, results, fields) => {
                                                if (error) return console.error(error); //Return error console log
                                            });
                                        } else {
                                            //Get current language and detected language
                                            var { currentLang, detectedLang } = GetLanguages(languageCodes, (channelLink.Language_To || guild.Default_Language_Code), detection.language);

                                            //Translate if not in the output language or link or confidence
                                            if (detection.language != (channelLink.Language_To || guild.Default_Language_Code) && detection.language != 'und' && detection.confidence > guild.Translation_Confidence) {
                                                //Translate
                                                googleTranslate.translate(message.content, detection.language, (channelLink.Language_To || guild.Default_Language_Code), function (err, translation) {
                                                    //Ignore the fact that some text will be the exact same and still post as this is custom translated
                                                    //Linked channels
                                                    //Auto delete message if turned on
                                                    //Also, only delete message if the channel it's posted in is the same as the output channel
                                                    if (guild.Auto_Delete_Translation == 1 && channelLink.Channel_To == message.channel.id) message.delete({ timeout: 100 }); //Delete message

                                                    //Send message
                                                    message.guild.channels.cache.get(channelLink.Channel_To).send(
                                                        SendTranslation(guild, message, translation, detectedLang, currentLang, detection));
                                                });
                                            } else if (detection.language == (channelLink.Language_To || guild.Default_Language_Code)) {
                                                //Simply post message
                                                //Auto delete message if turned on
                                                //Also, only delete message if the channel it's posted in is the same as the output channel
                                                if (guild.Auto_Delete_Translation == 1 && channelLink.Channel_To == message.channel.id) message.delete({ timeout: 100 }); //Delete message

                                                //Send message
                                                message.guild.channels.cache.get(channelLink.Channel_To).send(
                                                    SendTranslation(guild, message, { translatedText: message.content }, detectedLang, currentLang, detection));
                                            }
                                        }
                                    });
                                } else {
                                    //Get current language and detected language
                                    var { currentLang, detectedLang } = GetLanguages(languageCodes, guild.Default_Language_Code, detection.language);

                                    //Translate if not english or link or confidence
                                    if (detection.language != guild.Default_Language_Code && detection.language != 'und' && detection.confidence > guild.Translation_Confidence) {
                                        //Translate
                                        googleTranslate.translate(message.content, detection.language, guild.Default_Language_Code, function (err, translation) {
                                            if (translation.translatedText !== message.content) {
                                                //Auto delete messages if turned on
                                                //Also, only delete message if the channel it's posted in is the same as the output channel
                                                if (guild.Auto_Delete_Translation == 1 &&
                                                    (guild.Default_Channel_Output == message.channel.id || !guild.Default_Channel_Output)) message.delete({ timeout: 100 }); //Delete message

                                                //Check whether to output to main channel or default output
                                                var channelTo = (guild.Default_Channel_Output ?
                                                    message.guild.channels.cache.get(guild.Default_Channel_Output) : message.channel);
                                                //Send message
                                                channelTo.send(SendTranslation(guild, message, translation, detectedLang, currentLang, detection));
                                            }
                                        });
                                    }
                                }

                            });
                        });
                    });
                }
            });
        }
    });
};

//Functions
function GetLanguages(languageCodes, guildLanguage, detectedLanguage) {
    //Set variables
    var currentLang = languageCodes.find(i => i.language == guildLanguage);
    var detectedLang = languageCodes.find(i => i.language == detectedLanguage);

    return {
        currentLang,
        detectedLang
    };
}

function SendTranslation(guild, message, translation, detectedLang, currentLang, detection) {
    var messageTo;
    var translatedText = translation.translatedText.replace(/(?<=<.*)(\s*)(?=.*>)/g, '');

    //Check if server has embedded translation on
    if (guild.Embedded_Translations == 1) {
        //Create embedded message
        messageTo = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(translatedText)
            .addFields(
                { name: 'Original text', value: `${message.content}` },
                {
                    name: 'Detected Language',
                    value: `**${detectedLang.name}** -> **${currentLang.name}** with ` +
                        `${(detection.confidence * 100).floor().toString()}% confidence.`,
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter('Powered by Google Translate');
    } else {
        //Create normal message
        messageTo = `**${message.author.username}:** ${translatedText}\n` +
            `**${detectedLang.name}** -> **${currentLang.name}**`;
    }

    return messageTo;
}
