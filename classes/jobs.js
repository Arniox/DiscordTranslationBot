//Import
const Discord = require('discord.js');
const CronJob = require('cron').CronJob;
const moment = require('moment-timezone');
//Import functions
require('../message-commands.js')();
var tools = require('../extra-functions');

module.exports = class JobManager {
    //Jobs constructor
    constructor() {
        this.jobs = new Map();
    }

    //Start job
    CreateJob(timeString, callBackFunction, name, stopAtSpecificTime = false) {
        //Convert timestring
        const time = this.TimeString(timeString, stopAtSpecificTime);
        if (!time) return false;

        //Create and push
        this.jobs.set(
            name,
            new CronJob(
                stopAtSpecificTime ? moment(time).toDate() : time,
                callBackFunction, null, true, 'Australia/Sydney'));
        //Run
        this.jobs.get(name).start();
        return true;
    }

    //Stop job
    StopJob(name) {
        if (this.jobs.get(name))
            this.jobs.get(name).stop();
        else
            console.error(new Error(`Job: ${name} does not exist.`));
    }

    //Create time string
    TimeString(timeString, stopAtSpecificTime = false) {
        //Create key value list
        const usefulDigits = {
            'y': { 'name': 'year' },
            'Q': { 'name': 'quarter' },
            'M': { 'name': 'month' },
            'w': { 'name': 'week' },
            'd': { 'name': 'day' },
            'h': { 'name': 'hour' },
            'm': { 'name': 'minute' },
            's': { 'name': 'second' },
        }
        //Get right now
        var now = moment().tz('Australia/Sydney'),
            addedTime = moment(now);
        //Get strings
        const strings = timeString.match(/[\d]+[a-z]{1,2}/gi);

        if (strings.length > 0) {
            //Foreach
            for (const e of strings) {
                //Get ID
                var identifier = e.match(/[a-z]+|[^a-z]+/gi);
                //Get the number
                const number = identifier.shift();
                if (/^\d+$/.test(number)) {
                    //Get digit range
                    const digitRange = identifier.shift();

                    //Check if exists
                    if (digitRange in usefulDigits) {
                        addedTime.add(parseInt(number), digitRange); //Add to today
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }
        } else {
            return null;
        }

        if (!stopAtSpecificTime) {
            //Get diff as array of time
            const difference = (moment(addedTime).diff(moment(now)) / 1000).toString().toTimeString('cron', true);
            const slate = difference.map((v, i) => {
                if (v == 0) return '*';
                else if (v == -1) return '0';
                else return `*/${v}`;
            });

            //Create
            const blankSlate = `${slate[0]} ${slate[1]} ${slate[2]} * ${slate[4]} ${slate[3]}`;
            return blankSlate;
        } else {
            return addedTime;
        }
    }
}