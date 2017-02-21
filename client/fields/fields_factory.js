var fields_app = angular.module('fields_app', []);

fields_app.factory('FieldsFactory', function($http) {
  var factory = {};
  var fields = [];

  factory.getfields = function(callback) {
    $http.get('/api/customField/show').success(function(output) {
      fields = output;
      callback(fields);
    })
  }

  factory.addField = function(info, callback) {
    console.log("inside factory addField");
    console.log(info);
    $http.post('/api/customField/add', info)
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
    $http.post('/api/customField/update', info).success(function(output) {
      console.log("field updated success!");
    });
  }

  factory.deleteField = function(field, callback) {
    $http.post('/api/customField/del', field).success(function(output) {
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

  $scope.viewField = function(field) {
    $scope.currentField = angular.copy(field);
    $scope.editing = false;
  }

  $scope.confirmDeleteModal = function(field) {
    console.log(field);
    FieldsFactory.deleteField(field, function(data) {
      for (var i = 0; i < $scope.fields.length; i++) {
        if ($scope.fields[i]._id === field._id) {
          $scope.fields.splice(i,1);
          break;
        }
      }
      console.log("deleting field, refresh now");
      $scope.currentField = {};
      // TODO: remove from
    });
    $('#deleteConfirmModal').modal('hide');
    $('#fieldModal').modal('hide');
  }

  $scope.cancelDeleteModal = function() {
    console.log("cancel Delete");
    $('#deleteConfirmModal').modal('hide');
  }


})
