var db = require('./db').getDb(),
  async = require('async'),
  uid = require('uid');

var MovieTimeSchema = new db.Schema({
  movie_id: {type: String, unique: true, default: function () {
    return uid(32);
  }},
  name_zh: {type: String, require: true},
  name_en: {type: String},
  release: {type: Date},
  genre: {type: String},
  theater_info: {},
  movie_time: {type: String},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
});

function MovieTimeModel() { 
  this.movieTimeModel = db.model('moivetime', MovieTimeSchema); 
}; 

MovieTimeModel.prototype.createMovieTime = function (data, callback) {
  var json = {};
  this.movieTimeModel.create(
    data,
    function (err, docs) {
      if (err) {
        console.error(err);
      } else {
        json = docs;
        json = JSON.parse(JSON.stringify(json));
      }
      //console.log(json);
      callback(json);
    }
  );
};


MovieTimeModel.prototype.updateMovieTime = function (data, callback) {
   //TO-DO
   var condition = {name_zh: data.name_zh},
       update = {
         $set: {genre: data.genre}
       };

   this.movieTimeModel.update(
     condition,
     update,
     {multi: true}
   )
   .lean()
   .exec(function (err) {
     if (err) {
       callback(err);
     } else {
       callback(null);
     }
   });
};

MovieTimeModel.prototype.getMovieTime = function (data, callback) {
  this.movieTimeModel.find(
    data
  )
  .select({movie_id: 0, _id: 0, __v: 0, created_at: 0})
  .sort({name_zh: 1, release: 1, 'theater.address': 1})
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

MovieTimeModel.prototype.getTheaterMovies = function (data, callback) {
   this.movieTimeModel.find(
    data
  )
  .select({movie_id: 0, _id: 0, __v: 0, created_at: 0})
  .sort({'theater_info.name': 1, 'theater_info.tel': 1, release: 1})
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

MovieTimeModel.prototype.removeMovieTime = function (data, callback) {
   this.movieTimeModel.remove(
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



module.exports = MovieTimeModel;

