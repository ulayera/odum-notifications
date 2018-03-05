var exports = module.exports = {};
var envService = require("./env-service.js");
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
const sensitive = {
  "db": {
    "user": envService.getEnv('DB_USER'),
    "password": envService.getEnv('DB_PASS'),
    "host": envService.getEnv('DB_HOST'),
    "port": envService.getEnv('DB_PORT'),
    "dbname": envService.getEnv('DB_DBNAME')
  }
};
var url = `mongodb://${sensitive.db.user}:${sensitive.db.password}@${sensitive.db.host}:${sensitive.db.port}/${sensitive.db.dbname}`;

exports.getOdumsByIdlist = function (cb, idList) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    var collection = db.collection('odums');
    collection.find({_id: {$in: idList}}, function (err, result) {
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

exports.saveToDB = async function (cb, obj) {
  MongoClient.connect(url, async function (err, db) {
    assert.equal(null, err);
    var collection = db.collection('odums');
    await collection.updateOne({_id: obj._id}, obj, {upsert: true}, function (err, result) {
      db.close();
      if (err)
        cb(err);
      else
        cb(result);
    });
  });
};

exports.findAllRecipients = function (cb) {
  MongoClient.connect(url, function (err, db) {
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

exports.saveRecipient = function (cb, obj) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    var collection = db.collection('recipients');
    collection.updateOne({_id: obj._id}, obj, {upsert: true}, function (err, result) {
      db.close();
      cb(obj);
    });
  });
};

exports.deleteRecipient = function (cb, obj) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    var collection = db.collection('recipients');
    collection.deleteOne({_id: obj._id}, obj, {upsert: true}, function (err, result) {
      db.close();
      if (err)
        cb(err);
      cb(result);
    });
  });
};

exports.addRecipientSource = function (cb, obj) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    var collection = db.collection('recipients');
    collection.findOne({_id: obj._id},  function (err, result) {
      if (!result.sources)
        result.sources = [];
      if (result.sources.indexOf(obj.source) === -1)
        result.sources.push(obj.source);
      collection.updateOne({_id: result._id}, result, {upsert: true}, function (err, result) {
        db.close();
        cb(result);
      });
    });
  });
};

exports.delRecipientSource = function (cb, obj) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    var collection = db.collection('recipients');
    collection.findOne({_id: obj._id},  function (err, result) {
      if (!result.sources)
        result.sources = [];
      let index = result.sources.indexOf(obj.source);
      if (index !== -1)
        result.sources.splice(index, 1);
      collection.updateOne({_id: result._id}, result, {upsert: true}, function (err, result) {
        db.close();
        cb(result);
      });
    });
  });
};

exports.getRecipient = function (cb, obj) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    var collection = db.collection('recipients');
    collection.findOne({_id: obj._id},  function (err, result) {
      if (!result.sources)
        result.sources = [];
        db.close();
        cb(result);
    });
  });
};


exports.addLog = function (obj) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    var collection = db.collection('logs');
    collection.insertOne(obj);
  });
};


exports.findAllLogs = function (cb) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    var collection = db.collection('logs');
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