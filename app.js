const httpService = require("./services/http-service.js");
const dataService = require("./services/data-service.js");
const mailService = require("./services/mail-service.js");
const utilService = require("./services/util-service.js");
const async = require("async");
const http = require('http');
const name = 'odum-notifications';
const port = '3000';
const app = new http.Server();
app.on('request', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Server is UP');
    res.end('\n');
});
app.listen(port, () => {
    console.log(`${name} is listening on port ${port}`);
});

const logic = function () {
    const getOdumsLogic = function() {
        httpService.getOdums(function (odumsWeb) {
            dataService.getOdumsByIdlist(utilService.toIdArray(odumsWeb), function (odumsDb) {
                let odumsMerged = utilService.mergeOdums(odumsWeb, odumsDb);
                async.eachSeries(odumsMerged, function (elem, callbackAsync) {
                    var notifyLogic = function (elem) {
                        if (!elem.wasNotified) {
                            console.log("Notificando odum " + elem._id);
                            mailService.sendMail(elem, function (odum) {
                                odum.wasNotified = true;
                                odum.fechaModificacion = new Date();
                                dataService.saveToDB(odum, function () {
                                    callbackAsync(null);
                                })
                            });
                        } else {
                            callbackAsync(null);
                        }
                    };
                    if (!elem.post) {
                        httpService.getOdumDetails(elem, function (elem) {
                            notifyLogic(elem);
                        });
                    } else {
                        notifyLogic(elem);
                    }
                }, function () {
                    console.log("Finalizado OK");
                });
            })
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
setInterval(logic, 180000);
setInterval(function () {
    httpService.keepAlive(function (data) {
        console.log(data);
    });
}, 1750000);