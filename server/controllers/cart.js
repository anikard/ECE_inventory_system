/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var User = mongoose.model('User');
var Item = mongoose.model('Item');
var Cart = mongoose.model('Cart');
var _ = require('lodash');


module.exports = (app) => {
  app.get('/api/cart/show', function(req, res, next){
    show(req, res, next);
  });

  app.post('/api/cart/add', function(req, res, next){
	console.log("in cart.js app post");
    add(req, res, next);
  });

  app.post('/api/cart/update', function(req, res, next){
    update(req, res, next);
  });

  app.post('/api/cart/del', function(req, res, next){
    del(req, res, next);
  });

  app.get('/api/cart/empty', function(req, res, next){
    empty(req, res, next);
  });
}

function show(req, res) {
	Cart.findOne({user: req.user._id}, function(err, cart) {
        if(err) {
          res.status(500).send({ error: err });
        } else {
          res.status(200).json(cart.items);
        }
    })
}

function add(req, res) {
	console.log(" here in cart.js add()");
	Cart.findOne({user: req.user._id}, function(err, cart) {
        if(err) return res.status(500).send({ error: err });
        if(cart) {
	        _.assign(cart.items, req.body);
	        cart.markModified('items');
			cart.save();
        } else {
        	cart = new Cart({
        		user: req.user._id,
        		items: req.body
        	})
        	cart.save((err)=>{
        		if(err) {
        		  res.status(500).send({ error: err });
        		} else {
        		  res.status(200).send("success");
        		}
        	});
        }
        
    })
}

function update(req, res) {
	Cart.findOne({user: req.user._id}, function(err, cart) {
        if(err) return res.status(500).send({ error: err });
        
        _.assign(cart.items, req.body);
        cart.markModified('items');
		cart.save((err)=>{
    		if(err) {
    		  res.status(500).send({ error: err });
    		} else {
    		  res.status(200).send("success");
    		}
    	});
    })
}

function del(req, res) {
	Cart.findOne({user: req.user._id}, function(err, cart) {
        if(err) return res.status(500).send({ error: err });
        if (cart) {
	        delete cart.items[req.body];
	        cart.markModified('items');
			cart.save();
        }
    })
}

function empty(req, res) {
	Cart.update({ user: req.user._id }, { 
		$set: {items: {}}
	}, function(err, field){
      if(err){
        res.status(500).send({ error: err })
      } else {
        res.status(200).send("success");
      }
    });
}