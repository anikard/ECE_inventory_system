var orders_app = angular.module('cart_app', []);

    orders_app.factory('OrderFactory', function($http) {
      var factory = {};
      var orders = [];
      var customers = [];
      var products = [];

      factory.getproducts = function(callback) {
        $http.get('/products').success(function(output) {
          products = output;
          callback(products);
        })
      }

      factory.getcustomers = function(callback) {
        $http.get('/customers').success(function(output) {
          customers = output;
          callback(customers);
        })
      }

      factory.getorders = function(info, callback) {
        $http.post('/orders', info).success(function(output) {
          orders = output;

          console.log(orders);
          orders.forEach(function(elem) {
            //elem["customer_name"] = elem["userId"].name;
          })
          console.log(orders);

          callback(orders);
        })
      }

      factory.viewOrder = function(order, callback) {
        callback(order);

      }

      factory.addOrder = function(info, callback) {
        $http.post('/addOrder', info).success(function(output) {
            orders = output;
            callback(orders);
        })
      }

      factory.addToCart = function(info, callback) {
        console.log("adding to cart in factory");
        $http.post('/addToCart', info).success(function(output) {
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

      factory.updateOrder = function(info, callback) {
        $http.post('/updateOrder', info).success(function(output) {
            callback(output);
        })
      }


      factory.removeOrder = function(order, callback) {
        $http.post('/deleteOrder', order).success(function(output) {
            console.log(output.length);
            orders = output;
            callback(orders);
        })
      }

      return factory;
    });


    orders_app.controller('ordersController', function($scope, OrderFactory, auth, $document) {
        console.log("USER ID: " + auth.currentUserID());
        var thisId = {userId: auth.currentUserID()};
        $scope.orders = OrderFactory.getorders(thisId, function(data) {
        $scope.orders = data;

      });

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


      $scope.addOrder = function() {

        console.log("addOrder from order controller scope");

        
        if ($scope.authorized) {
          var customerSelected = $document[ 0 ].getElementById('customerList');

          var itemSelected = $document[ 0 ].getElementById('productList');

          if (!customerSelected.value || !itemSelected.value || !$scope.new_order || !$scope.new_order.quantity || !$scope.new_order.reason) {
            console.log('Form incomplete');
            return;
          }

          $scope.new_order.userId = customerSelected.value; // id
          $scope.new_order.customer_name = customerSelected.options[customerSelected.selectedIndex].text;
          $scope.new_order.item_name = ((itemSelected.options[itemSelected.selectedIndex].text).split("|"))[0];
          $scope.new_order.itemId = itemSelected.value; // id
          $scope.new_order.status = "open";
        }
        else {

          var itemSelected = $document[ 0 ].getElementById('productList');

          if (!itemSelected.value || !$scope.new_order || !$scope.new_order.quantity || !$scope.new_order.reason) {
            console.log('Form incomplete');
            return;
          }

          $scope.new_order.userId = auth.currentUserID(); // id
          console.log("GOT ID = " + $scope.new_order.userId);
          $scope.new_order.customer_name = $scope.myName;
          $scope.new_order.item_name = ((itemSelected.options[itemSelected.selectedIndex].text).split("|"))[0];
          $scope.new_order.itemId = itemSelected.value; // id
          $scope.new_order.status = "open";
        }


        console.log($scope.new_order);

       // $scope.new_order.status = "pending";
        OrderFactory.addOrder($scope.new_order, function(data) {
          $scope.new_order.date = new Date();
          $scope.orders.push($scope.new_order);
          $scope.new_order = {};
        });
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




        $scope.removeOrder = function(order) {
          $('#orderModal').modal('hide');
          OrderFactory.removeOrder(order, function(data) {
            for (var i =0; i < $scope.orders.length; i++)
            {  if ($scope.orders[i]._id === order._id) {
                  $scope.orders.splice(i,1);
                  break;
                }
            }
        });

      }


      $scope.viewOrder = function(order) {
          OrderFactory.viewOrder(order, function(data) {

            $scope.thisOrder = data;
            $scope.thisOrder.customer_name = data.user.username;
            console.log("THIS ORDER");
            console.log($scope.thisOrder);
            if ($scope.thisOrder.status != "open") {
              ($document[0].getElementById('cancelOrderButton')).style.display = "none";
              ($document[0].getElementById('request_response_form')).style.display = "none";
            }
            else {
              ($document[0].getElementById('cancelOrderButton')).style.display = "inline";
              ($document[0].getElementById('request_response_form')).style.display = "block";
              ($document[0].getElementById('respondOrderButton')).style.display = "inline";
            }
            console.log(data);
        });

      }


      $scope.respondToOrder = function() {
        $('#orderModal').modal('hide');
        // $scope.orderResponse.dateFulfilled = new Date();
        console.log("RESPONDING TO ORDER");
        var approved = $document[0].getElementsByClassName('approveButton')[0].checked;
        var denied = $document[0].getElementsByClassName('denyButton')[0].checked;

        console.log(approved);
        console.log(denied);

        $scope.responseToOrder = {};

        if (approved) { $scope.responseToOrder.status = "approved"; }
        else if (denied) { $scope.responseToOrder.status = "denied"; }
        $scope.responseToOrder.note = $document[0].getElementById('message-text').value;;
        $scope.responseToOrder._id = $scope.thisOrder._id;


        console.log($scope.responseToOrder);
        OrderFactory.updateOrder($scope.responseToOrder, function(data) {
          $scope.orderResponse = {};
          $scope.responseToOrder = {};
        });




      }


    })

    orders_app.controller('productsController', function($scope, OrderFactory) {
        $scope.products = OrderFactory.getproducts(function(data) {
        $scope.products = data;
      })
    })

    orders_app.controller('customersController', function($scope, OrderFactory) {
        $scope.customers = OrderFactory.getcustomers(function(data) {
        $scope.customers = data;

        //TODO: delete this line and the two below
        console.log("inside ord cust");
        console.log($scope.customers);
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
