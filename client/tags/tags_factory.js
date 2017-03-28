var tags_app = angular.module('tags_app', []);

tags_app.factory('TagsFactory', function($http) {
  var factory = {};
  var tags = [];

  factory.getTags = function(callback) {
    $http.get('/api/tag/show').success(function(output) {
      tags = output;
      callback(tags);
    })
  }

  factory.addTag = function(info, callback) {
    $http.post('/api/tag/add', info)
      .success(function (output) {
        tags = output;
        callback(tags)
      })
      .error(function(error) {
        callback(error);
      })
  }

  factory.deleteTag = function(tag, callback) {
    $http.post('/api/tag/del', tag).success(function(output) {
      tags = output;
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

tags_app.controller('tagsController', function($scope, $http, TagsFactory) {

  $scope.user = TagsFactory.getuser(function(data) {
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
  });

  $scope.tags = TagsFactory.getTags(function(data) {
    $scope.tags = data;
  });

  $scope.logout = function() {
    $http.get('/api/auth/logout').success(function(output) {
      $scope.isLoggedIn = false;
      window.location.assign("/");
    });
  }

  $scope.refreshTags = function () {
    $scope.tags = TagsFactory.getTags(function(data) {
      $scope.tags = data;
    });
  }

  $scope.addTag = function(tag) {
    TagsFactory.addTag(tag, function(data) {
      if(data.error) {
        $scope.errorMessage = data.error;
      }
      else {
        $scope.errorMessage = null;
        $scope.refreshTags();
        $scope.new_tag = null;
      }
    });
  }

  $scope.deleteTag = function(tag) {
    $scope.tagToDelete = tag;
    $('#deleteConfirmModal').modal('show');
  }

  $scope.confirmDeleteModal = function(tag) {
    TagsFactory.deleteTag(tag, function(data) {
      $scope.refreshTags();
    });
    $('#deleteConfirmModal').modal('hide');
  }

  $scope.cancelDeleteModal = function() {
    $('#deleteConfirmModal').modal();
  }

});
