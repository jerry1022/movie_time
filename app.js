var express = require('express'),
  app = express(),
  router = express.Router(),
  bodyParser = require('body-parser'),
  sugar = require('sugar'),
  errorHandler = require('errorhandler'),
  log4js = require('log4js'),
  http = require('http').Server(app),
  path = require('path'),
  cluster = require('cluster'),
  os = require('os'),
  config = require('config');

// ================================================================================================
// set working directory is this script basedir
// ================================================================================================
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
app.use(crossDomain.allowCrossDomain);
app.use(token.tokenExchange);
app.use(compression());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(multer({dest: configstore.all.tmpFolder}));
app.use(cookieParser());
app.use(xmlparser());
//app.use(log4js.connectLogger(log4js.getLogger("http"), {level: 'auto'}));
app.use(errorHandler());
app.use(configstore.all.ctxPath, router);

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
      is_cloud_call: req.get('isCloudCall')
    };
    next();
});

// URL to check process is live.
router.get('/ping', function (req, res) {
  res.end('__VERSION_INFO');
});

router.get('/errortest', function (req, res) {
  var a = {};
  a.d[2] = 'sparda';
  console.log(a.d[2]);
  res.json();
});


// ===================================================================
// uFile
// ======================================================================
router.post('/movietime/create', movietime.create);
router.get('/movietime/read/:name', movietime.get);
router.delete('/movietime/delete', movietime.delete);
router.put('/movietime/update', movietime.update);

// ==================================================================================================================================
// application event
// =================================================================================================================================
app.on('close', function (errno) {
  require('./models/db').disconnect(function (err) {console.log(errno + ' ' + err); });
});


// ===============================================================================================
// server start
// ==================================================================================================

var server = http.listen(config.http.port, function () {
  console.log('Express server listening on port %d in %s mode...', server.address().port, app.settings.env);
});
