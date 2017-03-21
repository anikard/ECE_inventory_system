/********************************************************/
/*                       ROUTES                         */
/********************************************************/
const util = require('./../server/controllers/util.js');

module.exports = (app) => {
  app.all('*', [require('./validateRequest')]);
  app.all('*', function(req, res, next) {
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next();
  });

  require('./../server/controllers/oauth.js')(app);
  require('./../server/controllers/authenticator.js')(app);
  require('./../server/controllers/users.js')(app);
  require('./../server/controllers/cart.js')(app);
  require('./../server/controllers/tags.js')(app);
  require('./../server/controllers/requests.js')(app);
  require('./../server/controllers/items.js')(app);
  require('./../server/controllers/fields.js')(app);
  require('./../server/controllers/logs.js')(app);
  require('./../server/controllers/mailer.js').routes(app);

  app.get('/home', function(req, res) {
    res.redirect('/');
  });

  app.get('/dispOrders', util.requireLoginGui, function(req, res) {
    res.redirect('orders/orders.html');
  });

  app.get('/dispLog', util.requireLoginGui, function(req, res) {
    res.redirect('userlogs/log.html');
  });

  app.get('/dispCart', util.requireLoginGui, function(req, res) {
    res.redirect('cart/cart.html');
  });

  app.get('/dispCustomers', util.requireLoginGui, function(req, res) {
    res.redirect('customers.html');
  });

  app.get('/dispProducts', util.requireLoginGui, function(req, res) {
    res.redirect('products/products.html');
  });

  app.get('/dispCart', util.requireLoginGui, function(req, res) {
    res.redirect('cart/cart.html');
  });

  // app.get('/goToProducts', function(req, res) {
  //   console.log("IN ROUTES");
  //   req.session.item_name = 'resistors2';
  //   console.log(req.session);
  //   // req.session = "resistors2";
  //   // res.redirect('products/products.html/?item='+req.body.item_name);
  //   res.redirect('products/products.html');
  // });

  app.get('/dispFields', util.requireLoginGui, function(req, res) {
    res.redirect('fields/fields.html');
  })

  app.get('/dashboard', util.requireLoginGui, function(req, res) {
    res.redirect('dashboard.html');
  });

  // app.config(function ($stateProvider) {

  //   $stateProvider
  //     .state('login', {
  //       url: '/login',
  //       templateUrl: '/index.html',
  //       controller: 'AuthCtrl',
  //       onEnter: ['$state', 'auth', function($state, auth){
  //         if(auth.isLoggedIn()){
  //           $state.go('customers.html');
  //         }
  //       }]
  //     })
  //     .state('register', {
  //       url: '/register',
  //       templateUrl: '/index.html',
  //       controller: 'AuthCtrl',
  //       onEnter: ['$state', 'auth', function($state, auth){
  //         if(auth.isLoggedIn()){
  //           $state.go('customers.html');
  //         }
  //       }]
  //     });


  // });
}
