//Import
const Discord = require('discord.js');

export function ListMessage(channel, message, array) {
    //Cut the array into chunks
    var i, j, arrayarray = [], chunk = 10;
    for (i = 0, j = array.length; i < j; i += chunk) {
        arrayarray.push(array.slice(i, i + chunk));
    }

    //Send messages
    console.log(arrayarray);
}

export function MessageToArray(runme, split = '\n') {
    return runme().split(split);
}