const Promise = require('promise');

const googleSystem = require('../googledocs/google_sheets');
const twitterSystem = require('../twitter_api/twitter_system');

exports.scheduleJob = undefined;
exports.scheduleJobName = 'Tweet Schedule';
exports.scheduleJobRule = '0,30 0-59 * * * *'; // 테스트 중이라 30초 단위로 실행하도록 되어있음, 추후 변경 예정
exports.isWorking = false; // 이미 동작 중인 경우 다른 동작을 하지 않도록 하기 위해.
exports.delay = 0; // 0초에 실행 안되도 되는 경우 delay값을 줘서 정시에 돌아야 하는 스케줄의 cpu확보

async function work() {
    // 이미 동작 중인 경우에 다시 동작하지 않기 위해서.
    if (exports.isWorking === true) return;
    exports.isWorking = true;

    // 스케줄 분산 처리
    if (exports.delay > 0) {
        util.sleep(exports.delay);
    }

    try {
        if (_.isEmpty(oAuthTokenList)) return Promise.resolve();

        let mentionKey = await googleSystem.getDocsData('mention');
        let count = 0;
        if (_.isEmpty(mentionKey)) {
            count = 5;
        }

        for (let i = 0; i < oAuthTokenList.length; ++i) {
            let mentionList = await twitterSystem.getUserMentions(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret, mentionKey, count);
            console.log(mentionList);
            for (let j = 0; j < mentionList.length; ++j) {
                console.log(mentionList[j]);
                if (j === 0) {
                    googleSystem.updateDocsData('mention', mentionList[j].id);
                }
            }
        }
        return Promise.resolve();
    } catch (error) {
        console.error(`[] work Error : ${error}`);
    } finally {
        exports.isWorking = false;
    }
} exports.work = work;