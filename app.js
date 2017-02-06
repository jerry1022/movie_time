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
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
//app.use(log4js.connectLogger(log4js.getLogger("http"), {level: 'auto'}));
app.use(errorHandler());
//app.use(configstore.all.ctxPath, router);

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

// URL to check process is live.
router.get('/ping', function (req, res) {
  res.end('__VERSION_INFO');
});


// ===================================================================
// uFile
// ======================================================================
router.post('/movietime/create', movietime.createMovie);
router.get('/movietime/read/:name', movietime.getMovieTime);
router.delete('/movietime/delete', movietime.deleteMovie);
router.put('/movietime/update', movietime.updateMovie);

// ==================================================================================================================================
// application event
// =================================================================================================================================
app.on('close', function (errno) {
  require('./models/db').disconnect(function (err) {console.log(errno + ' ' + err); });
});


// ===============================================================================================
// server start
// ==================================================================================================

var server = http.listen(config.http.Port, function () {
  console.log('Express server listening on port %d in %s mode...', server.address().port, app.settings.env);
});
