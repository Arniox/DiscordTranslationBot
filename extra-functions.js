const { min } = require("moment");

const units = new Array("one", "two", "three", "four", "five", "six", "seven", "eight", "nine");
const teens = new Array("ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen ", "nineteen");
const tens = new Array("twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety");
const illions = new Array('m', 'b', 'tr', 'quadr', 'quint', 'sext', 'sept', 'oct', 'non', // 10^6 - 10^30
    'dec', 'undec', 'duodec', 'tredec', 'quattuordec', 'quindec', 'sexdec', 'septendec', 'octodec', 'novemdec', // 10^33 - 10^60
    'vigint', 'unvigint', 'duovigint', 'trevigint', 'quattuorvigint', 'quinvigint', 'sexvigint', 'septenvigint', 'octovigint', 'novemvigint', // 10^63 - 10^90
    'trigint', 'untrigint', 'duotrigint', 'tretrigint', 'quattuortrigint', 'quintrigint', 'sextrigint', 'septentrigint', 'octotrigint', 'novemtrigint', // 10^93 - 10^120
    'quadragint', 'unquadragint', 'duoquadragint', 'trequadragint', 'quattuorquadragint', 'quinquadragint', 'sexquadragint', 'septenquadragint', 'octoquadragint', 'novemquadragint', // 10^123 - 10^150
    'quinquagint', 'unquinquagint', 'duoquinquagint', 'trequinquagint', 'quattuorquinquagint', 'quinquinquagint', 'sexquinquagint', 'septenquinquagint', 'octoquinquagint', 'novemquinquagint', // 10^153 - 10^180
    'sexagint', 'unsexagint', 'duosexagint', 'tresexagint', 'quattuorsexagint', 'quinsexagint', 'sexsexagint', 'septsexagint', 'octosexagint', 'novemsexagint', // 10^183 - 10^210
    'septuagint', 'unseptuagint', 'duoseptuagint', 'treseptuagint', 'quattuorseptuagint', 'quinseptuagint', 'sexseptuagint', 'septseptuagint', 'octoseptuagint', 'novemseptuagint', // 10^213 - 10^240
    'octogint', 'unoctogint', 'duooctogint', 'treoctogint', 'quattuoroctogint', 'quinoctogint', 'sexoctogint', 'septoctogint', 'octooctogint', 'novemoctogint', // 10^243 - 10^270
    'nonagint', 'unnonagint', 'duononagint', 'trenonagint', 'duattuornonagint', 'quinnonagint', 'sexnonagint', 'septnonagint', 'octononagint', 'novemnonagint', // 10^273 - 10^300
    'cent', 'cenunt', 'duocent', 'centret', 'quattuorcent', 'quinquacent', 'sexcent', 'septencent', 'octocent', 'novemcent', // 10^303 - 10^330
    'decicent', 'undecicent', 'duodecicent', 'tredecicent', 'quattuordecicent', 'quindecicent', 'sexdecicent', 'septendecicent', 'octodecicent', 'novemdecicent', // 10^333 - 10^360
    'viginticent', 'unviginticent', 'duoviginticent', 'treviginticent', 'quattuorviginticent', 'quinviginticent', 'sexviginticent', 'septenviginticent', 'octoviginticent', 'novemviginticent', // 10^363 - 10^390
    'trigintacent', 'untrigintacent', 'duotrigintacent', 'tretrigintacent', 'quattuortrigintacent', 'quintrigintacent', 'sextrigintacent', 'septentrigintacent', 'octotrigintacent', 'novemtrigintacent', // 10^393 - 10^420
    'quadragintacent', 'unquadragintacent', 'duoquadragintacent', 'trequadragintacent', 'quattuorquadragintacent', 'quinquadragintacent', 'sexquadragintacent', 'septenquadragintacent', 'octoquadragintacent', 'novemquadragintacent', // 10^423 - 10^450
    'quinquagintacent', 'unquinquagintacent', 'duoquinquagintacent', 'trequinquagintacent', 'quattuorquinquagintacent', 'quinquinquagintacent', 'sexquinquagintacent', 'septenquinquagintacent', 'octoquinquagintacent', 'novemquinquagintacent', // 10^453 - 10^480
    'sexagintacent', 'unsexagintacent', 'duosexagintacent', 'tresexagintacent', 'quattuorsexagintacent', 'quinsexagintacent', 'sexsexagintacent', 'septensexagintacent', 'octosexagintacent', 'novemsexagintacent', // 10^483 - 10^510
    'septuagintacent', 'unseptuagintacent', 'duoseptuagintacent', 'treseptuagintacent', 'quattorseptuagintacent', 'quinseptuagintacent', 'septenseptuagintacent', 'octoseptuagintacent', 'novemseptuagintacent', // 10^513 - 10^540
    'octogintacent'); // We don't need numbers bigger than that: 17 * 2^1802, being an upper bound, is approximately 4,9 * 10^543.

//Basic innser functions
function smallNum(num) {
    var a = num.charAt(0);
    var b = num.charAt(1);
    var c = num.charAt(2);
    var s = "";
    //If a is not 0, then start with a hundred
    if (a != 0) {
        s += units[a - 1] + " hundred";
        if (b == 0 && c == 0) return s;
        else s += " and ";
    }
    //If b is 0, then it's a single digit number
    if (b == 0) {
        if (c == 0) return "";
        return s + units[c - 1];
    }
    //If b is 1, then it's a 10's number like 15 or 19
    if (b == 1) {
        return s + teens[c];
    }
    //If b is greater than 1, then it's either a 10's like 20 or 30
    //Or it's something like 29 or 64
    if (b > 1) {
        s += tens[b - 2];
        if (c > 0) s += "-" + units[c - 1];
        return s;
    }
}

//Format a number as a string into the actual name of the number
String.prototype.toWordsConverted = function () {
    var s = this;
    //Check if too long
    if (s.length > 555) {
        return `Your number is ${s.length} digits long. The maximum length is 555 digits.`;
    }
    var r = "",
        temp = "";
    //Pad with 0's
    while (s.length % 3 > 0) s = "0" + s;
    //Get maximum accessable in the illions array
    var max = Math.ceil(s.length / 3);
    //For loop through the string
    for (var i = 0; i < max; i++) {
        temp = smallNum(s.substr(i * 3, 3));
        if (temp != "") {
            if (max - i == 1 && r != "" && s.substr(i * 3, 3) < 100) r += " and ";
            else if (r != "") r += ", ";
            if (max - i == 2) temp += " thousand";
            if (max - i > 2) temp += " " + illions[max - i - 3] + "illion";
        }
        r += temp;
    }
    //Otherwise if string is 0
    if (s == 0) r = "zero";
    r = r.charAt(0).toUpperCase() + r.substring(1, r.length) + ".";
    return r;
}

//Format the string seconds to the full HHMMSS time format
String.prototype.toTimeString = function (en = false) {
    var sec_num = parseInt(this, 10); // don't forget the second param

    //Get all time
    var years = Math.floor(sec_num / 31556926); sec_num -= years * 31556926; //1 Year (365.24 days) = 31556926 Seconds
    var months = Math.floor(sec_num / 2629743); sec_num -= months * 2629743; //1 Month (30.44 days) = 2629743 Seconds
    var weeks = Math.floor(sec_num / 604800); sec_num -= weeks * 604800; //1 Week = 604800 Seconds
    var days = Math.floor(sec_num / 86400); sec_num -= days * 86400; //1 Day = 86400 Seconds
    var hours = Math.floor(sec_num / 3600); sec_num -= hours * 3600;  //1 Hour = 3600 Seconds
    var minutes = Math.floor(sec_num / 60); sec_num -= minutes * 60; //1 Minute = 60 seconds
    var seconds = sec_num;

    console.log(years, months, weeks, days, hours, minutes, seconds);

    //Output
    var output = '';
    if (!en) {
        output = `${seconds.pad(2)}${output}`; //Add seconds
        output = `${(minutes > 0 || hours > 0 || days > 0 || weeks > 0 || months > 0 || years > 0 ? `${minutes.pad(2)}:` : '')}${output}`; //Add minutes
        output = `${(hours > 0 || days > 0 || weeks > 0 || months > 0 || years > 0 ? `${hours.pad(2)}:` : '')}${output}`; //Add hours
        output = `${(days > 0 || weeks > 0 || months > 0 || years > 0 ? `${days.pad(1)} - ` : '')}${output}`; //Add days
        output = `${(weeks > 0 || months > 0 || years > 0 ? `${weeks.pad(1)}/` : '')}${output}`; //Add weeks
        output = `${(months > 0 || years > 0 ? `${months.pad(1)}/` : '')}${output}`; //Add months
        output = `${years > 0 ? `${years.pad(1)}/` : ''}${output}`; //Add years
    } else {
        output = `${seconds.pad(2)} seconds${output}`; //Add seconds
        output = `${(minutes > 0 || hours > 0 || days > 0 || weeks > 0 || months > 0 || years > 0 ? `${minutes.pad(2)} minutes : ` : '')}${output}`; //Add minutes
        output = `${(hours > 0 || days > 0 || weeks > 0 || months > 0 || years > 0 ? `${hours.pad(2)} hours : ` : '')}${output}`; //Add hours
        output = `${(days > 0 || weeks > 0 || months > 0 || years > 0 ? `${days.pad(1)} days - ` : '')}${output}`; //Add days
        output = `${(weeks > 0 || months > 0 || years > 0 ? `${weeks.pad(1)} weeks, ` : '')}${output}`; //Add weeks
        output = `${(months > 0 || years > 0 ? `${months.pad(1)} months, ` : '')}${output}`; //Add months
        output = `${years > 0 ? `${years.pad(1)} years, ` : ''}${output}`; //Add years
    }
    return output;
}

//Cut string shorter
String.prototype.trimString = function (length, eclipse = '...') {
    return this.length > length ?
        this.substring(0, length - (eclipse.length + 1)) + eclipse :
        this;
}

//Proper case for string
String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLocaleLowerCase();
    });
}

//Sentence casing
String.prototype.toSentenceCase = function () {
    return this.replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function (txt) {
        return txt.toUpperCase();
    });
}

//To funny case
String.prototype.toFunnyCase = function () {
    return this.split('').map((v, i) => i % 2 == 0 ? v.toLowerCase() : v.toUpperCase()).join('');
}

//UTC to timezone date
Date.prototype.toTimeZone = function (timeZone) {
    //Get offset in milliseconds
    var offset = (this.getTimezoneOffset() + (timeZone * 60)) * 60 * 1000;
    //Update the timestamp to reflect
    this.setTime(this.getTime() + offset);
    return this;
}

//Ordinal of number
Number.prototype.ordinal = function () {
    var ones = this % 10;
    var tens = (this / 10).floor() % 10;
    var stuff = "";

    if (tens == 1) stuff = "th";
    else {
        switch (ones) {
            case 1: stuff = "st";
                break;
            case 2: stuff = "nd";
                break;
            case 3: stuff = "rd";
                break;
            default: stuff = "th";
                break;
        }
    }
    return this.toString() + stuff;
}

//Pad a number and return as string
Number.prototype.pad = function (size) {
    return ('0000000000000000000000000000000000000000' + this).substr(-size);
}

//Cut / Truncate a number to fixed value
Number.prototype.toFixedCut = function (digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};

//Format the number into a properly written number
Number.prototype.formatComma = function () {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Is this number an int
Number.prototype.isInt = function () {
    return this % 1 == 0;
}

//Maps to Math.abs
Number.prototype.abs = function () {
    return Math.abs(this);
}
//Maps to Math.ceil
Number.prototype.ceil = function () {
    return Math.ceil(this);
}
//Maps to Math.floor
Number.prototype.floor = function () {
    return Math.floor(this);
}
//Maps to Math.max
Number.prototype.max = function (low) {
    return Math.max(this, low);
}
//Maps to Math.min
Number.prototype.min = function (high) {
    return Math.min(this, high);
}
//Constrains a number between two values
Number.prototype.constrain = function (low, high) {
    return this.max(this.min(high), low);
}
//Maps to Math.pow
Number.prototype.pow = function (n) {
    return Math.pow(this, n);
}
//Maps to Math.exp
Number.prototype.exp = function () {
    return Math.E.pow(this);
}
//Maps to Math.log
Number.prototype.log = function () {
    return Math.log(this);
}
//Maps a given number from another range to a different range
Number.prototype.map = function (start1, stop1, start2, stop2, withinBounds = false) {
    var newVal = (this - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newVal;
    }
    if (start2 < stop2) {
        return this.constrain(newVal, start2, stop2);
    } else {
        return this.constrain(newVal, stop2, start2);
    }
}
//Normalizes a number from another range into a a value btween 0 and 1
Number.prototype.norm = function (start, stop) {
    return this.map(start, stop, 0, 1);
}
//Maps to Math.round
Number.prototype.round = function () {
    return Math.round(this);
}
//Maps to Math.sq
Number.prototype.sq = function () {
    return this * this;
}
//Maps to Math.sqrt
Number.prototype.sqrt = function () {
    return Math.sqrt(this);
}
//Percentage number to color
//From https://gist.github.com/mlocati/7210513
Number.prototype.perc2color = function () {
    var r, g, b = 0;
    if (this < 50) {
        r = 255;
        g = Math.round(5.1 * this);
    }
    else {
        g = 255;
        r = Math.round(510 - 5.10 * this);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

//Array make unique
Array.prototype.unique = function () {
    return [...new Set(this)];
}

//Array shuffle
Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
}

//Find last element in array
Array.prototype.last = function () {
    return this[this.length - 1];
}

//Find first element in array
Array.prototype.first = function () {
    return this[0];
}

//Find the max item in an array
Array.prototype.max = function () {
    var obj;
    var maxNum = -Infinity;
    var index = -Infinity;

    for (var i = 0; i < this.length; i++) {
        if (this[i] >= maxNum) {
            maxNum = this[i];
            index = i;
        }
    }
    obj = {
        maxNum: maxNum,
        index: index,
    }
    return obj;
}

//Remove specific element in array
Array.prototype.removeElement = function (elementToRemove) {
    return this.filter(item => item !== elementToRemove);
}

//Remove all items
Array.prototype.removeThese = function (elementsToRemove) {
    return this.filter(item => !elementsToRemove.includes(item));
}

//Console log entire array
Array.prototype.dumpAll = function () {
    console.dir(this, { 'maxArrayLength': null });
}