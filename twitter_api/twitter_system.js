const needle = require('needle');
const oauthSignature = require('oauth-signature');
const crypto = require('crypto');

const METHOD_POST = 'POST';
const METHOD_GET = 'GET';

function getEncodeParameter(parameters) {
    let ordered = {};
    Object.keys(parameters).sort().forEach(function (key) {
        ordered[key] = parameters[key];
    });

    let encodedParameters = '';
    for (k in ordered) {
        const encodedKey = encodeURIComponent(k);
        const encodedValue = (typeof ordered[k] === 'object' ? getEncodeParameter('.' + ordered[k]) : escape(ordered[k]));
        encodedParameters += ((encodedParameters === '' ? '' : '&') + encodeURIComponent(`${encodedKey}=${encodedValue}`));
    }

    return encodedParameters;
}

function getOauthSignature(method, parameter, url, signingKey) {
    const encodeUrl = encodeURIComponent(url);

    let encodedParameters = encodeURIComponent(parameter);

    const signatureBaseString = `${method}&${encodeUrl}&${encodedParameters}`;

    const oauthSignature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest().toString('base64');

    const encodeOauthSignature = encodeURIComponent(oauthSignature);

    return encodeOauthSignature;
}

function makeAuthorizationOAuth(method, queryParameters, url, accessToken, tokenSecret) {
    // 패킷 인증을 위한 Authorization 함수
    let oAuthTimestamp = Math.floor(util.getCurrentTime() / 1000);
    let oAuthNonce = util.generateRandomString(32);

    const parameters = {
        ...queryParameters,
        oauth_consumer_key: config.TWITTER_API_KEY,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: oAuthTimestamp,
        oauth_nonce: oAuthNonce,
        oauth_token: accessToken,
        oauth_version: "1.0"
    };

    console.log(parameters);

    let oAuthSignature = oauthSignature.generate(method, url, parameters, config.TWITTER_API_SECRET_KEY, tokenSecret);
    console.log({ oAuthSignature });

    let oAuthStr = `OAuth oauth_consumer_key="${parameters.oauth_consumer_key}", oauth_nonce="${parameters.oauth_nonce}", `
        + `oauth_signature="${oAuthSignature}", oauth_signature_method="${parameters.oauth_signature_method}", `
        + `oauth_timestamp="${parameters.oauth_timestamp}", oauth_token="${parameters.oauth_token}", oauth_version="${parameters.oauth_version}"`;

    console.log({ oAuthStr });
    return oAuthStr;
};

/**
 * 멘션 목록을 가져오는 함수
 * @name getUserMentions
 * @param {string} OAuthToken
 * @param {string} OAuthTokenSecret
 * @param {string} since_id 멘션 리스트의 시작 값
 * @param {number} count 기본값으로 0을 가지고 있음
 */
async function getUserMentions(OAuthToken, OAuthTokenSecret, since_id, count = 0) {
    const url = `https://api.twitter.com/1.1/statuses/mentions_timeline.json`;
    let params = {
        count: count,
        since_id: Number(since_id),
    };

    if (count === 0)
        delete params.count;
    if (params.since_id == 0)
        delete params.since_id;

    console.log(params);
    let authorization = makeAuthorizationOAuth(METHOD_GET, params, url, OAuthToken, OAuthTokenSecret);

    const options = {
        headers: {
            'authorization': authorization,
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };

    const resp = await needle(METHOD_GET, url, params, options);

    if (resp.statusCode != 200) {
        console.log(`${resp.statusCode} ${resp.statusMessage}:`);
        console.log(resp.body);
    } else {
        /*console.log(`MENTION COUNT: ${resp.body.length}`);
        for (const data of resp.body) {
            // console.log(`text: ${data.text}`);
            console.log(data);
            console.log(data.entities.user_mentions);
        }*/

        return Promise.resolve(resp.body);
    }

} exports.getUserMentions = getUserMentions;

/**
 * 트윗 & 멘션 하기
 * @name updateMention
 * @param {string} OAuthToken
 * @param {string} OAuthTokenSecret
 * @param {string} text 트윗 내용(멘션일 경우 @id가 들어가야 함)
 * @param {string} replyIdStr 멘션을 할 경우 정확한 id_str을 넣어줘야 함. 아닐 경우 퍼블로 올라감.
 */
async function updateMention(OAuthToken, OAuthTokenSecret, text, replyIdStr = '') {
    const url = `https://api.twitter.com/1.1/statuses/update.json`;
    let params = {
        status: text, // status에 () 괄호가 들어가는 순간 제대로 처리되지 않음. 주의 필요
        in_reply_to_status_id: replyIdStr,
    };

    // console.log(params);

    let authorization = makeAuthorizationOAuth(METHOD_POST, params, url, OAuthToken, OAuthTokenSecret);

    const options = {
        headers: {
            'authorization': authorization,
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };

    const resp = await needle(METHOD_POST, url, params, options);

    if (resp.statusCode != 200) {
        console.log(`${resp.statusCode} ${resp.statusMessage}:`);
        console.log(resp.body);
    } else {
        // console.log(resp.body);
        console.log('MENTION SUCCESS!');
    }

} exports.updateMention = updateMention;

/**
 * 해당 함수는 현재 oAuth-signature오류로 인하여 사용이 불가합니다.
 * @name createDirectMessage
 * @param {any} OAuthToken
 * @param {any} OAuthTokenSecret
 */
async function createDirectMessage(OAuthToken, OAuthTokenSecret) { 
    const url = `https://api.twitter.com/1.1/direct_messages/events/new.json`;
    let params = {
        event: {
            message_create: {
                message_data: {
                    text: 'test DM02'
                }, 
                target: {
                    recipient_id : 4717825352
                }
            },
            type: 'message_create', 
        }
    };

    let authorization = makeAuthorizationOAuth(METHOD_POST, params, url, OAuthToken, OAuthTokenSecret);

    const options = {
        headers: {
            'authorization': authorization,
            'Content-Type': 'application/json',
        }
    };

    const resp = await needle(METHOD_POST, url, params, options);

    if (resp.statusCode != 200) {
        console.log(`${resp.statusCode} ${resp.statusMessage}:`);
        console.log(resp.body);
    } else {
        console.log(resp.body);
    }

} exports.createDirectMessage = createDirectMessage;

/**
 * 특정 DM 가져오는 함수
 * @name getDirectMessage
 * @param {any} OAuthToken
 * @param {any} OAuthTokenSecret
 * @param {any} id
 */
async function getDirectMessage(OAuthToken, OAuthTokenSecret, id) {
    const url = 'https://api.twitter.com/1.1/direct_messages/events/show.json';
    let params = {
        id: id
    };

    let authorization = makeAuthorizationOAuth(METHOD_GET, params, url, OAuthToken, OAuthTokenSecret);

    const options = {
        headers: {
            'authorization': authorization,
            'Content-Type': 'application/json',
        }
    };

    const resp = await needle(METHOD_GET, url, params, options);

    if (resp.statusCode != 200) {
        console.log(`${resp.statusCode} ${resp.statusMessage}:`);
        console.log(resp.body);
    } else {
        console.log(resp.body);
    }

} exports.getDirectMessage = getDirectMessage;

/**
 * DM 리스트를 가져오는 함수 (해당 함수는 페이지를 이용하기 때문에 사용시 주의 필요)
 * @name getDirectMessageList
 * @param {any} OAuthToken
 * @param {any} OAuthTokenSecret
 */
async function getDirectMessageList(OAuthToken, OAuthTokenSecret) {
    const url = `https://api.twitter.com/1.1/direct_messages/events/list.json`;
    let params = {};

    let authorization = makeAuthorizationOAuth(METHOD_GET, params, url, OAuthToken, OAuthTokenSecret);

    const options = {
        headers: {
            'authorization': authorization,
            'Content-Type': 'application/json',
        }
    };

    const resp = await needle(METHOD_GET, url, params, options);

    if (resp.statusCode != 200) {
        console.log(`${resp.statusCode} ${resp.statusMessage}:`);
        console.log(resp.body);
    } else {
        for (const data of resp.body.events) {
            console.log(data.id);
            console.log(data.message_create);
        }
    }

} exports.getDirectMessageList = getDirectMessageList;

