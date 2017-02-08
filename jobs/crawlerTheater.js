var async = require('async'),
  needle = require('needle'),
  cheerio = require('cheerio'),
  schedule = require('node-schedule'),
  TheaterModel = require('../models/theaterModel'),
  theaterModel = new TheaterModel();

var option_url = 'https://tw.movies.yahoo.com/theater_list.html'; 
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

 var areaIndex = [0,1,2,3,10,11,12,13,14,16,17,18,19,20,21,22,23,24];
 var theaters = [];
 async.auto({
   rmOldData: function (cb) {
     console.log('Remove old data');
     theaterModel.removeTheater({}, function (err) {
       if (err) {
         cb(err);
       } else {
         console.log('Remove Done');
         cb(null);
       }
     }); 
    },
    crawler: ['rmOldData', function (result, cb) {
      async.eachLimit(areaIndex, 10, function (idx, callback) {
        needle.post(option_url, {area: idx}, options, function (err, res) {
          if (!err && res.statusCode === 200) {
            var $ = cheerio.load(res.body);
            var theater = {};
            $('div.group table tbody tr td').each(function (i, elm) {
                $$ = cheerio.load(elm);
                var text = $(elm).text().trim();
                var tel = $$('em').text();
                text = text.replace(tel, '');
                if (tel === '') {
              	  theater.name = text;
                } else {
                  theater.address = text;
                  theater.tel = tel;
                  theaters.push(theater);
                  theater = {}
                }
                //console.log('text: %s, i: %s\n', text, i);
                //console.log("tel:", tel);
            });
            console.log(theaters);  
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
           cb(null);
         }
      });
    }],
    insertData: ['crawler', function (result, cb) {
      theaterModel.createTheater(theaters, function (err) {
        cb();
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

