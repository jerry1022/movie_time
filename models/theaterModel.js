var db = require('./db').getDb(),
  async = require('async'),
  uid = require('uid');

var TheaterSchema = new db.Schema({
  theater_id: {type: String, unique: true, default: function () {
    return uid(32);
  }},
  name: {type: String, require: true},
  tel: {type: String},
  address: {type: String},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
});

function TheaterModel() { 
  this.theaterModel = db.model('theater', TheaterSchema); 
}; 

TheaterModel.prototype.createTheater = function (data, callback) {
  var json = {};
  this.theaterModel.insertMany(
    data,
    function (err, docs) {
      if (err) {
        console.error(err);
      } else {
        json = docs;
        json = JSON.parse(JSON.stringify(json));
      }
      console.log(json);
      callback(json);
    }
  );
};

TheaterModel.prototype.removeTheater = function (data, callback) {
   this.theaterModel.remove(
    data
   )
    .exec(function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else { 
      callback(null);
    }
   });
};

TheaterModel.prototype.getTheater = function (data, callback) {
  this.theaterModel.find(
    data
  )
  .select({_id: 0, __v: 0, created_at: 0})
  .sort({address: 1})
  .lean()
  .exec(function (err, docs) {
    if (err) {
      console.log(err);
    } else if (docs.length === 0) {
      callback(null);
    } else {
      callback(docs);
    }
  });
};

module.exports = TheaterModel;

