var orders_app = angular.module('orders_app', []);

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

      factory.getorders = function(callback) {
        $http.get('/orders').success(function(output) {
          orders = output;

          console.log(orders);
          orders.forEach(function(elem) {
            // elem["customer_name"] = elem["userId"].name;
            elem.customer_name = "SAMPLE NAME"
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

      factory.updateOrder = function(info, callback) {
        $http.post('/updateOrder', info).success(function(output) {
            // TODO
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


    orders_app.controller('ordersController', function($scope, OrderFactory, $document) {
        $scope.orders = OrderFactory.getorders(function(data) {
        $scope.orders = data;
      });
      $scope.addOrder = function() {

        console.log("addOrder from order controller scope");

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

        console.log($scope.new_order);

       // $scope.new_order.status = "pending";
        OrderFactory.addOrder($scope.new_order, function(data) {
          $scope.new_order.date = new Date();
          $scope.orders.push($scope.new_order);
          $scope.new_order = {};
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

            if ($scope.thisOrder.status != "open") {
              ($document[0].getElementById('request_response_form')).style.display = "none";
              ($document[0].getElementById('cancelOrderButton')).style.display = "none";
              ($document[0].getElementById('respondOrderButton')).style.display = "none";
            }
            else {
              ($document[0].getElementById('request_response_form')).style.display = "block";
              ($document[0].getElementById('cancelOrderButton')).style.display = "inline";
              ($document[0].getElementById('respondOrderButton')).style.display = "inline";
            }
            console.log(data);
        });

      }


      $scope.respondToOrder = function() {
        $('#orderModal').modal('hide');

        $scope.orderResponse.dateFulfilled = new Date();
        console.log($scope.orderResponse);
        OrderFactory.updateOrder($scope.orderResponse, function(data) {
          $scope.orderResponse = {};
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
