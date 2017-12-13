// Include the logger module
var winston = require('winston');
// Set up log file. (you can also define size, rotation etc.)
winston.add(winston.transports.File, { filename: 'odum-notifications.log' });
// Overwrite some of the build-in console functions
console.error=winston.error;
console.log=winston.info;
console.info=winston.info;
console.debug=winston.debug;
console.warn=winston.warn;
module.exports = console;