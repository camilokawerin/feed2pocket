var config = require('./config')
  , fetch = require('./lib/fetch')
  , dispatch = require('./lib/dispatch')
  ;

config.feeds.forEach(function(feed) {
  var fetcher = fetch(feed.url, function (err) {
    if (err) throw err;
  });
  fetcher.on('start', function (msg) {
    console.log(msg);
  });
  fetcher.on('fetched', function (item) {
    console.log('fetched: -> ' + item.title);
    dispatch(item, feed.tags);
  });
});
