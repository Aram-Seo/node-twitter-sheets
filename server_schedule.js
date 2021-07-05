const Promise = require('promise');
const schedule = require('node-schedule-tz');
const moment = require('moment-timezone');

function ServerStart() {
    moment.tz.setDefault('Asia/Seoul');

    global._ = require('underscore');
    global.util = require('./public/util');

} exports.ServerStart = ServerStart;

const listenstart = function () {
    // 스케줄 리스트
    let scheduleList = [];
    const schedTweet = require('./schedule/schedTweet');
    scheduleList.push(schedTweet);

    for (let schedItem of scheduleList) {
        if (_.isUndefined(schedItem.scheduleJob)) {
            console.log(`========== 스케줄러 실행 rule : ${schedItem.scheduleJobRule} / name : ${schedItem.scheduleJobName}`);
            schedItem.scheduleJob = schedule.scheduleJob(schedItem.scheduleJobName, schedItem.scheduleJobRule, 'Asia/Seoul', schedItem.work);
        }
    }
}; exports.listenstart = listenstart;