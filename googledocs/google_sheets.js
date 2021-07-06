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

async function updateDocsData(oAuthToken, module, updateKey) {
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['tweet-number'];

        let rows = await sheet.getRows();

        for (let i = 0; i < rows.length; ++i) {
            if (rows[i].token === oAuthToken && rows[i].module === module) {
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

async function getDocsData(oAuthToken, module) {
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['tweet-number'];

        let rows = await sheet.getRows();

        for (let i = 0; i < rows.length; ++i) {
            if (rows[i].token === oAuthToken && rows[i].module === module) {
                return Promise.resolve({ key: rows[i].key, id: rows[i].id });
            }
        }

        // 여기까지 오면 맞는 토큰이 없다는 것임
        await sheet.addRow({ token: oAuthToken, module: module, key: 0 });

        return Promise.resolve();

    } catch (error) {
        console.error(`[google_system] getDocsData Error: ${error}`);
        return Promise.reject();
    }
} exports.getDocsData = getDocsData;
