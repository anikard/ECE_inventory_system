var products_app = angular.module('products_app', []);

products_app.factory('ProductsFactory', function($http) {
  var factory = {};
  var products = [];

  factory.getproducts = function(callback) {
    $http.get('/products').success(function(output) {
      products = output;
      callback(products);
    })
  }

  factory.addProduct = function(info, callback) {
    $http.post('/addProduct', info).success(function(output) {
        products = output;
        callback(products);
    })
  }

  factory.viewProduct = function(product, callback) {
    callback(product);
  }

  return factory;
});


products_app.controller('productsController', function($scope, ProductsFactory, $document) {
    $scope.products = ProductsFactory.getproducts(function(data) {
    $scope.products = data;
  });

  $scope.addProduct = function() {
    console.log("Query submited!");
    ProductsFactory.addProduct($scope.new_product, function(data) {
      $scope.new_product.date = new Date();
      $scope.products.push($scope.new_product);
      $scope.new_product = {};
    });
  }

  $scope.viewProduct = function(product) {
    console.log("View product selected");
    console.log(product.name);
    ProductsFactory.viewProduct(product, function(data) {
      $scope.thisProduct = data;
      console.log(data);
    })
  }

  $scope.removeProduct = function(product) {
    ProductsFactory.removeProduct(product, function(data) {
      for (var i =0; i < $scope.products.length; i++)
        {  if ($scope.products[i]._id === product._id) {
              $scope.products.splice(i,1);
              break;
            }
        }
    });
  }

  $('#productModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var modal = $(this);
  })

})
