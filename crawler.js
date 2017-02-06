var async = require('async'),
  needle = require('needle'),
  cheerio = require('cheerio');

var option_url = 'https://tw.movie.yahoo.com'; 
  options = {
    compressed         : true, // sets 'Accept-Encoding' to 'gzip,deflate' 
    follow_max         : 5,    // follow up to five redirects 
    rejectUnauthorized : false  // verify SSL certificate 
  };
var index=[];
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
  crawler: ['get_index', function (result, cb) {
    async.eachLimit(index, 2, function (idx, callback) {
      var query_url = 'https://tw.movies.yahoo.com/movietime_result.html?id=' + idx;
      needle.get(query_url, options, function (err, res) {
        if (!err && res.statusCode === 200) {
          var $ = cheerio.load(res.body);
          console.log($('div .text.bulletin h4').text());
          console.log($('div .text.bulletin h5').text());
          console.log($('div .text.bulletin p').text());

         $('div .row-container').each(function (i, elm) {
           movies = [];
           text = $(elm).text();
           val = $(elm).val();
           text.trim().split(/\n/).forEach(function (t) {
             if (t !== ' ') {
               movies.push(t);
             }
           });

           console.log('theater: %s', movies);
         });
         callback();
        } else {
          console.log(err);
          callback(err);
        }
      });
    }, function (err) {
       if (err) {
         console.log(err);
         cb(err);
       }
       cb();
    });
  }]
}, function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log('done');
});  

