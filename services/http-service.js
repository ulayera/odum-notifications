var exports = module.exports = {};
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
var envService = require("./env-service.js");
const dataService = require("./data-service.js");
const token = envService.getEnv('TELEGRAM_BOT_TOKEN');
const pass = envService.getEnv('REGISTER_PASS');
const chatId = envService.getEnv('TELEGRAM_BOT_CHAT_ID');
const bot = new TelegramBot(token, {polling: true});
const utilService = require("./util-service.js");
const console = require("./console.js");
const { URL } = require('url');
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

exports.doLogin = function (callback) {
    console.log("exports.doLogin");
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
            if (callback)
                callback();
        })
    });

    post_req.write(login_post_data);
    post_req.end();
};

exports.getOdums = function (cb) {
    var result = true;
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
        //res.setEncoding('utf8');
        res.on('data', function(chunk) {
            bodyChunks.push(chunk);
        }).on('end', function() {
            var body = Buffer.concat(bodyChunks).toString('latin1');
            cb(utilService.parseaHTMLOdums(body));
        });
    });
    req.on('error', function(e) {
        console.log('ERROR: ' + e.message);
    });
};


exports.getOdumDetails = function (obj, cb) {
    var urlObj = utilService.splitUrl(obj.url);
    console.log("exports.getOdumDetails: " + obj.url);
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
    bot.sendMessage(chatId, "Use '/register {pass}' to register.");
});

bot.onText(/\/register (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    const text = "Ahora recibirás notificaciones con ofertas, para desuscribirte escribe /deregister";
    if (resp === pass)
        dataService.saveRecipient({
            "_id" : chatId,
            "chatId" : chatId,
            "firstName" : msg.from.first_name,
            "lastName" : msg.from.last_name
        }, function () {
            bot.sendMessage(chatId, "Bienvenido " + msg.from.first_name + " " + msg.from.last_name + "! " + text);
            console.log("exports.register ok " + chatId);
        });
    else {
        console.log("exports.register nook " + chatId);
        bot.sendMessage(chatId, "Wrong password.");
    }
});


bot.onText(/\/deregister/, (msg, match) => {
    const chatId = msg.chat.id;
    console.log("exports.deregister " + chatId);
        dataService.deleteRecipient({
            "_id" : chatId,
            "chatId" : chatId
        }, function () {
            bot.sendMessage(chatId, "Desuscrito OK");
        });
});

exports.sendTelegramMessage = function (obj, callback) {
    console.log("exports.sendTelegramMessage");
    let body = obj.titulo + '\n' + ((obj.post) ? obj.post : obj.desc);
    dataService.findAllRecipients(null, function ( recipients) {
        for (var i in recipients)
            bot.sendMessage(recipients[i].chatId, body);
    });
    if (callback)
        callback(obj);
};

