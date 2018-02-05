require('dotenv').config();
const scrapperLogic = require("./logic/scrapper-logic.js");
const utilService = require("./services/util-service.js");
const envService = require("./services/env-service.js");
const console = require("./services/console.js");
const name = 'odum-notifications';
const port = '3000';

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

async function logic() {
    console.log("app.logic");
    if (!scrapperLogic.isLoggedIn())
        await utilService.asyncWrapper(scrapperLogic.doLogin);
    if (scrapperLogic.isLoggedIn()) {
        let odumsWeb = scrapperLogic.getOdumsWeb();
        let odums = scrapperLogic.mergeOdums(
            odumsWeb,
            scrapperLogic.getOdumsDB(odumsWeb)
        ).sort(scrapperLogic.compareOdumsById);
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
