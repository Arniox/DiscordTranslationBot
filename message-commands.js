//Import
const Discord = require('discord.js');

module.exports = function () {
    this.ListMessage = function (channel, message, array, chunk = 10) {
        //Cut the array into chunks
        var i, j, arrayarray = [];
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