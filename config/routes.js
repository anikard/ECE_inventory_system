/********************************************************/
/*                       ROUTES                         */
/********************************************************/

module.exports = (app) => {
  app.all('/api/v1/*', [require('./validateRequest')]);
  app.all('/api/v2/*', [require('./validateRequest')]);
  
  require('./../server/controllers/oauth.js')(app);
  require('./../server/controllers/authenticator.js')(app);
  require('./../server/controllers/users.js')(app);
  require('./../server/controllers/cart.js')(app);
  require('./../server/controllers/tags.js')(app);
  require('./../server/controllers/requests.js')(app);
  require('./../server/controllers/items.js')(app);
  require('./../server/controllers/fields.js')(app);

  app.get('/home', function(req, res) {
    res.redirect('/');
  });

  app.get('/dispOrders', function(req, res) {
    res.redirect('orders/orders.html');
  });

  app.get('/dispCustomers', function(req, res) {
    res.redirect('customers.html');
  });

  app.get('/dispProducts', function(req, res) {
    res.redirect('products/products.html');
  });

  app.get('/dashboard', function(req, res) {
    res.redirect('dashboard.html');
  });

  /********************************************************/
  /*                       Old Stuff                      */
  /********************************************************/
  app.post('/addUser', function(req, res) {
    customers.update(req, res);
    dashboard.show(req, res);
  });

  

  app.post('/addToCart', function(req, res) {
    // req.body = {_id: id;, itemId: id, item_name: String, quantity: int}
    console.log("adding to cart in routes");
    //cart.add(req, res); // TODO
  });

  app.post('/createRequest', function(req, res) {
    // req.body = {_id: id;, cartItems: Array of Orders, reason: String}
    orders.add(req, res);
  });

  app.post('/deleteFromCart', function(req, res) {
    // req.body = {_id: id; userId: id, item: Object, date: Date, quantity: int}
    // cart.delete(req, res);
  });

  

  

  

  app.post('/addProduct', function(req, res) {
    products.add(req, res);
  });

  app.get('/orders', function(req, res) {
    orders.show(req, res); // delegating to the controller and passing along req and res
  });

  app.post('/orders', function(req, res) {
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

  app.post('/register', function(req, res, next){
    authenticator.register(req, res, next);
  });

  app.post('/login', function(req, res, next){
     authenticator.login(req, res, next);
  });

  app.post('/logs', function(req, res) {
    // TODO
     // log = { 
     //      _id: id, 
     //      init_user: String, 
     //      items: Array of Strings, 
     //      event: String, r
     //      ec_user: String, 
     //      date: date object, 
     //      admin_actions: String
     //      }
     
    // orders.show(req, res); 
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
