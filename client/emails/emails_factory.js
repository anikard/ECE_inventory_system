var orders_app = angular.module('orders_app', []);

    orders_app.factory('EmailFactory', function($http) {
      var factory = {};
      var orders = [];
      var customers = [];
      var products = [];

      factory.getUsers = function(callback) {
          $http.get('/api/user/show').success(function(output) {
            customers = output;
            callback(customers);
          })
        }

        factory.updateUser = function(info, callback) {
          $http.post('/api/user/subscribe', info).success(function(output) {
            callback();
          })
        }





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

      factory.getuser = function(callback) {
        $http.get('/api/user').success(function(output) {
          callback(output);
        })
      }

      factory.getorders = function(callback) {
        $http.get('/api/request/show').success(function(output) {
          orders = output;

          console.log(orders);
          orders.forEach(function(elem) {
            //WHAT I REMOVED WAS ONE LINE OF COMMENTS HERE
            // elem["customer_name"] = elem["userId"].name;
            //elem.customer_name = "SAMPLE NAME"
          })
          console.log(orders);

          callback(orders);
        })
      }

     

      return factory;
    });


  orders_app.controller('productsController', function($scope, $http, EmailFactory) {
        $scope.products = EmailFactory.getproducts(function(data) {
        $scope.products = data;
      })
    })


    orders_app.controller('emailsController', function($scope, $http, $window, EmailFactory, /*auth,*/ $document) {
        //console.log("USER ID: " + auth.currentUserID());
        //var thisId = {userId: auth.currentUserID()};
        
        $scope.users = EmailFactory.getUsers(function(data) {
          $scope.users = data;
          console.log("GETTTING USERS");
          console.log($scope.users);


          $scope.sub_managers = [];

          for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].status == "manager" && $scope.users[i].subscribed == "subscribed") {
              $scope.sub_managers.push($scope.users[i]);
            }
          }


        });


        $scope.user = EmailFactory.getuser(function(data) {
          $scope.user = data;

          $scope.authorized = data.status == "admin" || data.status =="manager";
          $scope.myName = data.username || data.netId || data.name;

          console.log("AUTHORIZED:")
          console.log($scope.authorized);

          $scope.tableRows = document.getElementById('myRequestsTable').getElementsByTagName('tr');
          $scope.scrollIntoView($scope.requestIndex);
        })

     
        $scope.subscribeMyself = function() {
          var info = {};
          info.subscribed = "subscribed";
          info._id = $scope.user._id;
            EmailFactory.updateUser(info, function() {
              console.log("subscribed myself Success");
            })
        }

        $scope.unsubscribeUser = function(userId) {
          var info = {};
          info.subscribed = "unsubscribed";
          info._id = userId;
            EmailFactory.updateUser(info, function() {
              console.log("unsubscribed Success");
            })
        }


        // AUTH
        $scope.logout = function() {
          $http.get('/api/auth/logout').success(function(output) {
            $scope.isLoggedIn = false;
            window.location.assign("/");
          });
        }
        

    })
