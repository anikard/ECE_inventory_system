/********************************************************/
/*            CONTROLLER            */
/********************************************************/

var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = (app) => {
  // Get current user info 
  app.get('/api/v1/user', function(req, res, next){
  	if (req.user) {
  		res.status(200).json(req.user);
  	}
  });

  // Get user info 
  app.get('/api/v2/user', function(req, res, next){
  	User.findOne({ '_id': req.body._id }, function (err, user) {
  		if(err) {
  			res.status(500).send({ error: err });
  		} else {
  			res.json(user);
  		}
  	});
  });

  app.get('/api/v2/user/show', function(req, res, next){
  	User.find({}, function(err, results) {
  		if(err) {
  			res.status(500).send({ error: err });
  		} else {
  			res.json(results);
  		}
  	});
  });

  app.post('/api/v2/user/add', function(req, res, next){
  	var user = new User({name: req.body.name, date: new Date(), active: 'true'});
  	user.save(function(err){
  		if(err){
  			res.status(500).send({ error: err });
  		} else {
  			res.status(200).send("Successfully updated a user!");
  		}
  	});
  });

  app.post('/api/v2/user/update', function(req, res, next){
  	return res.status(405);
  	var user = new User({name: req.body.name, date: new Date(), active: 'true'});
  	user.save(function(err){
  		if(err){
  			res.status(500).send({ error: err });
  		} else {
  			res.status(200).send("Successfully updated a user!");
  		}
  	});
  });

  app.post('/api/v2/user/del', function(req, res, next){
  	User.findOneAndRemove({name: req.body.name}, 
  		function(err){
  			if(err){
  				res.status(500).send({ error: err });
  			} else {
  				res.status(200).send("Successfully removed a user!");
  			}
  		});    
  });
}
