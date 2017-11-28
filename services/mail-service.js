var exports = module.exports = {};
var nodemailer = require("nodemailer");
var envService = require("./env-service.js");

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        type: 'OAuth2',
        user: envService.getEnv('GMAIL_MAIL_FROM'),
        clientId: envService.getEnv('GMAIL_CLIENT_ID'),
        clientSecret: envService.getEnv('GMAIL_CLIENT_SECRET'),
        refreshToken: envService.getEnv('GMAIL_REFRESH_TOKEN')
    }
});

exports.sendMail = function (obj, callback) {
    console.log("exports.sendMail");
    var mailOptions = {
        from: envService.getEnv('GMAIL_MAIL_FROM'),
        to: envService.getEnv('GMAIL_MAIL_TO'),
        subject: obj.titulo,
        text: (obj.post) ? obj.post : obj.desc
        //, html: "<b>Hello world ✔</b>"
    }
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            callback(obj);
        }
    });
};