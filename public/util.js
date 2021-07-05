global.moment = require('moment-timezone');
const uuid = require('uuid');

const util = exports;

util.getCurrentTime = function () {
    return moment().valueOf();
};

util.getUuidV1 = function () {
    return uuid.v1();
};

util.getUuidV4 = function () {
    return uuid.v4();
};

util.generateRandomString = function (num) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
exports.sleep = sleep;