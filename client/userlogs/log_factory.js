var log_app = angular.module('log_app', []);

    log_app.factory('LogFactory', function($http) {
      var factory = {};
      var logs = [];
      var customers = [];

      factory.getcustomers = function(callback) {
        $http.get('/api/user').success(function(output) {
          customers = output;
          callback(customers);
        })
      }

      factory.getLogs = function(callback) {
        $http.get('/api/log/show').success(function(output) {
          logs = output;
          callback(logs);
        })
      }

      factory.getItems = function(callback) {
        $http.get('/api/item/show').success(function(output) {
          var items = output;
          callback(items);
        })
      }

      factory.getLogFilter = function(info, callback) {
        $http.post('/api/log/filter', info).success(function(output) {
          var filteredOutput = output;
          callback(filteredOutput);
        })
      }

      factory.getLogItem = function(info, callback) {
        $http.post('/api/log/item', info).success(function(output) {
          var itemOutput = output;
          callback(itemOutput);
        })
      }

      // TO FIX
      factory.goToLogItem = function(info, callback) {
        $http.get('/dispProducts').success(function(output) {
          console.log("SUCCESS in dispProducts");
        })
      }

      // to remove
      factory.getorders = function(callback) {
        $http.get('/api/request/show').success(function(output) {
          orders = output;

          callback(orders);
        })
      }

      return factory;
    });


    log_app.controller('logController', function($scope, $rootScope, $window, $http, LogFactory, /*auth,*/ $document) {
        // console.log("USER ID: " + auth.currentUserID());
        // var thisId = {userId: auth.currentUserID()};

        LogFactory.getorders(function(data) {
          console.log("scope getting requests");
          console.log(data);
        });



        LogFactory.getLogs(function(data) {
          console.log("scope getting logs");
          console.log(data);


          for (var m = 0; m < data.length; m++) {

            var items_array = [];

            for (var a = 0; a < data[m].item.length; a++) {
              items_array.push(data[m].item[a].name);
            }

            data[m].items = items_array;
          }

          $scope.logs = data;
          $scope.originalLogs = $scope.logs;
          color_table_elements();
        });

        LogFactory.getItems(function(data) {
          console.log("scope getting items");
          console.log(data);
        });

        $scope.user = LogFactory.getcustomers(function(data) {
         $scope.user = data;

         $scope.authorized = data.status == "admin";
         $scope.myName = data.username || data.netId || data.name;


         console.log("AUTHORIZED:")
         console.log($scope.authorized);
         console.log(data);
       })



        $scope.getItem = function(item_name) {
          console.log("GETTING ITEM " + item_name);
          var item_info = {};
          $rootScope.item_selected = item_name;
          $window.localStorage['itemSelected'] = item_name;

          $window.location.href = "/products/products.html";

          // TO FIX
          // LogFactory.goToLogItem({name: item_name}, function(data) {
          //   item_info = data;
          // });

        }

        $scope.viewRequest = function(requestID) {
          $window.localStorage['requestSelected'] = requestID;
          $window.location.href = "/orders/orders.html";
        }

        $scope.logsOld = [{
            _id: 555,
            init_user: "User A",
            items: ["resistors2"],
            event: "Disbursement",
            rec_user: "User B",
            date: "2017-02-02T19:06:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 135,
            init_user: "User C",
            items: ["clock", "resistors2"],
            event: "Request",
            rec_user: "User B",
            date: "2017-02-05T19:05:13.093Z",
            admin_actions: "Denied"
          },
          {
            _id: 145,
            init_user: "User E",
            items: ["pineapple", "resistor"],
            event: "Request",
            rec_user: "User F",
            date: "2017-02-20T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 155,
            init_user: "User C",
            items: ["clock"],
            event: "Request",
            rec_user: "User G",
            date: "2017-02-15T19:05:13.093Z",
            admin_actions: "Denied"
          },
          {
            _id: 125,
            init_user: "User C",
            items: ["cake"],
            event: "Request",
            rec_user: "User A",
            date: "2017-03-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 124,
            init_user: "User D",
            items: ["pumpkin"],
            event: "Request",
            rec_user: "User A",
            date: "2017-01-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 123,
            init_user: "User C",
            items: ["stem", "leaf", "plant"],
            event: "Disbursement",
            rec_user: "User E",
            date: "2017-05-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 123,
            init_user: "User C",
            items: ["stem", "leaf", "plant"],
            event: "Disbursement",
            rec_user: "User E",
            date: "2017-05-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 123,
            init_user: "User C",
            items: ["stem", "leaf", "plant"],
            event: "Disbursement",
            rec_user: "User E",
            date: "2017-05-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 123,
            init_user: "User C",
            items: ["stem", "leaf", "plant"],
            event: "Disbursement",
            rec_user: "User E",
            date: "2017-05-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 123,
            init_user: "User C",
            items: ["stem", "leaf", "plant"],
            event: "Disbursement",
            rec_user: "User E",
            date: "2017-05-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 123,
            init_user: "User C",
            items: ["stem", "resistors2", "plant"],
            event: "Disbursement",
            rec_user: "User E",
            date: "2017-05-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 123,
            init_user: "User C",
            items: ["stem", "leaf", "plant"],
            event: "Disbursement",
            rec_user: "User E",
            date: "2017-05-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 123,
            init_user: "User C",
            items: ["stem", "leaf", "plant"],
            event: "Disbursement",
            rec_user: "User E",
            date: "2017-05-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 123,
            init_user: "User C",
            items: ["stem", "leaf", "plant"],
            event: "Disbursement",
            rec_user: "User E",
            date: "2017-05-12T19:05:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 255,
            init_user: "User A",
            items: ["basket"],
            event: "Disbursement",
            rec_user: "User D",
            date: "2017-02-09T19:06:13.093Z",
            admin_actions: "Pending"
          }
      ];




      function color_table_elements() {
        var rows = document.getElementById('myLogTable').getElementsByTagName('tr');

        for (var i = 1; i < rows.length; i=i+2) {
          rows[i].style.backgroundColor = "#b7cece";
        }
      }

      color_table_elements();

      $scope.filterByDate = function() {
        $scope.logs = $scope.originalLogs;
        console.log($scope.logs);

        console.log("in filter function");
                var df = $scope.dateSelected;
                var result = [];
                for (var i=0; i<$scope.logs.length; i++){
                    if ($scope.logs[i].date >= df)  {
                        result.push($scope.logs[i]);
                    }
                }
                console.log("filtering logs");
                console.log(result);
                $scope.logs = result;
      }

      $("#datepicker").datepicker({
        dateFormat: 'yy-mm-dd' ,
          onSelect: function(dateText, inst) {
              $scope.dateSelected = $(this).val();
              if (!$scope.search) {
                $scope.search = {};
              }
          }
      });

      $scope.clearFields = function() {
          $(".searchBox").val("");
          $scope.search = {};
          $scope.logs = $scope.originalLogs;
      }

        // AUTH
        $scope.logout = function() {
          $http.get('/api/auth/logout').success(function(output) {
            $scope.isLoggedIn = false;
            window.location.assign("/");
          });
        }

        $scope.getCurrentStatus = function() {
          return auth.currentUserStatus();
        }
    })
