var express = require('express'),
  app = express(),
  router = express.Router(),
  bodyParser = require('body-parser'),
  sugar = require('sugar'),
  errorHandler = require('errorhandler'),
  compression = require('compression'),
  http = require('http').Server(app),
  path = require('path'),
  cluster = require('cluster'),
  os = require('os'),
  readConfig = require('read-config'),
  config = readConfig('./config/default.json');

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

// =======================================================================================================
// configuration
// =======================================================================================================
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(compression());
app.use(bodyParser.json({ type: 'application/*+json' }))

// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))

// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))
//app.use(log4js.connectLogger(log4js.getLogger("http"), {level: 'auto'}));
app.use(errorHandler());
//app.use(configstore.all.ctxPath, router);
app.use(router);

// ===================================================
// routes
// ===================================================
var movietime = require('./routes/movietime');

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

var server = http.listen(config.http.Port, function () {
  console.log('Express server listening on port %d in %s mode...', server.address().port, app.settings.env);
});
