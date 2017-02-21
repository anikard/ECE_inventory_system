var orders_app = angular.module('cart_app', []);

    orders_app.factory('OrderFactory', function($http) {
      var factory = {};
      var orders = [];
      var customers = [];
      var products = [];

      factory.getproducts = function(callback) {
        console.log("getting products in cart");
        $http.get('/api/v1/item/show').success(function(output) {
          products = output;
          console.log("got products in cart");
          console.log(products);
          callback(products);
        })
      }

      
      factory.getorders = function(info, callback) {
        console.log("getting cartItems in cart");
        $http.post('/api/v1/cart/show', info).success(function(output) {
          orders = output;

          console.log(orders);
          orders.forEach(function(elem) {
            //elem["customer_name"] = elem["userId"].name;
          })
          console.log(orders);

          callback(orders);
        })
      }

     

      // factory.addOrder = function(info, callback) {
      //   $http.post('/addOrder', info).success(function(output) {
      //       orders = output;
      //       callback(orders);
      //   })
      // }

      factory.addToCart = function(info, callback) {
        console.log("adding to cart in factory");
        // $http.post('/addToCart', info).success(function(output) {
        $http.post('/api/v1/cart/add', info).success(function(output) {
            orders = output;
            callback(orders);
        })
      }

      factory.createRequest = function(info, callback) {
        $http.post('/createRequest', info).success(function(output) {
            // orders = output;
            // callback(orders);
            console.log("created request in factory of cart")
        })
      }


      factory.removeFromCart = function(order, callback) {
        $http.post('/deleteFromCart', order).success(function(output) {
            orders = output;
            callback(orders);
        })
      }

      return factory;
    });


    orders_app.controller('ordersController', function($scope, OrderFactory, auth, $document) {
        console.log("USER ID: " + auth.currentUserID());
        $scope.orders = {};
        var thisId = {userId: auth.currentUserID()};
        OrderFactory.getorders(thisId, function(data) {
          $scope.orders = data;

        });
        console.log("scope cartItems");
        console.log($scope.orders);
        $scope.myName = auth.currentUser();
        console.log("MY NAME: " + $scope.myName);
        $scope.authorized = (auth.currentUserStatus()=="admin");
        

        // AUTH
        $scope.logout = function() {
          console.log("scope logging out ");
          auth.logout(function() {
            $scope.isLoggedIn = false;
            window.location.assign("/");
          });
        }

        $scope.getCurrentStatus = function() {
          return auth.currentUserStatus();
        }


      $scope.addToCart = function() {

        console.log("addToCart from cart controller scope");

        var itemSelected = $document[ 0 ].getElementById('productList');

        if (!itemSelected.value || !$scope.new_order || !$scope.new_order.quantity) {
            alert('Please fill out all the fields.');
            return;
          }

        $scope.new_order.item_name = ((itemSelected.options[itemSelected.selectedIndex].text).split("|"))[0];
        $scope.new_order.itemId = itemSelected.value;

        console.log($scope.new_order);

        OrderFactory.addToCart($scope.new_order, function(data) {
          $scope.new_order.date = new Date();
          $scope.orders.push($scope.new_order);
          $scope.new_order = {};
        });
      }

      $scope.createRequest = function() {

        console.log("createRequest from cart controller scope");

        // console.log($scope.this_request.reason);

        $scope.this_request.cartItems = $scope.orders;

        console.log($scope.this_request);

        OrderFactory.createRequest($scope.this_request, function(data) {
          $scope.orders = {};
          $scope.this_request = {};
        });
      }

      $scope.removeFromCart = function(order) {
          $('#orderModal').modal('hide');
          order.userId = auth.currentUserID();
          OrderFactory.removeFromCart(order, function(data) {
            for (var i =0; i < $scope.orders.length; i++)
            {  if ($scope.orders[i]._id === order._id) {
                  $scope.orders.splice(i,1);
                  break;
                }
            }
        });

      }


    })

    orders_app.controller('productsController', function($scope, OrderFactory) {
        $scope.products = OrderFactory.getproducts(function(data) {
        $scope.products = data;
      })
    })

    orders_app.factory('auth', ['$http', '$window', function($http, $window){
       var auth = {};

        auth.getToken = function (){
          return $window.localStorage['inventoryToken'];
        }

        auth.isLoggedIn = function(){
          var token = auth.getToken();
          if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
          } else {
            return false;
          }
        };

        auth.currentUser = function(){
          if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            
            return payload.username;
          }
        };

        auth.currentUserID = function(){
          if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            
            return payload._id;
          }
        };

        auth.currentUserStatus = function(){
          if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            
            return payload.status;
          }
        };

        auth.getUserStatus = function () {
          var userId = "";
          if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            userId = payload._id;
          }

          $http.post('/getUser', userId).success(function(output) {
            console.log(output);
            callback(output);
          })

        }


        auth.logout = function(callback){
          $window.localStorage.removeItem('inventoryToken');
          callback();
        };

      return auth;
    }])
