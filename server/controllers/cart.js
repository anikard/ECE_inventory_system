/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var User = mongoose.model('User');
var Item = mongoose.model('Item');
var Cart = mongoose.model('Cart');
var util = require('./util.js');
var _ = require('lodash');

module.exports = (app) => {
  app.all('/api/cart/*', util.requireLogin);
  
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
	console.log("in show function for cart");
	Cart.findOne({user: req.user._id}, function(err, cart) {
        if(err) {
          res.status(500).send({ error: err });
        } 
        if (cart) {
          res.status(200).json(cart.items);
        } else {
          cart = new Cart({
            user: req.user,
            items: []
          });
          cart.save((err,cart)=>{
            if(err) {
              res.status(500).send({ error: err });
            } else {
              res.status(200).json(cart.items);
            }
          });
        }
    })
}

function add(req, res) {
	console.log(" here in cart.js add()");
	Cart.findOne({user: req.user._id}, function(err, cart) {
        if(err) return res.status(500).send({ error: err });
        if(cart) {
	        cart.items.push(_.pick(req.body,['item','quantity']));
			    cart.save();
        } else {
        	cart = new Cart({
        		user: req.user._id,
        		items: []
        	})
          cart.items.push(_.pick(req.body,['item','quantity']));
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
        if(!cart) return res.status(400).send({ error: "Cart does not exist" });
        
        var i = 0;
        var idx = -1;
        for(i = 0; i < cart.items.length; i++){
          if(cart.items[i].item===req.body.item){
            idx = i;
          }
        }
        if(idx === -1) return res.status(400).send({ error: "No such item" });
        cart.items[i].quantity = req.body.quantity;

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
        if(!cart) return res.status(400).send({ error: "Cart does not exist" });
        
        var i = 0;
        var idx = -1;
        for(i = 0; i < cart.items.length; i++){
          if(cart.items[i].item===req.body.item){
            idx = i;
          }
        }
        if(idx === -1) return res.status(400).send({ error: "No such item" });
        cart.items.splice(idx, 1);

    cart.save((err)=>{
        if(err) {
          res.status(500).send({ error: err });
        } else {
          res.status(200).send("success");
        }
      });
    })
}

function empty(req, res) {
	Cart.update({ user: req.user._id }, { 
		$set: {items: []}
	}, function(err, field){
      if(err){
        res.status(500).send({ error: err })
      } else {
        res.status(200).send("success");
      }
    });
}