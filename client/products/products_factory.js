
var products_app = angular.module('products_app', []);


products_app.factory('ProductsFactory', function($http) {
  var factory = {};
  var products = [];
  var customers = [];

  var orders = [];
  var originalProduct = {};

  factory.getcustomers = function(callback) {
      $http.get('/customers').success(function(output) {
        customers = output;
        callback(customers);
      })
    }

  factory.getproducts = function(callback) {
    $http.get('/products').success(function(output) {
      products = output;
      callback(products);
    })
  }


  factory.getorders = function(callback) {
        $http.get('/orders').success(function(output) {
          orders = output;

          orders.forEach(function(elem) {
            elem["customer_name"] = elem["userId"].name;
          })
          console.log(orders);

          callback(orders);
        })
    }

  factory.addProduct = function(info, callback) {
    $http.post('/addProduct', info).success(function(output) {
        products = output;
        callback(products);
    })
  }

  factory.viewProduct = function(product, callback) {
    console.log("Factory view called on : " + product.name);
    callback(product);
  }

  factory.updateProduct = function(info, callback) {
    $http.post('/updateProduct', info).success(function(output) {
      // TODO
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


products_app.controller('productsController', function($scope, ProductsFactory, $document) {
    $scope.products = ProductsFactory.getproducts(function(data) {
    $scope.products = data;

    $scope.currentTags = [];
  });

  $scope.addProduct = function() {
    console.log("Query submited!");
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
    /*
    ProductsFactory.editProduct(product, function (data) {

    })
    */
    $('#editConfirmModal').modal('hide');
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
    ProductsFactory.addOrder($scope.new_order, function(data) {
      $scope.new_order = {};
    })
    $('#requestModal').modal('hide');
  }


  $scope.viewProduct = function(product) {
    console.log("View product selected");
    console.log(product.name);

    $scope.currentProduct = angular.copy(product);
    originalProduct = angular.copy(product);
    ProductsFactory.viewProduct(product, function(data) {
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
    console.log($scope.currentTags);
    $scope.currentTags.push(customer.name);
  }

  $scope.newTag = function() {
    console.log("newTag");
  }

})

products_app.controller('customersController', function($scope, ProductsFactory) {
    $scope.customers = ProductsFactory.getcustomers(function(data) {

      $scope.customers = data;
      console.log("inside prod cust");
      console.log($scope.customers)
  })
})

products_app.controller('ordersController', function($scope, ProductsFactory) {
    $scope.orders = ProductsFactory.getorders(function(data) {
      $scope.orders = data;
      console.log("inside prod order");
      console.log($scope.orders);
  })
})