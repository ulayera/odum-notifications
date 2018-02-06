var exports = module.exports = {};

exports.webLogic = require("../logic/web-logic.js");
exports.httpService = require("../services/http-service.js");
exports.dataService = require("../services/data-service.js");
exports.utilService = require("../services/util-service.js");
exports.envService = require("../services/env-service.js");

exports.isLoggedIn = function () {
    return exports.httpService.headers !== null;
};

exports.getOdumsWeb = async function () {
    let odumsWebRaw = await exports.utilService.asyncWrapper(exports.httpService.getOdums);
    return exports.utilService.parseaHTMLOdums(odumsWebRaw);
};

exports.getOdumsDB = async function (odumsWeb) {
    return await exports.utilService.asyncWrapper(exports.dataService.getOdumsByIdlist, [exports.utilService.toIdArray(odumsWeb)]);
};

exports.doLogin = function () {
    return exports.httpService.doLogin.apply(null, arguments);
};

exports.mergeOdums = function () {
    return exports.utilService.mergeOdums.apply(null, arguments);
};

exports.compareOdumsById = function () {
    return exports.utilService.compareOdumsById.apply(null, arguments);
};

exports.compareDates = function () {
    return exports.utilService.compareDates.apply(null, arguments);
};

exports.getOdumDetails = function () {
    return exports.httpService.getOdumDetails.apply(null, arguments);
};

exports.sendTelegramMessage = async function () {
    return await exports.httpService.sendTelegramMessage.apply(null, arguments);
};

exports.saveToDB = async function () {
    return await exports.dataService.saveToDB.apply(null, arguments);
};