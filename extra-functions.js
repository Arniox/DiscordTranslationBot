module.exports = {
    //Random
    siteRand: function (high, low) {
        return Math.random() * (high - low) + low;
    },
    //Maps to Math.ceil
    ceil: function (num) {
        return Math.ceil(num);
    },
    //Maps to Math.floor
    floor: function (num) {
        return Math.floor(num);
    },
    //Matches in array
    matchInArray: function (string, expressions) {
        if (expression.length == 0) {
            return string.match(expressions);
        } else {
            for (var i = 0; i < expressions.length; ++i) {
                if (string.match(expressions[i])) {
                    return true;
                }
            }
        }
    },
    //Remove from mathes
    removeByMatches: function (string, expressions) {
        if (expressions.length == 0) {
            return string.replace(expressions, "");
        } else {
            var outPut = '';
            for (var i = 0; i < expressions.length; ++i) {
                outPut += string.replace(expressions[i], "");
            }
        }
    },
    //Randomly grab a number of elements from an array
    getRandomFromArray: function (arr, n) {
        return arr.sort(() => Math.random() - Math.random()).slice(0, n);
    },
    //Randomly grab a number of elements from
    getRandomFromColl: function (arr, n) {
        var result = new Array(n),
            len = arr.size,
            taken = new Array(len);
        if (n > len)
            return arr;
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }
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

//Format the string seconds to the full HHMMSS time format
String.prototype.toHHMMSS = function (en = false) {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = (!en ? "0" : "") + hours; }
    if (minutes < 10) { minutes = (!en ? "0" : "") + minutes; }
    if (seconds < 10) { seconds = (!en ? "0" : "") + seconds; }

    if (!en) {
        return hours + ':' + minutes + ':' + seconds;
    } else {
        return hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds';
    }
}

//Cut string shorter
String.prototype.trimString = function (length, eclipse = '...') {
    return this.length > length ?
        this.substring(0, length - (eclipse.length + 1)) + eclipse :
        this;
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