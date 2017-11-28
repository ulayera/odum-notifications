var exports = module.exports = {};
var envService = require("./env-service.js");
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
const sensitive = {
    "db": {
        "user":     envService.getEnv('DB_USER'),
        "password": envService.getEnv('DB_PASS'),
        "host":     envService.getEnv('DB_HOST'),
        "port":     envService.getEnv('DB_PORT'),
        "dbname":   envService.getEnv('DB_DBNAME')
    }
};
var url = `mongodb://${sensitive.db.user}:${sensitive.db.password}@${sensitive.db.host}:${sensitive.db.port}/${sensitive.db.dbname}`;

exports.getOdumsByIdlist = function(idList, callback){
    console.log("exports.getOdumsByIdlist");
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('odums');
        collection.find({ _id : { $in : idList } }, function (err, result) {
            if (err)
                console.log(err);
            else if (callback)
                result.toArray(function (err, arr) {
                    callback(arr);
                });
        });
        db.close();
    });
};

exports.saveToDB = function(obj, callback){
    console.log("exports.saveToDB");
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('odums');
        collection.updateOne({ _id : obj._id }, obj, { upsert : true }, function (err, result) {
            if (callback)
                callback(obj);
        });
        db.close();
    });
};