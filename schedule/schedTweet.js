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

            let mentionList = await twitterSystem.getUserMentionList(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret, docsData.key, count);
            for (let j = 0; j < mentionList.length; ++j) {
                console.log(mentionList[j]);
                if (j === 0) {
                    await googleSystem.updateDocsData(oAuthTokenList[i].accessToken, 'mention', mentionList[0].id_str);
                }

                for (let k = 0; k < Enum.ACTION_STRING.length; ++k) {
                    if (mentionList[j].entities.user_mentions.length != 2) continue;
                    let index = mentionList[j].text.indexOf(Enum.ACTION_STRING[k]);
                    // console.log(`${mentionList[j].id_str}, ${mentionList[j].id}, ${index}, ${mentionList[j].text}`);
                    if (index !== NOT_FOUND_INDEX) {
                        // console.log(mentionList[j].entities.user_mentions);
                        let target = '';
                        let userString = `@${mentionList[j].user.screen_name} `;
                        for (const entity of mentionList[j].entities.user_mentions) {
                            if (docsData.id !== entity.screen_name) {
                                userString += `@${entity.screen_name} `;
                                target += ` ${entity.name} `;
                            }
                        }

                        /** TODO : 여기에 원래 docs에서 데이터 긁어와서(user id에 따라 스탯을 저장하는 걸로) 수치 계산하는게 맞지 않나 싶음
                         * 물론 스탯을 작업하기 전에 여러모로 보완해야 할 지점 필요함
                         */
                        let replyData = '';
                        if (mentionList[j].in_reply_to_status_id_str !== null && k !== Enum.ACTION_DATA.END)
                            replyData = await twitterSystem.getUserMentionData(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret, mentionList[j].in_reply_to_status_id_str);
                        if (_.isEmpty(replyData)) continue;

                        switch (k) {
                            case Enum.ACTION_DATA.END:
                                {
                                    await twitterSystem.updateMention(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret,
                                        `${userString}${mentionList[j].user.name}와/과 ${target}의 전투가 종료됩니다. 수고하셨습니다.`, mentionList[j].id_str);
                                    console.log('END...');
                                    break;
                                }
                            case Enum.ACTION_DATA.DEFENCE:
                                {
                                    await twitterSystem.updateMention(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret,
                                        `${userString} ${replyData.user.name}이/가 공격 했지만 ${mentionList[j].user.name}이/가 방어합니다. `, mentionList[j].id_str);
                                    console.log('DEFENCE!!');
                                    break;
                                }
                            case Enum.ACTION_DATA.AVOID:
                                {
                                    await twitterSystem.updateMention(oAuthTokenList[i].accessToken, oAuthTokenList[i].accessSecret,
                                        `${userString} ${replyData.user.name}이/가 공격 했지만 ${mentionList[j].user.name}이/가 회피합니다. `, mentionList[j].id_str);
                                    console.log('AVOID!!');
                                    break;
                                }
                        }
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