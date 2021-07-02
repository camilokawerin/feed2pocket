/**
 * Tips
 * ====
 * - Set `user-agent` and `accept` headers when sending requests. Some services will not respond as expected without them.
 * - Set `pool` to false if you send lots of requests using "request" library.
 */

var request = require('request')
  , FeedParser = require('feedparser')
  //, Iconv = require('iconv').Iconv
  , fs = require('fs')
  ;

FeedParser.prototype.iterate = function (done) {
  if (!this.saved.length) {
    var that = this;
    fs.readFile('./feed.json', {encoding: 'utf8'}, function (err, data) {
      if (!err) {
        that.saved = JSON.parse(data);
        that._iterate();
        return;
      }
      // callback
      done(err);
    });
    return;
  }
  this._iterate();
}
FeedParser.prototype._iterate = function () {
  var item
    ;
  while (item = this.read()) {
    this.items.push(item);
    var isSaved = false;
    for (var i = this.saved.length - 1; i >= 0; i--) {
      //console.log('saved: ' + saved[i].guid);
      if (this.saved[i].guid == item.guid) {
        isSaved = true;
      }
    };
    if (!isSaved) {
    this.emit('fetched', item);
    }
  }
}
FeedParser.prototype.save = function (done) {
  fs.writeFile('./feed.json', JSON.stringify(this.items), function (err) {
    // callback
    done(err);
  });
}

function fetch(feed, done) {
  // Define our streams
  var req = request(feed, {timeout: 10000, pool: false});
  req.setMaxListeners(50);
  // Some feeds do not respond without user-agent and accept headers.
  req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
  req.setHeader('accept', 'text/html,application/xhtml+xml');

  var feedparser = new FeedParser();

  // Define our handlers
  req.on('error', done);
  req.on('response', function(res) {
    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
    var charset = getParams(res.headers['content-type'] || '').charset;
    // emit event
    feedparser.emit('start', 'Fetching feed from: ' + feed + '\n');
    //res = maybeTranslate(res, charset, done);
    // And boom goes the dynamite
    res.pipe(feedparser);
  });

  feedparser.items = [];
  feedparser.saved = [];
  feedparser.on('error', done);
  feedparser.on('end', function (err) {
    // save fetched items
    if (!err) {
      this.save(done);
      return;
    }
    // callback
    done(err);
  });
  feedparser.on('readable', function() {
    // read stream and iterate throw items fetched in previous requests
    // emit an event when a new item is found
    this.iterate(done);
  });

  return feedparser;
}

function maybeTranslate (res, charset, done) {
  var iconv;
  // Use iconv if its not utf8 already.
  if (!iconv && charset && !/utf-*8/i.test(charset)) {
    try {
      iconv = new Iconv(charset, 'utf-8');
      console.log('Converting from charset %s to utf-8', charset);
      iconv.on('error', done);
      // If we're using iconv, stream will be the output of iconv
      // otherwise it will remain the output of request
      res = res.pipe(iconv);
    } catch(err) {
      res.emit('error', err);
    }
  }
  return res;
}

function getParams(str) {
  var params = str.split(';').reduce(function (params, param) {
    var parts = param.split('=').map(function (part) { return part.trim(); });
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
    return params;
  }, {});
  return params;
}

module.exports = fetch;