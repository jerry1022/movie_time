var express = require('express'),
  app = express(),
  router = express.Router(),
  bodyParser = require('body-parser'),
  errorHandler = require('errorhandler'),
  compression = require('compression'),
  http = require('http').Server(app),
  path = require('path'),
  cluster = require('cluster'),
  os = require('os'),
  readConfig = require('read-config'),
  config = readConfig('./config/default.json'),
  linebot = require('linebot');
//=================================================================================================
//routes import 
//================================================================================================
var movietime = require('./routes/movietime');
var theater = require('./routes/theater');
  
// ================================================================================================
// set working directory is this script basedir
// ===============================================================================================+
process.chdir(__dirname);

// ================================================================================================
// database defined
// ================================================================================================
require('./models/db.js').connect(function (err) {
  if (err) {
    console.log('db error');
    throw err;
  }
});

//=================================================================================================
//line bot setting
//=================================================================================================
var bot = linebot({
  channelId: config.linebot.ChannelId,
  channelSecret: config.linebot.ChannelSecret,
  channelAccessToken: config.linebot.ChannelAccessToken
});

var linebotParser = bot.parser();

app.post('/', linebotParser); 

var exStatus = 0;
var area = '';
bot.on('message', function (event) {
console.log(JSON.stringify(event));
        if (event.message.text === '看電影') {
	   exStatus = 1; 
           event.reply("請輸入要查的區域(ex: 台北 或 全部)").then(function (data) {
	     console.log('Success', data);
 	   }).catch(function (error) {
	     console.log('Error', error);
	   });
        } else if (event.message.text === '找戲院') {
           exStatus = 2;
           console.log("找戲院");
           event.reply("請輸入要查的戲院").then(function (data) {
	     console.log('Success', data);
 	   }).catch(function (error) {
	     console.log('Error', error);
	   });
        } else if (exStatus === 1) {
	   exStatus = 3; 
           if (event.message.text !== '全部') {
              area = event.message.text;  
           }
           event.reply("請輸入要看的電影").then(function (data) {
	     console.log('Success', data);
 	   }).catch(function (error) {
	     console.log('Error', error);
	   });
        } else if (exStatus === 3) {
	  movietime.getMovieTimeAPI({movie: event.message.text, address: area}, function (result) {
            if (result.length === 0) {
              event.reply("查無資料").then(function (data) {
                exStatus = 0;
		console.log('Success', data);
 	      }).catch(function (error) {
                exStatus = 0;
	       console.log('Error', error);
	      });
            } else {
              var user_id = event.source.userId;
              var replyToken = event.replyToken;
              console.log("userId:", user_id, replyToken);
              result.forEach(function (movie) {
                var movie_info = '片名:' + movie.name_zh + '(' + movie.name_en + ')\n上映日期:' + movie.release + '\n類型：'+ movie.genre;
/*
                event.reply(movie_info).then(function (data) {
		  console.log('Success', data);
	        }).catch(function (error) {
	          console.log('Error', error);
	        });
*/
                bot.push(user_id,  movie_info).then(function (data) {
                  movie.theater.forEach(function (theater) {
                    var theater_info = '戲院:' + theater.name + '\n電話:' + theater.tel + '\n' + '時刻表:' + theater.time;
                    bot.push(user_id, theater_info);
                  }); 
		});
/*
                  event.reply(theater_info);//.then(function (data) {
		    console.log('Success', data);
 	          }).catch(function (error) {
	            console.log('Error', error);
	          });
*/
                exStatus = 0;
              });
            }
          });
        } else if (exStatus === 2) {
            var user_id = event.source.userId;
            var replyToken = event.replyToken;
            movietime.getTheaterMoviesAPI({theater: event.message.text}, function (result) {
              if (result.length === 0) {
                event.reply("查無資料").then(function (data) {
                  exStatus = 0;
		  console.log('Success', data);
 	        }).catch(function (error) {
                 exStatus = 0;
	         console.log('Error', error);
	        });
              } else {
               result.forEach(function (theater) {
                  var theater_info = '戲院:'+ theater.name + '\n電話:'+ theater.tel;
                  bot.push(user_id, theater_info);
                  theater.movies.forEach(function (movie) {
                    var movie_info = '片名:' + movie.name_zh + '(' + movie.name_en + ')\n上映日期:' + movie.release +'\n類型：'+ movie.genre +'\n時刻表:' + movie.time;
                    bot.push(user_id, movie_info);
                  });
                  exStatus = 0;
               });
              }
            });
        } else {
          var defaultText = '請輸入: \n 1．"看電影" 或 "找戲院"\n2. 再輸入您要看的電影名稱或戲院名稱'
    	  event.reply(defaultText).then(function (data) {
                exStatus = 0;
		console.log('Success', data);
	  }).catch(function (error) {
                exStatus = 0;
		console.log('Error', error);
	  });       
        }
});

// =================================================================================================
// configuration
// =================================================================================================
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(compression());

app.use(bodyParser.json({ type: 'application/*+json' }))

// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))

// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))
//app.use(log4js.connectLogger(log4js.getLogger("http"), {level: 'auto'}));
app.use(errorHandler());

app.use(router);

// ===================================================
// routes
// ===================================================

router.use(function (req, res, next) {
  var error = '',
    json = {},
    data = {
      action: req.path,
      user_id: req.get('user-id'),
      sign: req.get('sign'),
      token_pass: req.get('token_pass'),
    };
  
    next();
});


// ===================================================================
// API 
// ======================================================================
router.post('/movietime/create', movietime.createMovie);
router.get('/movietime/getmovie/:movie', movietime.getMovieTime);
router.get('/movietime/gettheater/:theater', movietime.getTheaterMovies);
router.delete('/movietime/delete', movietime.deleteMovie);
router.put('/movietime/update', movietime.updateMovie);

router.get('/theater/gettheater', theater.getTheater);

// ==================================================================================================================================
// application event
// =================================================================================================================================
app.on('close', function (errno) {
  require('./models/db').disconnect(
    function (err) {
       console.log(err); 
    });
});


// ===============================================================================================
// server start
// ==================================================================================================

require('./jobs/crawler.js').startJob();
require('./jobs/crawlerTheater.js').startJob();

var server = http.listen(process.env.PORT, function () {
  console.log('Express server listening on port %d in %s mode...', server.address().port, app.settings.env);
});
