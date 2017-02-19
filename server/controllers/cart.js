/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var User = mongoose.model('User');
var Item = mongoose.model('Item');

module.exports = (app) => {
  app.get('/api/v1/cart/show', function(req, res, next){
    show(req, res, next);
  });

  app.post('/api/v1/cart/add', function(req, res, next){
    add(req, res, next);
  });

  app.post('/api/v1/cart/update', function(req, res, next){
    update(req, res, next);
  });

  app.post('/api/v1/cart/del', function(req, res, next){
    del(req, res, next);
  });

  app.get('/api/v1/cart/empty', function(req, res, next){
    empty(req, res, next);
  });
}

function show(req, res) {

}

function add(req, res) {
	
}

function update(req, res) {
	
}

function del(req, res) {
	
}

function empty(req, res) {
	
}