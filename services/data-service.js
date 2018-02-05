var exports = module.exports = {};
var envService = require("./env-service.js");
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
const console = require("./console.js");
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

exports.getOdumsByIdlist = function(cb, idList){
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('odums');
        collection.find({ _id : { $in : idList } }, function (err, result) {
            if (err)
                cb(err);
            result.toArray(function (err, arr) {
                if (err)
                    cb(err);
                cb(arr);
            });
        });
        db.close();
    });
};

exports.saveToDB = function(cb, obj){
    console.log("exports.saveToDB");
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('odums');
        collection.updateOne({ _id : obj._id }, obj, { upsert : true }, function (err, result) {
                db.close();
                cb(obj);
        });
    });
};

exports.findAllRecipients = function(cb){
    console.log("exports.saveRecipient");
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('recipients');
        collection.find({}, function (err, result) {
            if (err) {
                db.close();
                cb(err);
            } else {
                result.toArray(function (err, arr) {
                    db.close();
                    if (err)
                        cb(err);
                    cb(arr);
                });
            }
        });
    });
};

exports.saveRecipient = function(cb, obj){
    console.log("exports.saveRecipient");
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('recipients');
        collection.updateOne({ _id : obj._id }, obj, { upsert : true }, function (err, result) {
            db.close();
            cb(obj);
        });
    });
};

exports.deleteRecipient = function(cb, obj){
    console.log("exports.saveRecipient");
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('recipients');
        collection.deleteOne({ _id : obj._id }, obj, { upsert : true }, function (err, result) {
            db.close();
            if (err)
                cb(err);
            cb(result);
        });
    });
};

