var db = require('./db').getDb(),
  async = require('async'),
  uid = require('uid');

var MovieTimeSchema = new db.Schema({
  movie_id: {type: String, unique: true, default: function () {
    return uid(32);
  }},
  name_zh: {type: String, required: true},
  name_en: {type: String},
  release: {type: Date},
  theater_info: {},
  movie_time: {type: String},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
});

function MovieTimeModel() { 
  this.movieTimeModel = db.model('moivetime', MovieTimeSchema); 
}; 

MovieTimeModel.prototype.createMovieTime = function (data, callback) {
  this.movieTimeModel.create(
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


MovieTimeModel.prototype.updateMovieTime = function (data, callback) {
   //TO-DO
};

MovieTimeModel.prototype.getMovieTime = function (data, callback) {
  //TO-DO
};

MovieTimeModel.prototype.getTheaterMovie = function (data, callback) {
  //TO-DO
};



module.exports = MovieTimeModel;

