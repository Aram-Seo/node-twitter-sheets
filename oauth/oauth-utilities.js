const oauth = require('oauth');

const { promisify } = require('util');

const oauthConsumer = new oauth.OAuth(
    'https://twitter.com/oauth/request_token', 'https://twitter.com/oauth/access_token',
    config.TWITTER_API_KEY,
    config.TWITTER_API_SECRET_KEY,
    '1.0A', 'http://127.0.0.1:3000/twitter/callback', 'HMAC-SHA1');

async function oauthGetUserById (userId, { oauthAccessToken, oauthAccessTokenSecret } = {}) {
    return promisify(oauthConsumer.get.bind(oauthConsumer))(`https://api.twitter.com/1.1/users/show.json?user_id=${userId}`, oauthAccessToken, oauthAccessTokenSecret)
        .then(body => JSON.parse(body));
} exports.oauthGetUserById = oauthGetUserById;

async function getOAuthAccessTokenWith ({ oauthRequestToken, oauthRequestTokenSecret, oauthVerifier } = {}) {
    return new Promise((resolve, reject) => {
        oauthConsumer.getOAuthAccessToken(oauthRequestToken, oauthRequestTokenSecret, oauthVerifier, function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
            return error
                ? reject(new Error('Error getting OAuth access token'))
                : resolve({ oauthAccessToken, oauthAccessTokenSecret, results });
        });
    });
} exports.getOAuthAccessTokenWith = getOAuthAccessTokenWith;

async function getOAuthRequestToken () {
    return new Promise((resolve, reject) => {
        oauthConsumer.getOAuthRequestToken(function (error, oauthRequestToken, oauthRequestTokenSecret, results) {
            return error
                ? reject(new Error('Error getting OAuth request token'))
                : resolve({ oauthRequestToken, oauthRequestTokenSecret, results });
        });
    });
} exports.getOAuthRequestToken = getOAuthRequestToken;