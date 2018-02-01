require('dotenv').config();
const httpService = require("./services/http-service.js");
const dataService = require("./services/data-service.js");
const utilService = require("./services/util-service.js");
const envService = require("./services/env-service.js");
const console = require("./services/console.js");
const async = require("async");
const name = 'odum-notifications';
const port = '3000';
console.log(envService.getEnv("NODE_ENV"));

const http = require('http');
const app = new http.Server();

app.on('request', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Server is UP');
    res.end('\n');
});
app.listen(port, () => {
    console.log(`${name} is listening on port ${port}`);
});

const logic = function () {
    console.log("Iniciando scrapping...");
    const getOdumsLogic = function () {
        httpService.getOdums(function (odumsWeb) {
            dataService.getOdumsByIdlist(utilService.toIdArray(odumsWeb), function (odumsDb) {
                    let odumsMerged = utilService.mergeOdums(odumsWeb, odumsDb).sort(utilService.compareOdumsById);
                    async.eachSeries(odumsMerged, function (elem, callbackAsync) {
                        var notifyLogic = function (elem, cbArg) {
                            if (!elem.wasNotified) {
                                httpService.sendTelegramMessage(elem, function (elem) {
                                    elem.wasNotified = true;
                                    if (!elem.fechaCreacion)
                                        elem.fechaCreacion = new Date();
                                    elem.fechaModificacion = new Date();
                                    dataService.saveToDB(elem, function () {
                                        cbArg(null);
                                    });
                                });
                            } else {
                                cbArg(null);
                            }
                        };
                        if (!elem.post) {
                            httpService.getOdumDetails(elem, function (elem) {
                                notifyLogic(elem, callbackAsync);
                            });
                        } else {
                            notifyLogic(elem, callbackAsync);
                        }
                    }, function () {
                        console.log("Finalizado OK");
                    });
            });
        });
    };
    if (!httpService.headers)
        httpService.doLogin(function () {
            getOdumsLogic();
        });
    else
        getOdumsLogic();
};

logic();
setInterval(logic, parseInt(envService.getEnv("REFRESH_SECONDS"))*1000);
