//Import classes
const Dicord = require('discord.js');
const { create, all } = require('mathjs');
const maths = create(all, {
    number: 'BigNumber'
});

exports.run = (bot, guild, message, command, args) => {
    if (args.length != 0) {
        //Get number
        var numberString = args.shift();

        //Check if arg is number
        if (/^\d+$/.test(numberString)) {
            //Grab number from string
            var numberToTest = parseInt(numberString);
            var next = numberToTest;
            //Set up numberCount array
            var numberCounterArray = [];
            var isNot1 = true;

            //Send message
            message.WaffleResponse(`Calculating ${numberToTest}...`, MTYPE.Loading)
                .then((sent) => {
                    //Collatz Conjecture Rules:
                    //If ODD: 3x + 1
                    //If EVEN: x/2
                    //Push to array
                    //maths.format(maths.evaluate(expr), { notation: 'fixed' })
                    numberCounterArray.push(`**${next}** - [${maths.evaluate(`${next} % 2`) == 0 ? 'Even' : 'Odd'}]:`);
                    //While loop
                    while (isNot1) {
                        if (maths.format(maths.evaluate(`${next} % 2`), { notation: 'fixed' }) == 0) {
                            //Is even
                            next = maths.format(maths.evaluate(`${next} / 2`), { notation: 'fixed' });
                        } else {
                            //Is odd
                            next = maths.format(maths.evaluate(`(${next} * 3) + 1`), { notation: 'fixed' });
                        }

                        //Check if next is 4, 2, or 1
                        //End of Collatz Conjecture
                        switch (next) {
                            case '4':
                                numberCounterArray.push(`4 - **[Even]**`, `2 - **[Even]**`, `1 - **[Even]**`);
                                isNot1 = false;
                                break;
                            case '2':
                                numberCounterArray.push(`2 - **[Even]**`, `1 - **[Even]**`);
                                isNot1 = false;
                                break;
                            case '1':
                                numberCounterArray.push(`1 - **[Even]**`);
                                isNot1 = false;
                                break;
                            default:
                                numberCounterArray.push(`${next} - **[${maths.evaluate(`${next} % 2`) == 0 ? 'Even' : 'Odd'}]**`);
                                break;
                        }
                    }

                    //Message
                    var text = numberCounterArray;
                    //List message
                    sent.delete({ timeout: 0 }).catch(() => { });
                    //Send message
                    ListMessage(message, `\n*Collatz Conjecture: If even, x/2. If odd, 3x+1 until the number reaches 1*\n` +
                        `Steps for ${numberToTest}: *${text.length}*\n`, '#09b50c', MessageToArray(() => {
                            return text.join('\n');
                        }), (text.join('\n').length > 4000 ? 10 : 30));
                });
        } else {
            message.WaffleResponse(`Sorry, ${numberString} was not a valid number.`);
        }
    } else {
        HelpMessage(bot, guild, message, args);
    }
}

//Functions
function HelpMessage(bot, guild, message, args) {
    //Get random number
    const randomNumber = randInt();
    //Send
    message.WaffleResponse(
        `Use this command to test the Collatz Conjecture against any number. Proove math wrong.`,
        MTYPE.Error,
        [
            {
                name: 'Command Patterns: ',
                value: `${guild.Prefix}collatz [number]`
            },
            {
                name: 'Example: ',
                value: `${guild.Prefix}collatz ${randomNumber}`
            }
        ],
        true, 'Thanks, and have a good day');
}