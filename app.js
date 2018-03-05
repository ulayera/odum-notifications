require('dotenv').config();
const scrapperLogic = require("./logic/scrapper-logic.js");
const name = 'odum-notifications';
const port = '3000';

const http = require('http');
const app = new http.Server();

app.on('request', async (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    let logsArray = await scrapperLogic.utilService.asyncWrapper(scrapperLogic.webLogic.getLogs);
    // logsArray = logsArray.sort(scrappingLogic.compareDates);
    for (var i in logsArray) {
        let log = logsArray[i];
        res.write(log.timestamp + '\t' + log.level + '\t' + log.message + '\n');
    }
    res.end('\n');
});
app.listen(port, () => {
    console.log(`${name} is listening on port ${port}`);
});

async function chwLogic(foro) {
    if (!scrapperLogic.isLoggedIn())
        await scrapperLogic.utilService.asyncWrapper(scrapperLogic.doLogin);
    if (scrapperLogic.isLoggedIn()) {
        let odumsWeb = await scrapperLogic.getOdumsWeb(foro);
        let odumsDB = await scrapperLogic.getOdumsDB(odumsWeb);
        let odums = scrapperLogic.mergeOdums(
            odumsWeb,
            odumsDB
        );
        for (var i in odums) {
            let elem = odums[i];
            if (!elem.post)
                await scrapperLogic.utilService.asyncWrapper(scrapperLogic.getOdumDetails, [elem]);
            if (!elem.wasNotified) {
                await scrapperLogic.utilService.asyncWrapper(scrapperLogic.sendTelegramMessage, [elem]);
                elem.wasNotified = true;
                elem.fechaModificacion = new Date();
                if (!elem.fechaCreacion)
                    elem.fechaCreacion = elem.fechaModificacion;
                await scrapperLogic.utilService.asyncWrapper(scrapperLogic.saveToDB, [elem]);
            }
        }
    }
}

function logic() {
  chwLogic("odums");
  chwLogic("papas");
}

logic();
setInterval(logic, parseInt(scrapperLogic.envService.getEnv("REFRESH_SECONDS")) * 1000);
