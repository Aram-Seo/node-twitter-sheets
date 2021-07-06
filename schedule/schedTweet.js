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

        for (let i = 0; i < oAuthTokenList.length; ++i) {
            let docsData = await googleSystem.getDocsData(oAuthTokenList[i].accessToken, 'mention');
            let count = 0;
            if (_.isEmpty(docsData.key) || docsData.key == 0) {
                count = 10;
                docsData.key = 0;
            }

            let mentionList = await twitterSystem.getUserMentions(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret, docsData.key, count);
            for (let j = 0; j < mentionList.length; ++j) {
                console.log(mentionList[j]);
                if (j === 0) {
                    await googleSystem.updateDocsData(oAuthTokenList[i].accessToken, 'mention', mentionList[0].id_str);
                }

                for (let k = 0; k < Enum.ACTION_STRING.length; ++k) {
                    if (mentionList[j].entities.user_mentions.length != 2) continue;
                    let index = mentionList[j].text.indexOf(Enum.ACTION_STRING[k]);
                    //console.log(`${mentionList[j].id_str}, ${mentionList[j].id}, ${index}, ${mentionList[j].text}`);
                    if (index !== NOT_FOUND_INDEX) {
                        console.log(mentionList[j].entities.user_mentions);
                        let target = '';
                        let userString = `@${mentionList[j].user.screen_name} `;
                        for (const entity of mentionList[j].entities.user_mentions) {
                            if (docsData.id !== entity.screen_name) {
                                userString += `@${entity.screen_name} `;
                                target += ` ${entity.name} `;
                            }
                        }
                        switch (k) {
                            case Enum.ACTION_DATA.ATTACK:
                                console.log('ATTACK!!');
                                await twitterSystem.updateMention(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret,
                                    `${userString}${mentionList[j].user.name}이/가 ${target}을/를 공격합니다. + ${moment().valueOf()}`, mentionList[j].id_str);
                                break;
                            case Enum.ACTION_DATA.DEFENCE:
                                await twitterSystem.updateMention(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret,
                                    `${userString}${mentionList[j].user.name}이/가 ${target}의 공격을 방어합니다. + ${moment().valueOf()}`, mentionList[j].id_str);
                                console.log('DEFENCE!!');
                                break;
                            case Enum.ACTION_DATA.AVOID:
                                await twitterSystem.updateMention(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret,
                                    `${userString}${mentionList[j].user.name}이/가 ${target}의 공격을 회피합니다. + ${moment().valueOf()}`, mentionList[j].id_str);
                                console.log('AVOID!!');
                                break;
                        }
                        /*await twitterSystem.updateMention(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret,
                            `@${mentionList[j].user.screen_name} ${mentionList[j].user.name}가 공격합니다 + ${moment().valueOf()}`, mentionList[j].id_str);
                        util.sleep(1000);*/
                    }
                }
            }
        }

        // console.log(Number(mentionKey), typeof Number(mentionKey));
        return Promise.resolve();
    } catch (error) {
        console.error(`[] work Error : ${error}`);
    } finally {
        exports.isWorking = false;
    }
} exports.work = work;