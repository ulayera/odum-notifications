const functions = require("./functions.js");

const logic = function () {
    const getOdumsLogic = function() {
        functions.getOdums(function (dataOdums) {
            for (let i = 0; i < dataOdums.length; i++) {
                functions.saveToDB(dataOdums[i], function (objcb) {
                    functions.sendMail(objcb);
                    console.log('Notificando 1 nuevo ODUM: "' + objcb.titulo + '"');
                });
            }
        });
    };

    if (!functions.headers)
        functions.doLogin(function () {
            getOdumsLogic();
        });
    else
        getOdumsLogic();

};

logic();
setInterval(logic, 120000);