var fields_app = angular.module('fields_app', []);

fields_app.factory('FieldsFactory', function($http) {
  var factory = {};
  var fields = [];

  factory.getfields = function(callback) {
    $http.get('/api/v1/customField/show').success(function(output) {
      fields = output;
      callback(fields);
    })
  }

  factory.addField = function(info, callback) {
    console.log("inside factory addField");
    console.log(info);
    $http.post('/api/v2/customField/add', info)
      .success(function(output) {
        fields = output;
        callback(fields);
      })
      .error(function(error) {
        callback(error);
      })
  }

  factory.viewField = function(field, callback) {
    console.log("Factory fiew called on : " + field.name);
  }

  factory.updateField = function(info, callback) {
    $http.post('/api/v2/customField/update', info).success(function(output) {
      console.log("field updated success!");
    });
  }

  factory.deleteField = function(field, callback) {
    $http.post('/api/v2/customField/del', field).success(function(output) {
      fields = output;
      callback(output);
    });
  }
  return factory;
});

fields_app.controller('fieldsController', function($scope, FieldsFactory) {

  $scope.fields = FieldsFactory.getfields(function(data) {
    $scope.fields = data;
  })

  $scope.logout = function() {
    console.log("scope logging out ");
    auth.logout(function() {
      $scope.isLoggedIn = false;
      window.location.assign("/");
    });
  }

  $scope.addField = function() {
    console.log($scope.new_field);
    if(!$scope.new_field.access) {
      $scope.new_field.access = "public";
    }
    FieldsFactory.addField($scope.new_field, function(data) {
      if(data.error) {
        $scope.errorMessage = data.error;
      }
      else {
        $scope.errorMessage = null;
        $scope.new_field.date = new Date();
        $scope.fields.push($scope.new_field)
        $scope.new_field = {};
      }
    });
  }

  $scope.deleteField = function(field) {
    FieldsFactory.deleteField(field, function(data) {
      console.log("deleting field, refresh now");
      // TODO: remove from 
    })
  }


})
