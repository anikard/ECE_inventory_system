/********************************************************/
/*                       ROUTES                         */
/********************************************************/

  // require the controller
  var customers = require('./../server/controllers/customers.js');
  var orders = require('./../server/controllers/orders.js');
  var products = require('./../server/controllers/products.js');
  var dashboard = require('./../server/controllers/dashboard.js');
  var tags = require('./../server/controllers/tags.js');
  var authenticator = require('./../server/controllers/authenticator.js');



  module.exports = (function(app) {

    app.post('/addUser', function(req, res) {
      customers.update(req, res);
      dashboard.show(req, res);
    });

    app.get('/activeUser', function(req, res) {
      customers.find_active(req, res);
    });

    app.get('/logout', function(req, res) {
      customers.deactivate(req, res);
    });

    app.get('/home', function(req, res) {
      customers.home(req, res);
    });

    app.get('/dispOrders', function(req, res) {
      orders.displayOrders(req, res);
    });

    app.get('/dispCustomers', function(req, res) {
      customers.displayCustomers(req, res);
    });

    app.get('/dashboard', function(req, res) {
      dashboard.show(req, res);
    });

    app.get('/dispProducts', function(req, res) {
      products.displayProducts(req, res);
    });

    app.post('/addProduct', function(req, res) {
      products.add(req, res);
    });

    app.get('/orders', function(req, res) {
      orders.show(req, res); // delegating to the controller and passing along req and res
    });

    app.post('/addOrder', function(req, res) {
      orders.add(req, res);
    });

    app.post('/deleteOrder', function(req, res) {
      orders.delete(req, res);
    });

    app.post('/updateOrder', function(req, res) {
      orders.update(req, res);
    });

    app.get('/products', function(req, res) {
      products.show(req, res);
    });

    app.post('/deleteProduct', function(req, res) {
      products.delete(req, res);
    });

    app.post('/updateProduct', function(req, res) {
      products.update(req, res);
    });

    app.get('/customers', function(req, res) {
      customers.show(req, res);
    });

     app.post('/add', function(req, res) {
      customers.add(req, res);
    });

     app.post('/delete', function(req, res) {
      customers.delete(req, res);
    });


    app.get('/tags', function(req, res) {
      tags.show(req, res);
    });

    app.post('/addTag', function(req, res) {
      tags.add(req, res);
    });

    app.post('/deleteTag', function(req, res) {
      tags.delete(req, res);
    });
    app.post('/register', function(req, res, next){
	 authenticator.register(req, res, next)
     });

    app.post('/login', function(req, res, next){
    	 authenticator.login(req, res, next)
         });
    app.post('/createAdmin', function(req, res, next){
      authenticator.createAdmin(req, res, next)
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


  });
