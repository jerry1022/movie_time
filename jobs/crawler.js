var async = require('async'),
  needle = require('needle'),
  cheerio = require('cheerio'),
  schedule = require('node-schedule'),
  MovieTimeModel = require('../models/movieTimeModel'),
  movieTimeModel = new MovieTimeModel();

var option_url = 'https://tw.movie.yahoo.com'; 
  options = {
    compressed         : true, // sets 'Accept-Encoding' to 'gzip,deflate' 
    follow_max         : 5,    // follow up to five redirects 
    rejectUnauthorized : false  // verify SSL certificate 
  },
  index = [],
  cronJob = false;

var crawler = function (cronJob) { 
  if (!cronJob) {
    require('../models/db.js').connect(function (err) {
      if (err) {
        console.log('db error');
        throw err;
      }
    });
  }

 async.auto({
    get_index: function (cb) {
      needle.get(option_url, options, function (err, res) {
        if (!err && res.statusCode === 200) {
          var $ = cheerio.load(res.body);
          $('select[name="id"] option').each(function (i, elm) {
            if (i === 0) return;
              var text = $(elm).text();
              var val = $(elm).val();
              index.push(val);
              //console.log('text: %s, val: %s\n', text, val);
            });
            cb();
        } else {
          console.log(err);
          cb(err);
        }
      });
    },  
    rmOldData: function (cb) {
      console.log('Remove old data');
      movieTimeModel.removeMovieTime({}, function (err) {
        if (err) {
          cb(err);
        } else {
          console.log('Remove Done');
          cb(null);
        }
      }); 
    },
    crawler: ['get_index', 'rmOldData', function (result, cb) {
      async.eachLimit(index, 10, function (idx, callback) {
        var query_url = 'https://tw.movies.yahoo.com/movietime_result.html?id=' + idx;
        needle.get(query_url, options, function (err, res) {
          if (!err && res.statusCode === 200) {
            var $ = cheerio.load(res.body);
            //console.log($('div .text.bulletin h4').text());
            var name_zh = $('div .text.bulletin h4').text();
            //console.log($('div .text.bulletin h5').text());
            var name_en = $('div .text.bulletin h5').text();
            //console.log($('div .text.bulletin p').text());
            var release = $('div .text.bulletin p').text();

            $('div .row-container').each(function (i, elm) {
              var movies = {};
              var theater_info = {};
              theatersInfo = $(elm).text().trim().split(/\n/);
              /*
              text.trim().split(/\n/).forEach(function (t) {
                if (t !== ' ') {
                  movies.push(t);
                }
              });
              */
              movies.name_zh = name_zh;
              movies.name_en = name_en;
              movies.release = Date(release.split(':')[1]); 
              theater_info.name = theatersInfo[0].split(' ')[0];
              theater_info.tel = theatersInfo[0].split(' ')[1];
              theater_info.area = '';
              movies.theater_info = theater_info;
              movies.movie_time = theatersInfo[3];
              movieTimeModel.createMovieTime(movies, function (json) {
                console.log(json);
              }); 
              //console.log(JSON.stringify(movies));
            });
          } else {
            console.log(err);
          }
          callback();
        });
      }, function (err) {
         if (err) {
           console.log(err);
           cb(err);
         } else {
           cb();
         }
      });
    }]
  }, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (!cronJob) {
      require('../models/db').disconnect(
        function (err) {
          if (err) {
            console.log(err); 
          }
        }
      );
    }  
    console.log('done');
  });  
};

var startJob = function () {
  cronJob = true;
  console.log('Start crawler schedule Job');
  schedule.scheduleJob('* * 2 * * *', function () {
    crawler(cronJob);    
  });
};

module.exports = {
  startJob: startJob,
  crawler: crawler
};
