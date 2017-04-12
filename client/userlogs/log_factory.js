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


    log_app.controller('logController', function($scope, $window, $http, LogFactory, /*auth,*/ $document) {
        // console.log("USER ID: " + auth.currentUserID());
        // var thisId = {userId: auth.currentUserID()};

        LogFactory.getorders(function(data) {
          console.log("scope getting requests");
          console.log(data);
          $scope.list_of_requests = data;
        });



        LogFactory.getLogs(function(data) {
          console.log("scope getting logs");
          console.log(data);

          for (var m = 0; m < data.length; m++) {
            data[m].items = [];
            var quant = data[m].quantity;
            if (data[m].request) {
              for (var r = 0; r < $scope.list_of_requests.length; r++) {
                if ($scope.list_of_requests[r]._id == data[m].request) {
                  for (var it = 0; it < $scope.list_of_requests[r].items.length; it++) {
                    if ($scope.list_of_requests[r].items[it].item == null) {
                      data[m].items.push("[Deleted item]");
                    }
                    else {
                      data[m].items.push($scope.list_of_requests[r].items[it].item.name);
                    }
                  }
                }
              }
              data[m].quantity = quant;
            }
            else {

             if (data[m].item) {
               var items_array = [];
              
                for (var a = 0; a < data[m].item.length; a++) {
                  items_array.push(data[m].item[a].name);
                }

                data[m].items = items_array;

                if (items_array.length == 0) {
                  data[m].items.push(data[m].name_list[0]);
                }

             }
            }

            // if (data[m].name_list[0]==null) {
            // if (data[m].item.length < data[m].quantity.length) {
            //   data[m].items.push("[Deleted item]");
            // }

          }

          $scope.logs = data;
          $scope.originalLogs = $scope.logs;
          color_table_elements();

          /** PAGINATION **/

          $scope.pagesShown = 1;
          $scope.pageSize = 7;

          $scope.paginationLimit = function(data) {
           return $scope.pageSize * $scope.pagesShown;
          };

          $scope.hasMoreItemsToShow = function() {
           return $scope.pagesShown < ($scope.logs.length / $scope.pageSize);
          };

          $scope.showMoreItems = function() {
           $scope.pagesShown = $scope.pagesShown + 1;       
          }; 

         /** END OF PAGINATION **/


        });

        LogFactory.getItems(function(data) {
          console.log("scope getting items");
          console.log(data);
        });

        $scope.user = LogFactory.getcustomers(function(data) {
         $scope.user = data;

         $scope.authorized = data.status == "admin" || data.status == "manager";
         $scope.myName = data.username || data.netId || data.name;

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

         console.log("AUTHORIZED:")
         console.log($scope.authorized);
         console.log(data);
       })



        $scope.getItem = function(item_name) {
          // console.log("GETTING ITEM " + item_name);
          var item_info = {};
          $window.localStorage['itemSelected'] = item_name;
          //$window.localStorage['itemDeleted'] = item_name;

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
                  console.log(df);
                    if ($scope.logs[i].date >= df)  {
                        result.push($scope.logs[i]);
                    }
                }
                console.log("filtering logs");
                console.log(result);
                $scope.logs = result;

                  $scope.pagesShown = 1;
                  $scope.pageSize = 7;

                  $scope.paginationLimit = function(data) {
                   return $scope.pageSize * $scope.pagesShown;
                  };

                  $scope.hasMoreItemsToShow = function() {
                   return $scope.pagesShown < ($scope.logs.length / $scope.pageSize);
                  };

                  $scope.showMoreItems = function() {
                   $scope.pagesShown = $scope.pagesShown + 1;       
                  }; 
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
