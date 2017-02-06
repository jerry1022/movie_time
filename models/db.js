// =================================================
// mongoose config
// last modified on 2017/02/26
// =================================================
var
  mongoose = require('mongoose'),
  readConfig = require('read-config'),
  config = readConfig('./config/default.json'),
  dbUrl = config.db.Url,
  dbUser = config.db.User,
  dbPassword = config.db.Password;

exports.connect = function (callback) {
  // add different db url 
  // in callback function return function
  // it is convenient for testing. 
  var data = callback();
  if (data !== undefined) {
    mongoose.connect(data);
  } else {
    
    mongoose.connect('mongodb://'+ dbUser + ':' + dbPassword + '@' + dbUrl);
  }
};

exports.disconnect = function (callback) {
  mongoose.disconnect(callback);
};

exports.getDb = function () {
  return mongoose;
};
