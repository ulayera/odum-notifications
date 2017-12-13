var exports = module.exports = {};
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
var envService = require("./env-service.js");
const token = envService.getEnv('TELEGRAM_BOT_TOKEN');
const chatId = envService.getEnv('TELEGRAM_BOT_CHAT_ID');
const bot = new TelegramBot(token, {polling: true});
const utilService = require("./util-service.js");
const console = require("./console.js");
var envService = require("./env-service.js");
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

exports.sendTelegramMessage = function (obj, callback) {
    console.log("exports.sendTelegramMessage");
    let body = obj.titulo + '\n' + ((obj.post) ? obj.post : obj.desc);
    let listChatid = chatId.split(',');
    for (let i = 0; i < listChatid.length; i++) {
        bot.sendMessage(listChatid[i], body);
    }
    if (callback)
        callback(obj);
};
