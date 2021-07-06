global.nullstring = '';
global.SUCCESS = 1;
global.NOT_FOUND_INDEX = -1;
global.oAuthTokenList = [];

const GOOGLE_SHEET_NUMBER = {
    TWEET_NUMBER: 1,
}; exports.GOOGLE_SHEET_NUMBER = GOOGLE_SHEET_NUMBER;

const ACTION_STRING = ['공격', '방어', '회피']; exports.ACTION_STRING = ACTION_STRING;

const ACTION_DATA = {
    ATTACK: 0,
    DEFENCE: 1,
    AVOID: 2, // 회피
}; exports.ACTION_DATA = ACTION_DATA;