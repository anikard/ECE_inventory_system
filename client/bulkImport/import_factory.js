var emails_app = angular.module('import_app', []);

    emails_app.factory('ImportFactory', function($http) {
      var factory = {};

      factory.importItems = function(info, callback_success, callback_failure) {
          $http.post('/api/item/addAll', info).then(function success(response) {
            callback_success(response);

            }, function error(response) {
            callback_failure(response.data);
            });
        }

        factory.getuser = function(callback) {
          $http.get('/api/user').success(function(output) {
            callback(output);
          })
      }

      return factory;
    });

    emails_app.controller('importController', function($scope, $http, $window, ImportFactory, /*auth,*/ $document) {
        
        console.log("IMPORT CONROLLER");

        $scope.user = ImportFactory.getuser(function(data) {
          $scope.user = data;
          $scope.authorized = data.status == "admin" || data.status =="manager";
          $scope.myName = data.username || data.netId || data.name;

          $document[0].getElementById('successDiv').style.display = "none";
          $document[0].getElementById('failureDiv').style.display = "none";
          
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
        })
        
        $scope.importItems = function(items) {
          console.log("in import items");
          console.log(items);
          // console.log("LIST");
          // var replacement = (items.list).replace("quantity", "quantity_available");
          var info = {};
          info.imports = items.list;

          ImportFactory.importItems(info, function(data) {
              console.log("import success");
              $document[0].getElementById('successDiv').style.display = "block";
              $document[0].getElementById('failureDiv').style.display = "none";
              // if(confirm('Successfully imported items. Click OK to view items.')){window.location.reload();}
          }, function(data) {
              var errorStr = "Failed to import. "; 
              if (data.items) {

                if (data.items.length <= 1) {
                  errorStr += "Item " + data.items[0] + " already exists.";
                }
                else {
                  var itemsStr = "[";
                  var k;

                  for (k = 0; k < data.items.length-1; k++) {
                    itemsStr += data.items[k] + ", ";
                  }
                  itemsStr += data.items[data.items.length-1] + "]";

                  errorStr += "Items " + itemsStr + " already exist.";
                }
                
              }
              else if (data.error) {
                errorStr += data.error + ".";
              }

              $document[0].getElementById('failureDiv').innerHTML = errorStr;
              $document[0].getElementById('failureDiv').style.display = "block";
              $document[0].getElementById('successDiv').style.display = "none";
              // if(confirm('Successfully imported items. Click OK to view items.')){window.location.reload();}
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
