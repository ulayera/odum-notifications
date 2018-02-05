var exports = module.exports = {};

const httpService = require("../services/http-service.js");
const dataService = require("../services/data-service.js");
const utilService = require("../services/util-service.js");
const envService = require("../services/env-service.js");

exports.isLoggedIn = function () {
    return httpService.headers !== null;
};

exports.getOdumsWeb = async function () {
    let odumsWebRaw = await utilService.asyncWrapper(httpService.getOdums);
    return utilService.parseaHTMLOdums(odumsWebRaw);
};


exports.getOdumsDB = async function (odumsWeb) {
    return await utilService.asyncWrapper(dataService.getOdumsByIdlist, [utilService.toIdArray(odumsWeb)]);
};

exports.doLogin = function () {
    return httpService.doLogin.apply(null, arguments);
};

exports.mergeOdums = function () {
    return utilService.mergeOdums.apply(null, arguments);
};

exports.compareOdumsById = function () {
    return utilService.compareOdumsById.apply(null, arguments);
};

exports.getOdumDetails = function () {
    return httpService.getOdumDetails.apply(null, arguments);
};

exports.sendTelegramMessage = function () {
    return httpService.sendTelegramMessage.apply(null, arguments);
};

exports.saveToDB = function () {
    return dataService.saveToDB.apply(null, arguments);
};