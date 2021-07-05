const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());

const path = require('path');
const fs = require('fs');

const TEMPLATE = fs.readFileSync(path.resolve(__dirname, 'client', 'template.html'), { encoding: 'utf-8' });

const {
    getOAuthRequestToken,
    getOAuthAccessTokenWith,
    oauthGetUserById
} = require('../oauth/oauth-utilities');

router.get('/', async (req, res, next) => {
    console.log('/ req.cookies', req.cookies);

    if (!_.isEmpty(req.session.oauthAccessToken)) {
        console.log(req.session);
        // TODO : 인증 성공해서 페이지 새로고침 시 하는 작업이 들어가야 함
        console.log(oAuthTokenList);
    }

    if (req.cookies && req.cookies.twitter_screen_name) {
        console.log('/ authorized', req.cookies.twitter_screen_name);
        return res.send(TEMPLATE.replace('CONTENT', `
        <h1>Hello ${req.cookies.twitter_screen_name}</h1>
        <br>
        <a href="/twitter/logout">logout</a>
      `));
    }
    return next();
});


router.get('/twitter/logout', logout);
function logout(req, res, next) {
    let index = oAuthTokenList.findIndex(data => data.accessToken === oauthAccessToken && data.accessSecret === oauthAccessTokenSecret);
    if (index !== NOT_FOUND_INDEX) {
        oAuthTokenList.splice(index, 1);
    }
    res.clearCookie('twitter_screen_name');
    req.session.destroy(() => res.redirect('/'));
}

router.get('/twitter/authenticate', twitter('authenticate'));
router.get('/twitter/authorize', twitter('authorize'));

function twitter(method = 'authorize') {
    return async (req, res) => {
        console.log(`/twitter/${method}`);
        const { oauthRequestToken, oauthRequestTokenSecret } = await getOAuthRequestToken();
        console.log(`/twitter/${method} ->`, { oauthRequestToken, oauthRequestTokenSecret });

        req.session = req.session || {};
        req.session.oauthRequestToken = oauthRequestToken;
        req.session.oauthRequestTokenSecret = oauthRequestTokenSecret;

        const authorizationUrl = `https://api.twitter.com/oauth/${method}?oauth_token=${oauthRequestToken}`;
        console.log('redirecting user to ', authorizationUrl);
        res.redirect(authorizationUrl);
    }
}

router.get('/twitter/callback', async (req, res) => {
    const { oauthRequestToken, oauthRequestTokenSecret } = req.session;
    const { oauth_verifier: oauthVerifier } = req.query;
    console.log('/twitter/callback', { oauthRequestToken, oauthRequestTokenSecret, oauthVerifier });

    const { oauthAccessToken, oauthAccessTokenSecret, results } = await getOAuthAccessTokenWith({ oauthRequestToken, oauthRequestTokenSecret, oauthVerifier });
    req.session.oauthAccessToken = oauthAccessToken;
    req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;

    const { user_id: userId /*, screen_name */ } = results
    const user = await oauthGetUserById(userId, { oauthAccessToken, oauthAccessTokenSecret });

    req.session.twitter_screen_name = user.screen_name;
    req.session.twitter_user_id = user.id;
    res.cookie('twitter_screen_name', user.screen_name, { maxAge: config.SESSION_MAX_TIME, httpOnly: true });

    console.log('user succesfully logged in with twitter', user.screen_name);

    req.session.save(() => res.redirect('/'));

    let index = oAuthTokenList.findIndex(data => data.accessToken === oauthAccessToken && data.accessSecret === oauthAccessTokenSecret);
    if (index === NOT_FOUND_INDEX) {
        oAuthTokenList.push({ accessToken: oauthAccessToken, accessSecret: oauthAccessTokenSecret });
    }
});

module.exports = router;