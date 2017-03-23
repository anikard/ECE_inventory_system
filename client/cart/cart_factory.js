var orders_app = angular.module('cart_app', []);

    orders_app.factory('OrderFactory', function($http) {
      var factory = {};
      var orders = [];
      var customers = [];
      var products = [];

      factory.getproducts = function(callback) {
        console.log("getting products in cart");
        $http.get('/api/item/show').success(function(output) {
          products = output;
          console.log("got products in cart");
          console.log(products);
          callback(products);
        })
      }

      factory.getorders = function(callback) {
        console.log("getting cartItems in cart");
        $http.get('/api/cart/show').success(function(output) {
          orders = output;
          callback(orders);
        })
      }

      factory.getuser = function(callback) {
        $http.get('/api/user').success(function(output) {
          callback(output);
        })
      }

      factory.getcustomers = function(callback) {
        $http.get('/api/user/show').success(function(output) {
          callback(output);
        })
      }

      factory.addToCart = function(info, callback) {
        console.log("adding to cart in factory");
        $http.post('/api/cart/add', info).success(function(output) {
            orders = output;
            callback(orders);
        })
      }

      factory.createRequest = function(info, callback) {
        $http.post('/api/request/add', info).success(function(output) {
            console.log("created request in factory of cart")
        })
        $('#orderModal').modal('hide');
        $('#disburseModal').modal('hide');
      }

      factory.removeFromCart = function(order, callback) {
        $http.post('/api/cart/del', order).success(function(output) {
            orders = output;
            callback(orders);
        })
      }

      return factory;
    });

    orders_app.controller('ordersController', function($scope, $http, OrderFactory, $document) {

      // AUTH
      $scope.user = OrderFactory.getuser(function(data) {
        $scope.user = data;
        $scope.myName = data.username || data.netId || data.name;
        $scope.authorized = data.status == "admin" || data.status == "manager";
        $scope.adminOnly = data.status == "admin";

        if ($scope.authorized) {
            jQuery.get('../navBar_auth.html', function(data) {
                  document.getElementById("navBar").innerHTML = data;
            });
        } 
        else {
            jQuery.get('../navBar_unAuth.html', function(data) {
                  document.getElementById("navBar").innerHTML = data;
            });
        }
      })

      $scope.logout = function() {
        $http.get('/api/auth/logout').success(function(output) {
          $scope.isLoggedIn = false;
          window.location.assign("/");
        });
      }

      $scope.orders = OrderFactory.getorders(function(data) {
        $scope.orders = data;
        console.log($scope.orders);
      });

      $scope.customers = OrderFactory.getcustomers(function(data) {
        $scope.customers = data;
        console.log("GETTTING USERS");
        console.log($scope.customers);
      })

      $scope.addToCart = function() {
        console.log("addToCart from cart controller scope");
        var itemSelected = $document[ 0 ].getElementById('productList');
        if (!itemSelected.value || !$scope.new_order || !$scope.new_order.quantity) {
            alert('Please fill out all the fields.');
            return;
          }

        // TODO: Ugly, refactor to pass backend item._id and item.name
        $scope.current_item_name = ((itemSelected.options[itemSelected.selectedIndex].text).split("|"))[0];
        $scope.new_order.item = itemSelected.value;

        console.log($scope.new_order);

        OrderFactory.addToCart($scope.new_order, function(data) {
          var pushOrder = {};
          pushOrder.quantity = $scope.new_order.quantity;
          pushOrder.item = {};
          pushOrder.item.name = $scope.current_item_name;
          $scope.orders.push(pushOrder);
          $scope.new_order = {};
        });
      }

      $scope.createRequest = function() {
        console.log("createRequest from cart controller scope");
        $scope.this_request.items = $scope.orders;
        console.log($scope.this_request);
        OrderFactory.createRequest($scope.this_request, function(data) {
          $scope.orders = {};
          $scope.this_request = {};
        });
      }

      $scope.removeFromCart = function(order) {
          $('#orderModal').modal('hide');
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
