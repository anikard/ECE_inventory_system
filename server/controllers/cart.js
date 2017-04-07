var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Request = mongoose.model('Request');
var User = mongoose.model('User');
var Item = mongoose.model('Item');
var Cart = mongoose.model('Cart');
var util = require('./util.js');
var _ = require('lodash');

module.exports = (app) => {
  app.all('/api/cart/*', util.requireLogin);

  app.get('/api/cart/show', show);
  app.post('/api/cart/add', add);
  app.post('/api/cart/update', add); //update is the same as add
  app.post('/api/cart/del', del);
  app.get('/api/cart/empty', empty);
}

function show(req, res) {
	Cart.findOne({user: req.user._id})
  .populate('items.item')
  .exec(function(err, cart) {
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
	Cart.findOne({user: req.user._id}, function(err, cart) {
    if(err) return res.status(500).send({ error: err });
    if(cart) {
      // If the item exist we update it, otherwise we add it to the cart
      let i = 0;
      let idx = -1;
      for(i = 0; i < cart.items.length; i++){
        if(cart.items[i].item == req.body.item){
          cart.items[i].quantity_requested = req.body.quantity_requested;
          idx = i;
          break;
        }
      }
      if(idx == -1) cart.items.push(_.pick(req.body,['item','quantity_requested']));
    } else {
    	cart = new Cart({
    		user: req.user._id,
    		items: []
    	})
      cart.items.push(_.pick(req.body,['item','quantity_requested']));
    }
    cart.save((err,cart)=>{
      if(err) {
        res.status(500).send({ error: err });
      } else {
        res.status(200).json(cart.items);
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
      if(cart.items[i].item == req.body.item._id){
        idx = i;
        //break;
      }
    }
    if(idx === -1) return res.status(400).send({ error: "No such item" });
    cart.items.splice(idx, 1);

    cart.save((err)=>{
        if(err) {
          res.status(500).send({ error: err });
        } else {
          res.status(200).json(cart.items);
        }
      });
    })
}

function empty(req, res) {
	Cart.update({ user: req.user._id }, {
		$set: {items: []}
	}, function(err, cart){
      if(err){
        res.status(500).send({ error: err })
      } else {
        res.status(200).json(cart.items);
      }
    });
}
