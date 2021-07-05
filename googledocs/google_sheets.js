const Promise = require('promise');
const { GoogleSpreadsheet } = require("google-spreadsheet");
const moment = require('moment-timezone');

// 작업을 수행할 Google Spreadsheet 문서의 ID값
const doc = new GoogleSpreadsheet("1R_RrawyXqgZbJyE3UNLYbzRl9DJxpz-ADnvLeq6DzEE");

// Google APIs 페이지에서 생성한 서비스 계정 키의 JSON 파일을 배치한다.
global.creds = require("../docs-api-study-2116de0b173a.json");

global.connectionGoogleDocs = async function () {
    try {
        await doc.useServiceAccountAuth({
            client_email: creds.client_email,
            private_key: creds.private_key
        });
    } catch (error) {
        console.error(`[google_system] connectionGoogleDocs Error: ${error}`);
        return Promise.reject();
    }
};

async function getDocsInfo() {
    try {
        // connectionGoogleDocs();

        await doc.loadInfo(); // loads document properties and worksheets

        console.log(`구글 시트의 제목  : ` + doc.title);

        // await doc.updateProperties({ title: 'renamed doc' });
    } catch (error) {
        console.error(`[google_system] getDocsInfo Error: ${error}`);
        return Promise.reject();
    }
} exports.getDocsInfo = getDocsInfo;

async function updateDocsData(module, updateKey) {
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['tweet-number'];

        let rows = await sheet.getRows();

        for (let i = 0; i < rows.length; ++i) {
            if (rows[i].module === module) {
                rows[i].key = updateKey;
                rows[i].save();
                return Promise.resolve();
            }
        }

        return Promise.resolve();
    } catch (error) {
        console.error(`[google_system] updateDocsData Error: ${error}`);
        return Promise.reject();
    }
} exports.updateDocsData = updateDocsData;

async function getDocsData(module) {
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['tweet-number'];

        let rows = await sheet.getRows();

        for (let i = 0; i < rows.length; ++i) {
            if (rows[i].module === module) {
                return Promise.resolve(rows[i].key);
            }
        }

        return Promise.resolve();

    } catch (error) {
        console.error(`[google_system] getDocsData Error: ${error}`);
        return Promise.reject();
    }
} exports.getDocsData = getDocsData;

/*
 * 2.0.7버전
 * async function getDocsInfo() {
    try {
        doc.useServiceAccountAuth(creds, function (err) {
            doc.getInfo(function (error, info) {
                console.log(info);
                console.log(`구글 시트의 제목  : ` + info.title);
                console.log("구글 시트의 URL  : " + info.id);
                console.log("마지막으로 업데이트된 날짜 및 시간  : " + info.updated);
                console.log("스프레드시트의 생성자 아이디  : " + info.author.name);
                console.log("스프레드시트의 생성자 메일주소  : " + info.author.email);
            });
        });
    } catch (error) {
        console.error(`[google_system] getDocsInfo Error: ${error}`);
        return Promise.reject();
    }
} exports.getDocsInfo = getDocsInfo;

async function updateDocsData(module, updateKey) {
    try {
        let rowsSetting = {
            "offset": 1,
            "limit" : 100
        };
        doc.useServiceAccountAuth(creds, function (err) {
            doc.getRows(Enum.GOOGLE_SHEET_NUMBER.TWEET_NUMBER, rowsSetting, function (error, rows) {
                for (let i = 0; i < rows.length; ++i) {
                    if (rows[i].module === module) {
                        rows[i].key = updateKey;
                        rows[i].save();
                    }
                }
            });
        });
    } catch (error) {
        console.error(`[google_system] updateDocsData Error: ${error}`);
        return Promise.reject();
    }
} exports.updateDocsData = updateDocsData;

async function getDocsData(module) {
    try {
        let rowsSetting = {
            "offset": 1,
            "limit" : 100
        };

        let key = '';
        await doc.useServiceAccountAuth(creds, function (err) {
            doc.getRows(Enum.GOOGLE_SHEET_NUMBER.TWEET_NUMBER, rowsSetting, function (error, rows) {
                for (let i = 0; i < rows.length; ++i) {
                    if (rows[i].module === module) {
                        key = rows[i].key;
                    }
                }
            });
        });
        console.log(key);
    } catch (error) {
        console.error(`[google_system] getDocsData Error: ${error}`);
        return Promise.reject();
    }
} exports.getDocsData = getDocsData;*/