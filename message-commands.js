//Import
const Discord = require('discord.js');

module.exports = function () {
    this.ListMessages = function (channel, message, array) {
        //Cut the array into chunks
        var i, j, arrayarray = [], chunk = 10;
        for (i = 0, j = array.length; i < j; i += chunk) {
            arrayarray.push(array.slice(i, i + chunk));
        }

        //Send messages
        console.log(arrayarray);
    }

    this.MessageToArray = function (runme, split = '\n') {
        return runme().split(split);
    }
}