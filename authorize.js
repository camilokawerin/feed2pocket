(function() {
  var app, consumer_key, express, path, pocket, succcess;

  express = require('express');
  path = require('path');
  pocket = require('pocket-sdk');
  consumer_key = '38055-419bdc12229496dfd282eb0d';

  pocket.init(consumer_key, 'http://127.0.0.1:4000/pocket/callback');

  succcess = function (ret, req, res) {
    res.cookie('access_token', ret.access_token);
    res.writeHead(302, {
      Location: '/succcess'
    });
    return res.end();
  }

  app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // routing
  app.use(require('cookie-parser')());
  app.use(pocket.oauth({ afterSuccess: succcess }));

  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/succcess', require('./routes/index'));

  app.get('/', function(req, res) {
    return res.redirect('/pocket/authorize');
  });

  app.listen(4000);

  console.log('VISIT http://127.0.0.1:4000/');

}).call(this);