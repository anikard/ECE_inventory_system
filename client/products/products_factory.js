
var products_app = angular.module('products_app', []);


products_app.factory('ProductsFactory', function($http) {
  var factory = {};
  var products = [];
  var customers = [];
  var tags = [];

  var orders = [];
  var relevantOrders = [];
  var originalProduct = {};

  factory.getcustomers = function(callback) {
      $http.get('/customers').success(function(output) {
        customers = output;
        callback(customers);
      })
    }

  factory.gettags = function(callback) {
    $http.get('/tags').success(function(output) {
      tags = output;
      callback(tags);
    })
  }

  factory.getproducts = function(callback) {
    $http.get('/products').success(function(output) {
      products = output;
      callback(products);
    })
  }


  factory.getorders = function(info, callback) {
        $http.post('/orders', info).success(function(output) {
          orders = output;

          console.log(orders);

          callback(orders);
        })
    }

    factory.realgetorders = function(callback) {
          $http.get('/orders').success(function(output) {
            orders = output;

            console.log(orders);

            callback(orders);
          })
      }

  factory.addTag = function(info, callback) {
    $http.post('/addTag', info).success(function(output) {
      tags = output;
      callback(tags);
    })
  }

  factory.addProduct = function(info, callback) {
    console.log("aP info");
    console.log(info);
    if (!info.name || !info.quantity) {
      console.log("Add item form incomplete");
      return;
    }
    $http.post('/addProduct', info)
      .success(function(output) {
        products = output;
        callback(products);
      })
      .error(function(error){
        console.log("ERROR FOUND: ");
        console.log(error);
      })
  }

  factory.viewProduct = function(userID, product, callback) {
    factory.getorders(userID, function(data) {
      console.log("Factory view called on : " + product.name);
      relevantOrders = [];
      for (var i = 0; i < orders.length; i++) {
        if (data[i].item_name === product.name) {
          relevantOrders.push(orders[i]);
        }
      }
      console.log(relevantOrders);
      callback(product, relevantOrders);
    })
  }

  factory.updateProduct = function(info, callback) {
    if (!info.name || !info.quantity) {
      console.log("Update item form incomplete");
      return;
    }
    $http.post('/updateProduct', info).success(function(output) {
      // TODO
      console.log("product Successfully updated in factory");
    })
  }

  factory.deleteProduct = function(product, callback) {

    $http.post('/deleteProduct', product).success(function(output) {
      console.log(output.length);
      products = output;
      callback(products);
    })
  }

  factory.addOrder = function(info, callback) {
        $http.post('/addOrder', info).success(function(output) {
            orders = output;
            callback(orders);
        })
      }

  return factory;
});


products_app.controller('productsController', function($scope, auth, ProductsFactory, $document) {
    $scope.myName = auth.currentUser();
    $scope.myID = {userId: auth.currentUserID()};
    console.log($scope.myName);
    $scope.authorized = (auth.currentUserStatus()=="admin");

    $scope.logout = function() {
      console.log("scope logging out ");
      auth.logout(function() {
        $scope.isLoggedIn = false;
        window.location.assign("/");
      });
    }

    $scope.isAuthorized = function() {
      return false;
    }

    $scope.products = ProductsFactory.getproducts(function(data) {
    $scope.products = data;


    $scope.currentTags = [];
  });

  $scope.tags = ProductsFactory.gettags(function(data) {
    $scope.tags = data;
  })

  $scope.addProduct = function() {
    console.log("Query submited!");
    console.log("new product");
    $scope.new_product.tags = $scope.currentTags;
    console.log($scope.new_product);
    $scope.currentTags = [];
    ProductsFactory.addProduct($scope.new_product, function(data) {
      $scope.new_product.date = new Date();
      $scope.products.push($scope.new_product);
      $scope.new_product = {};
    });
  }

  $scope.deleteProduct = function(event, product) {
        //TODO: Confirm Deletion popup
        /*
        var confirm = $mdDialog.confirm()
          .title('Confirm Deltion')
          .textContent('Delete this item.')
          .targetEvent(event)
          .ok('Confirm')
          .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
          console.log("confirm deletion chosen");
          $('#productModal').modal('hide');
        }, function() {
          console.log("cancel deletion chosen");
          $('#productModal').modal('hide');
        });
        */

        //TODO: Remove the product form the view
/*
        ProductsFactory.deleteProduct(product, function(data) {
          for (var i =0; i < $scope.products.length; i++)
          {  if ($scope.products[i]._id === product._id) {
                $scope.products.splice(i,1);
                break;
              }
          }
      });
*/
    }

  $scope.confirmDeleteModal = function(product) {
    console.log("confirm delete");
    console.log(product.name);
    ProductsFactory.deleteProduct(product, function(data) {
      for (var i =0; i < $scope.products.length; i++)
      {  if ($scope.products[i]._id === product._id) {
            $scope.products.splice(i,1);
            console.log("remainig products:");
            console.log($scope.products);
            break;
          }
          console.log("Break doesn't occur");
      }
  });
    $('#deleteConfirmModal').modal('hide');
    $('#productModal').modal('hide');
  }

  $scope.cancelDeleteModal = function() {
    console.log("cancel Delete");
    $('#deleteConfirmModal').modal('hide');
  }

  $scope.editProduct = function(product) {
    console.log("edit product called");

    if ($scope.editing) {
      //TODO: throw confirmation dialog
      $('#editConfirmModal').modal('show');
      //TODO: persist edit to db
      $scope.editing = false;
    }
    else {

      console.log("Going into edit mode, save product to oldProduct");
      originalProduct = angular.copy(product);
      console.log(originalProduct);
      $scope.editing = true;
    }
  }

  $scope.confirmEditModal = function(product) {
    console.log("confirm edit");

    console.log(product);
    product.tags = $scope.currentTags;
    ProductsFactory.updateProduct(product, function (data) {
      console.log("confirm edit calling factory");
    })

    $('#editConfirmModal').modal('hide');
    $('#productModal').modal('hide');

    $scope.products = ProductsFactory.getproducts(function(data) {
      $scope.products = data;
      $scope.currentTags = [];
    });
  }

  $scope.cancelEditModal = function(product) {
    console.log("Cancel Edit");
    console.log(originalProduct);
    console.log($scope.currentProduct);
    $scope.currentProduct = angular.copy(originalProduct);
    console.log($scope.currentProduct);
    $('#editConfirmModal').modal('hide');
  }

  $scope.requestProduct = function(product) {
    console.log("request called");
  }


  $scope.addOrder = function() {
    var customerSelected = $document[ 0 ].getElementById('customerList');
    $scope.new_order.customer_name = customerSelected.options[customerSelected.selectedIndex].text;
    console.log($scope.new_order);
    console.log("Current user stuff: ");
    console.log($scope.authorized);
    if(!$scope.authorized) {
      $scope.new_order.userId = $scope.myID.userId;
    }
    ProductsFactory.addOrder($scope.new_order, function(data) {
      $scope.new_order = {};
    })
    $('#requestModal').modal('hide');
  }


  $scope.viewProduct = function(product) {
    console.log("View product selected");
    console.log(product.name);
    console.log("Current user id: ");
    console.log($scope.myID);

    $scope.currentProduct = angular.copy(product);
    originalProduct = angular.copy(product);
    $scope.currentTags = product.tags;
    ProductsFactory.viewProduct($scope.myID, product, function(data, orders) {
      $scope.orders = orders;
      $scope.thisProduct = data;
      $scope.new_order = {};
      $scope.new_order.itemId = data._id;
      $scope.editing = false;
      console.log(data);
    })
  }

  $scope.hideRequestModal = function() {
    console.log("Hide Request Modal");
    $('#requestModal').modal('hide');
  }

  $scope.tagClicked = function(customer) {
    console.log("tagClicked");
    console.log(customer);
    console.log($scope.$parent.currentTags);
    if($scope.$parent.currentTags.indexOf(customer.name) == -1) {
      $scope.$parent.currentTags.push(customer.name);
    }
    console.log($scope.$parent.currentTags);
  }

  $scope.addTag = function() {
    console.log("add tag");
    console.log($scope.newTag);
    $scope.currentTags.push($scope.newTag.name);
    //$scope.tags.push($scope.newTag);
    //$scope.newTag = {};

    ProductsFactory.addTag($scope.newTag, function(data) {
      //$scope.tags.push($scope.newTag.name);
      $scope.newTag = {};
    });

  }

  $scope.createNewTag = function() {
    console.log("newTag");
    //Throw modal
    $('#newTagModal').modal('show');
  }

  $scope.confirmNewTag = function(tag) {
    console.log("confirm new tag");
    $scope.addTag();
    $('#newTagModal').modal('hide');
  }

  $scope.cancelNewTag = function() {
    $scope.newTag = {};
    $('#newTagModal').modal('hide');
  }

  $scope.removeTag = function(tag) {
    for (var i =0; i < $scope.currentTags.length; i++)
    {
      if ($scope.currentTags[i] === tag) {
          $scope.currentTags.splice(i,1);
          break;
        }
    }
    console.log("remove tag called");
    console.log(tag);
  }

  $scope.closeItemModal = function() {
    $scope.currentTags = [];
  }

})

products_app.controller('customersController', function($scope, ProductsFactory) {
    $scope.customers = ProductsFactory.getcustomers(function(data) {

      $scope.customers = data;
      console.log("inside prod cust");
      console.log($scope.customers)
  })
  console.log("customers");
  console.log($scope.customers);
})

products_app.controller('ordersController', function($scope, auth, ProductsFactory) {
    var thisId = {userId: auth.currentUserID()};
    console.log("thisId: " + thisId);
    $scope.orders = ProductsFactory.getorders(function(thisId, data) {
      $scope.orders = data;
      console.log("inside prod order");
      console.log($scope.orders);
  })
  console.log("orders");
  console.log($scope.orders);
})

products_app.controller('tagsController', function($scope, ProductsFactory) {
  console.log("tagCTRL outer");
  $scope.tags = ProductsFactory.gettags(function(data) {
    console.log("tagCTRL inner");
    console.log(data);
    $scope.tags = data;
  })

  console.log("tags")
  console.log($scope.tags);
})

products_app.factory('auth', ['$http', '$window', function($http, $window){
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

    auth.logout = function(callback){
      $window.localStorage.removeItem('inventoryToken');
      callback();
    };

  return auth;
}])

/*
products_app.controller('authController', function($scope, auth) {
    $scope.myName = auth.currentUser();
    console.log($scope.myName);

    $scope.logout = function() {
      console.log("scope logging out ");
      auth.logout(function() {
        $scope.isLoggedIn = false;
        window.location.assign("/");
      });
    }

    $scope.isAuthorized = function() {
      return true;
    }
})
*/
