
jQuery(function ($) {
  $.get( "https://zapier.com/engine/rss/396032/historiasocial/", function( data ) {
    var items = $(data).find('item');
    items.each(function () {
      var item = $(this)
        , title = item.find('title').text()
        , source = item.find('description').text()
        , url = source.match(/@url: .*,http/i)[0].replace(/(@url: |,http)/gi, '');
        ;

      console.log(title, url)
      $.get('/add', {
        title: title,
        url: url
      });
    });
  });
});