require('dotenv').config();
const console = require("./services/console.js");
const scrapperLogic = require("./logic/scrapper-logic.js");
const webLogic = require("./logic/web-logic.js");
const utilService = require("./services/util-service.js");
const envService = require("./services/env-service.js");
const name = 'odum-notifications';
const port = '3000';

const http = require('http');
const app = new http.Server();

app.on('request', async (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    let logsArray = await utilService.asyncWrapper(webLogic.getLogs);
    logsArray = logsArray.sort(function(a,b){
        if (b.getTime() < a.getTime()) return -1; else if (a.getTime() < b.getTime()) return 1; else return 0;
    });
    for (var i in logsArray) {
        let log = logsArray[i];
        res.write(log.timestamp + '\t' + log.level + '\t' + log.message + '\n');
    }
    res.end('\n');
});
app.listen(port, () => {
    console.log(`${name} is listening on port ${port}`);
});

async function logic() {
    console.log("app.logic");
    if (!scrapperLogic.isLoggedIn())
        await utilService.asyncWrapper(scrapperLogic.doLogin);
    if (scrapperLogic.isLoggedIn()) {
        let odumsWeb = scrapperLogic.getOdumsWeb();
        let odums = await scrapperLogic.mergeOdums(
            odumsWeb,
            scrapperLogic.getOdumsDB(odumsWeb)
        );
        odums = odums.sort(scrapperLogic.compareOdumsById);

        for (var i in odums) {
            let elem = odums[i];
            if (!elem.post)
                await utilService.asyncWrapper(scrapperLogic.getOdumDetails, [elem]);
            if (!elem.wasNotified) {
                await utilService.asyncWrapper(scrapperLogic.sendTelegramMessage, [elem]);
                elem.wasNotified = true;
                elem.fechaModificacion = new Date();
                if (!elem.fechaCreacion)
                    elem.fechaCreacion = elem.fechaModificacion;
                await utilService.asyncWrapper(scrapperLogic.saveToDB, [elem]);
            }
        }
    }
}

logic();
setInterval(logic, parseInt(envService.getEnv("REFRESH_SECONDS")) * 1000);
