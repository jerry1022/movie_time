var
  MovieTimeModel = require('../models/movieTimeModel'),
  movieTimeModel = new MovieTimeModel();

var getMovieTime = function (req, res) {
  var movie = req.param('movie'),
    jsonResult = [];
  
  movieTimeModel.getMovieTime({
      $or: [
       {name_zh: new RegExp(movie, "i")},
       {name_en: new RegExp(movie, 'i')}
      ]
      }, function (json) {
    if (json !== null) {
      var movie_info = {
        name_zh: json[0].name_zh,
        name_en: json[0].name_en,
        release: json[0].release,
        theater: []
      };
      json.forEach(function (movie) {
         var theater = {
         };
        if (movie_info.name_zh === movie.name_zh) {
          theater.name = movie.theater_info.name;
          theater.tel = movie.theater_info.tel;
          theater.time = movie.movie_time;
          movie_info.theater.push(theater);
        } else {
          jsonResult.push(movie_info);
          movie_info = {
            name_zh: movie.name_zh,
            name_en: movie.name_en,
            release: movie.release,
            theater: []
          }; 
          theater.theater.name = movie.theater_info.name;
          theater.theater.tel = movie.theater_info.tel;
          theater.theater.time = movie.movie_time;
          movie_info.theater.push(theater_info);
        } 
      });
      jsonResult.push(movie_info);
      res.status(200).json(jsonResult);
    } else {
      res.status(200).json([]);
    }
  });
};

var getTheaterMovies = function (req, res) {
  var theater = req.param('theater'),
    jsonResult = []; 
  movieTimeModel.getTheaterMovies({
    "theater_info.name": new RegExp(theater, "i")
      }, function (json) {
    if (json !== null) {
      var theater_info = {
        name: json[0].theater_info.name,
        tel: json[0].theater_info.tel,
        area: json[0].theater_info.area,
        movies: []
      };
      json.forEach(function (theater) {
         var movie = {
         };
        if (theater_info.name === theater.theater_info.name) {
          movie.name_zh = theater.name_zh;
          movie.name_en = theater.name_en;
          movie.release = theater.release;
          movie.time = theater.movie_time;
          theater_info.movies.push(movie);
        } else {
          jsonResult.push(theater_info);
          theater_info = {
            name: theater.theater_info.name,
            tel: theater.theater_info.tel,
            area: theater.theater_info.area,
            movies: []
          }; 
          movie.name_zh = theater.name_zh;
          movie.name_en = theater.name_en;
          movie.release = theater.release;
          movie.time = theater.movie_time;
          theater_info.movies.push(movie);
        } 
      });
      jsonResult.push(theater_info);
      res.status(200).json(jsonResult);
    } else {
      res.status(200).json([]);
    }
  });
};

var createMovie = function (req, res) {
  //TO-DO;
};

var deleteMovie = function (req, res) {
  //TO-DO;
};

var updateMovie = function (req, res) {
  //TO-DO;
};

module.exports = {
  getMovieTime: getMovieTime,
  getTheaterMovies: getTheaterMovies,
  createMovie: createMovie,
  deleteMovie: deleteMovie,
  updateMovie: updateMovie
};
