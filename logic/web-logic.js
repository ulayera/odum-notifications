var exports = module.exports = {};

const dataService = require("../services/data-service.js");
const utilService = require("../services/util-service.js");

exports.addLog = function (level, str) {
    return dataService.addLog(
        {
            "timestamp" : new Date(),
            "level" : level,
            "message" : str
        }
    );
};

exports.error   = function (str) {
    exports.addLog(2, str);
};
exports.warn    = function (str) {
    exports.addLog(3, str);
};
exports.info    = function (str) {
    exports.addLog(4, str);
};
exports.debug   = function (str) {
    exports.addLog(5, str);
};


exports.getLogs = function () {
    dataService.findAllLogs.apply(this, arguments);
};



