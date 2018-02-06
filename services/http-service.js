var exports = module.exports = {};
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
var envService = require("./env-service.js");
const dataService = require("./data-service.js");
const token = envService.getEnv('TELEGRAM_BOT_TOKEN');
const pass = envService.getEnv('REGISTER_PASS');
const bot = new TelegramBot(token, {polling: true});
const utilService = require("./util-service.js");
const sensitive = {
    "forum" : {
        "vb_login_md5password" : envService.getEnv('FORUM_MD5PASS'),
        "vb_login_md5password_utf" : envService.getEnv('FORUM_MD5PASS'),
        "s" : envService.getEnv('FORUM_S'),
        "vb_login_username" : envService.getEnv('FORUM_USER')
    }
};
let login_post_data = `do=login&vb_login_md5password=${sensitive.forum.vb_login_md5password}&vb_login_md5password_utf=${sensitive.forum.vb_login_md5password_utf}&` +
    `s=${sensitive.forum.s}&securitytoken=guest&url=%2Fforo%2Fforumdisplay.php%3Ff%3D168&vb_login_username=${sensitive.forum.vb_login_username}&vb_login_password=&cookieuser=1`;

exports.headers = null;

exports.doLogin = function (cb) {
    var post_options = {
        host: 'www.chw.net',
        port: '80',
        path: '/foro/login.php?do=login',
        method: 'POST',
        headers: {
            "accept-language" : "en",
            "Content-Length" : Buffer.byteLength(login_post_data),
            "upgrade-insecure-requests" : "1",
            "user-agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3221.0 Safari/537.36",
            "content-type" : "application/x-www-form-urlencoded",
            "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "cache-control" : "no-cache"
        }
    };

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            exports.headers = res.headers;
        }).on('end', function() {
            cb(true);
        });
    });
    post_req.on('error', function(err) {
        if (err) {
            console.error(err);
            cb(err);
        }
    });
    post_req.write(login_post_data);
    post_req.end();
};

exports.getOdums = function (cb) {
    var strCookies = "";
    for (var i = 0; i < exports.headers["set-cookie"].length; i++)
        strCookies += exports.headers["set-cookie"][i] + "; ";
    var options = {
        host: 'www.chw.net',
        port: '80',
        path: '/foro/ofertas-ultimo-minuto/?pp=10&daysprune=-1&sort=dateline&prefixid=&order=desc',
        method: 'GET',
        headers: {
            "accept-language": "en",
            "upgrade-insecure-requests": "1",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3221.0 Safari/537.36",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "cookie": strCookies,
            "connection": "keep-alive"
        }
    };
    var req = http.get(options, function(res) {
        var bodyChunks = [];
        res.on('data', function(chunk) {
            bodyChunks.push(chunk);
        }).on('end', function() {
            cb(Buffer.concat(bodyChunks).toString('latin1'));
        });
    });
    req.on('error', function(e) {
        console.error(e);
        cb(e);
    });
};

exports.getOdumDetails = function (cb, obj) {
    var urlObj = utilService.splitUrl(obj.url);
    var strCookies = "";
    for (var i = 0; i < exports.headers["set-cookie"].length; i++)
        strCookies += exports.headers["set-cookie"][i] + "; ";
    var options = {
        host: urlObj.hostname ,
        port: '80',
        path: urlObj.pathname,
        method: 'GET',
        headers: {
            "accept-language": "en",
            "upgrade-insecure-requests": "1",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3221.0 Safari/537.36",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "cookie": strCookies,
            "connection": "keep-alive"
        }
    };
    var req = http.get(options, function(res) {
        var bodyChunks = [];
        //res.setEncoding('utf8');
        res.on('data', function(chunk) {
            bodyChunks.push(chunk);
        }).on('end', function() {
            var body = Buffer.concat(bodyChunks).toString('latin1');
            obj.post = utilService.parseaHTMLOdumDetails(body);
            if (cb)
                cb(obj);
        });
    });
    req.on('error', function(e) {
        console.log('ERROR: ' + e.message);
    });
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Escribe '/register {pass}' para registrarte.");
});

bot.onText(/\/register (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    const text = "Ahora recibirás notificaciones con ofertas, para desuscribirte escribe /deregister";
    if (resp === pass)
        await dataService.saveRecipient(function () {
            bot.sendMessage(chatId, "Bienvenido " +
                ((msg.from.first_name) ? " " + msg.from.first_name : "")  +
                ((msg.from.last_name) ? " " + msg.from.last_name : "")  +
                "! " + text);
        }, {
            "_id" : chatId,
            "chatId" : chatId,
            "username" : msg.from.username,
            "firstName" : msg.from.first_name,
            "lastName" : msg.from.last_name
        });
    else {
        bot.sendMessage(chatId, "Pass incorrecta.");
    }
});


bot.onText(/\/deregister/, (msg, match) => {
    const chatId = msg.chat.id;
        dataService.deleteRecipient({
            "_id" : chatId,
            "chatId" : chatId
        }, function () {
            bot.sendMessage(chatId, "Desuscrito OK");
        });
});

exports.sendTelegramMessage = function (cb, obj) {
    let body = obj.titulo + '\n' + ((obj.post) ? obj.post : obj.desc);
    dataService.findAllRecipients(async function (recipients) {
        for (var i in recipients) {
            await bot.sendMessage(recipients[i].chatId, body);
            cb(obj);
        }
    });
};

