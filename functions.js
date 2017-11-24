var exports = module.exports = {};
var http = require('http');
var fs = require('fs');
var cheerio = require("cheerio");
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
const sendmail = require('sendmail')({"silent":true});
var sensitive = require('./sensitive.json');
var url = `mongodb://${sensitive.db.user}:${sensitive.db.password}@${sensitive.db.host}:${sensitive.db.port}/${sensitive.db.dbname}`;
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
    console.log("exports.getOdums");
    var result = true;
    var strCookies = "";
    for (var i = 0; i < exports.headers["set-cookie"].length; i++)
        strCookies += exports.headers["set-cookie"][i] + "; ";
    var options = {
        host: 'www.chw.net',
        port: '80',
		path: '/foro/ofertas-ultimo-minuto/?pp=100&daysprune=-1&sort=dateline&prefixid=&order=desc',
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
            cb(exports.parseaBody(body));
        });
    });
    req.on('error', function(e) {
        console.log('ERROR: ' + e.message);
    });
};

exports.parseaBody = function (body) {
    const $ = cheerio.load(body);
    var output = [];
    var hilos = $("#threads li");
    for (var i = 0; i < hilos.length; i++) {
        const $ = cheerio.load(hilos[i]);
        try {
            var obj = {
                "_id" : hilos[i].attribs.id.split('_')[1],
                "autor" : $("a.username")[0].children[0].data,
                "titulo" : $("a.title")[0].children[0].data,
                "desc" :  $("div.threadinfo")[0].attribs.title,
                "url" :  $("a.title")[0].attribs.href
            };
            output.push(obj);
        } catch (e) {
        }
    }
    return output;
};

exports.printToFile = function (body) {
    console.log("exports.printToFile");
    fs.writeFile("result.json", body, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
};

exports.saveToDB = function(obj, callback){
    //console.log("exports.saveToDB");
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('odums');
        var notificar = false;
        collection.updateOne({ _id : obj._id }, obj, { upsert : true }, function (err, result) {
            if (result.result.hasOwnProperty('upserted')){
                notificar = true;
            }
            if (callback && notificar)
                callback(obj);
        });
        db.close();
    });
};

exports.sendMail = function (obj) {
    console.log("exports.sendMail");
    sendmail({
        from: 'ofertas@ulayera.com',
        to: 'awgv5c382j@pomail.net, ulayera@gmail.com',
        subject: obj.autor + ' - ' + obj.titulo,
        html: obj.desc + "\n\n" + obj.url
    }, function(err, reply) {
        if (err)
            console.log(err && err.stack);
    });
};

exports.toIdArray = function(list) {
    let result = [];
    for (let i = 0; i < list.length; i++) {

    }
    return result;
};

