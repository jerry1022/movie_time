var
  MovieTimeModel = require('../models/movieTimeModel'),
  movieTimeModel = new MovieTimeModel();

var getMovieTime = function (req, res) {
  var movie = req.param('movie');
  movieTimeModel.getMovieTime({
      $or: [
       {name_zh: new RegExp(movie, "i")},
       {name_en: new RegExp(movie, 'i')}
      ]
      }, function (json) {
    if (json !== null) {
      res.json(json);
    }
  });
};

var getTheaterMovies = function (req, res) {
  var theater = req.param('theater'); 
  movieTimeModel.getTheaterMovies({
    "theater_info.name": new RegExp(theater, "i")
      }, function (json) {
    if (json !== null) {
      res.json(json);
    }
  });
};

var createMovie = function (req, res) {
};

var deleteMovie = function (req, res) {
};

var updateMovie = function (req, res) {
};

module.exports = {
  getMovieTime: getMovieTime,
  getTheaterMovies: getTheaterMovies,
  createMovie: createMovie,
  deleteMovie: deleteMovie,
  updateMovie: updateMovie
};
