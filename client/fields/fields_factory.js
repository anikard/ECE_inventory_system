var fields_app = angular.module('fields_app', []);

fields_app.factory('FieldsFactory', function($http) {
  var factory = {};
  var fields = [];
  var originalField = {};

  factory.getfields = function(callback) {
    $http.get('/api/customField/show').success(function(output) {
      fields = output;
      callback(fields);
    })
  }

  factory.getuser = function(callback) {
      $http.get('/api/user').success(function(output) {
        callback(output);
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

fields_app.controller('fieldsController', function($scope, $http, FieldsFactory) {
  $scope.user = FieldsFactory.getuser(function(data) {
    $scope.user = data;
    $scope.authorized = data.status == "admin" || data.status == "manager";
    $scope.adminOnly = data.status == "admin";
    $scope.myName = data.username || data.netId || data.name;

    // setting nav bar
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

  $scope.fields = FieldsFactory.getfields(function(data) {
    $scope.fields = data;
  })

  $scope.refreshFields = function () {
    $scope.fields = FieldsFactory.getfields(function(data) {
      $scope.fields = data;
    })
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
        $scope.new_field = {};
        $scope.refreshFields();
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
      /*
      for (var i = 0; i < $scope.fields.length; i++) {
        if ($scope.fields[i]._id === field._id) {
          $scope.fields.splice(i,1);
          break;
        }
      }
      */
      $scope.refreshFields();
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

  $scope.editField = function(field) {
    if($scope.editing) {
      $('#editConfirmModal').modal('show');
      $scope.editing = false;
    }
    else {
      originalField = angular.copy(field);
      $scope.editing = true;
    }
  }

  $scope.confirmEditModal = function(field) {
    console.log(field);
    FieldsFactory.updateField(field, function (data){});
    $('#editConfirmModal').modal('hide');
    $('#fieldModal').modal('hide');
    $scope.refreshFields();
    /*
    $scope.fields = FieldsFactory.getfields(function(data) {
      $scope.fields = data;
      console.log(data);
    });
    */
  }

  $scope.cancelEditModal = function(field) {
    $scope.currentField = angular.copy(originalField);
    $('editConfirmModal').modal('hide');
  }

})
