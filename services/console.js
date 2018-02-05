// Include the logger module
var winston = require('winston');
var envService = require("../services/env-service.js");
var webLogic = require('../logic/web-logic');
// Set up log file. (you can also define size, rotation etc.)
winston.add(winston.transports.File, { filename: 'odum-notifications.log' });
// Overwrite some of the build-in console functions
oldConsole = console;
if (envService.getEnv("LOGGER") === 'db') {
    console.error=webLogic.error;
    console.log=webLogic.info;
    console.info=webLogic.info;
    console.debug=webLogic.debug;
    console.warn=webLogic.warn;
} else {

    console.error=winston.error;
    console.log=winston.info;
    console.info=winston.info;
    console.debug=winston.debug;
    console.warn=winston.warn;
}

console.old = oldConsole

module.exports = console;