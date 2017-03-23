var emails_app = angular.module('import_app', []);

    emails_app.factory('ImportFactory', function($http) {
      var factory = {};

      factory.importItems = function(info, callback) {
          $http.post('/api/item/addAll', info).success(function(output) {
            callback(output);
          })
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

        // document.getElementById("navBar").innerHTML='<object type="text/html" data="import.html" ></object>';
        // document.getElementById("navBar").innerHTML='<span ng-if="authorized"><a href="/dispCustomers">users</a> |</span> <a href="/dispOrders">requests</a> | <a href="/dispProducts">items</a> | <span ng-if="authorized"><a href="/dispFields">custom fields</a> | </span> <a href="/dispCart">cart</a> | <span ng-if="authorized"><a href="/dispLog">log</a> | <span ng-if="authorized"><a href="/dispEmails">emails</a> | <span ng-if="authorized"><a href="/dispImport">bulk import</a> | </span> <a href="" ng-click="logout()">logout {{myName}}</a>';

        $scope.user = ImportFactory.getuser(function(data) {
          $scope.user = data;
          $scope.authorized = data.status == "admin" || data.status =="manager";
          $scope.myName = data.username || data.netId || data.name;
          
          // setting nav bar
          // document.getElementById("navBar").innerHTML='<span ng-if="authorized"><a href="/dispCustomers">users</a> |</span> <a href="/dispOrders">requests</a> | <a href="/dispProducts">items</a> | <span ng-if="authorized"><a href="/dispFields">custom fields</a> | </span> <a href="/dispCart">cart</a> | <span ng-if="authorized"><a href="/dispLog">log</a> | <span ng-if="authorized"><a href="/dispEmails">emails</a> | <span ng-if="authorized"><a href="/dispImport">bulk import</a> | </span> <a href="" ng-click="logout()">logout ' + $scope.myName + '</a>';
           

          jQuery.get('../navBar.html', function(data) {
              // alert(data);
              document.getElementById("navBar").innerHTML = data;
          });

           // $("#navBar").load("../navBar.html");
           // document.getElementById("navBar").innerHTML += '<a href="" ng-click="logout()">logout ' + $scope.myName + '</a>';

          console.log("AUTHORIZED:")
          console.log($scope.authorized);
        })
        
        $scope.importItems = function(items) {
          console.log("in import items");
          console.log(items);
          var info = {};
          info.imports = items.list;
          ImportFactory.importItems(info, function() {
              console.log("import success");
              $document[0].getElementById('successDiv').style.display = "block";
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
