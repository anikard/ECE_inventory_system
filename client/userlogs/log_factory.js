var log_app = angular.module('log_app', []);

    log_app.factory('LogFactory', function($http) {
      var factory = {};
      var logs = [];

      
      factory.getLogs = function(info, callback) {
        // $http.post('/logs', info).success(function(output) {
        //   logs = output;
        //   console.log(logs);
        //   callback(logs);
        // })
      }

      return factory;
    });


    log_app.controller('logController', function($scope, LogFactory, auth, $document) {
        console.log("USER ID: " + auth.currentUserID());
        var thisId = {userId: auth.currentUserID()};
        LogFactory.getLogs(thisId, function(data) {
          $scope.logs = data;
        });

        $scope.logs = [{
            _id: 555,
            init_user: "User A",
            items: ["resistor"],
            event: "Disbursement",
            rec_user: "User B",
            date: "2017-02-02T19:06:13.093Z",
            admin_actions: "Approved"
          },
          {
            _id: 155,
            init_user: "User C",
            items: ["clock", "resistor"],
            event: "Request",
            rec_user: "User B",
            date: "2017-02-05T19:05:13.093Z",
            admin_actions: "Denied"
          },
          {
            _id: 155,
            init_user: "User C",
            items: ["cake", "resistor"],
            event: "Request",
            rec_user: "User A",
            date: "2017-02-12T19:05:13.093Z",
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

      $scope.originalLogs = $scope.logs;

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
    })

   
    log_app.factory('auth', ['$http', '$window', function($http, $window){
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
