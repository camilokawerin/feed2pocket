// este modulo recorre la lista de posts recuperados contra una lista de posts guardada en mongodb y 
// emite un evento cuando encuentra uno nuevo
// el item recuperado va al modulo analizador, que le asigna un valor segun la relevancia del contenido

var config = require('../config')
  , pocket = require('pocket-sdk')
  ;

pocket.init(config.consumer_key, '');

function dispatch (item, tags) {
  console.log('added -> ', item.source.url + '\n');
  pocket.add({
    access_token: config.access_token,
    url: item.source.url,
    title: item.title,
    tags: tags
  });
}

module.exports = dispatch;