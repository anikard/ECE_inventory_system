
var products_app = angular.module('products_app', []);


products_app.factory('ProductsFactory', function($http) {
  var factory = {};
  var products = [];
  var customers = [];
  var tags = [];
  var fields = [];

  var orders = [];
  var relevantOrders = [];
  var originalProduct = {};

  factory.getuser = function(callback) {
      $http.get('/api/user').success(function(output) {
        //customers = output;
        callback(output);
      })
    }

  factory.gettags = function(callback) {
    $http.get('/api/tag/show').success(function(output) {
      tags = output;
      callback(tags);
    })
  }

  factory.getfields = function(callback) {
    $http.get('/api/customField/show').success(function(output) {
      fields = output;
      callback(fields);
    })
  }

  factory.getproducts = function(callback) {
    $http.get('/api/item/show').success(function(output) {
      products = output;
      callback(products);
    })
  }


  factory.getorders = function(/*info,*/ callback) {
        $http.get('/api/request/show'/*, info*/).success(function(output) {
          orders = output;

          console.log(orders);

          callback(orders);
        })
    }

  factory.logout = function(callback) {
    $http.get('/api/auth/logout').success(function(output) {
      callback(output);
    })
  }

    factory.realgetorders = function(callback) {
          $http.get('/api/request/show').success(function(output) {
            orders = output;

            console.log(orders);

            callback(orders);
          })
      }

  factory.addTag = function(info, callback) {
    $http.post('/api/tag/add', info).success(function(output) {
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
    $http.post('/api/item/add', info)
      .success(function(output) {
        products = output;
        callback(products);
      })
      .error(function(error){
        console.log("ERROR FOUND: ");
        console.log(error);
        callback(error);
      })
  }

  factory.viewProduct = function(/*userID,*/ product, callback) {
    factory.getorders(/*userID,*/ function(data) {
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
    $http.post('/api/item/update', info).success(function(output) {
      // TODO
      console.log("product Successfully updated in factory");
    })
  }

  factory.deleteProduct = function(product, callback) {

    $http.post('/api/item/del', product).success(function(output) {
      console.log(output.length);
      products = output;
      callback(products);
    })
  }

  factory.addOrder = function(info, callback) {
        $http.post('/api/cart/add', info).success(function(output) {
            orders = output;
            callback(orders);
        })
      }

  return factory;
});


//products_app.controller('productsController', function($scope, /*auth,*/ ProductsFactory, $document) {

products_app.controller('productsController', function($scope, $window, $rootScope, $http, /*auth,*/ ProductsFactory, $document) {

  $scope.products = ProductsFactory.getproducts(function(data) {
      $scope.products = data;
      $scope.originalProducts = data;



      $scope.currentTags = [];
      $scope.searchTags = [];
      $scope.excludeTags = [];

      $scope.myOrders = ProductsFactory.getorders(function(data) {
        $scope.myOrders = data;
      });


      // using for LOGS
      if ($window.localStorage['itemSelected'] && !$scope.selected_item) {
        $scope.selected_item = $window.localStorage['itemSelected'];
      }
      $window.localStorage['itemSelected'] = "";

      var thisProductIndex = -1;
      for (var i = 0; i < $scope.products.length; i++) {
        if ($scope.products[i].name == $scope.selected_item) {
          thisProductIndex = i;
        }
      }
      $scope.scrollIntoView(thisProductIndex+1);

    });


    //$scope.myName = auth.currentUser();
    //$scope.myID = {userId: auth.currentUserID()};
    //console.log($scope.myName);
    //$scope.authorized = (auth.currentUserStatus()=="admin");

    $scope.customFields = [];

    $scope.logout = function() {
      $http.get('/api/auth/logout').success(function(output) {
        $scope.isLoggedIn = false;
        window.location.assign("/");
      });
    }

    $scope.isAuthorized = function() {
      return false;
    }



  $scope.tags = ProductsFactory.gettags(function(data) {
    $scope.tags = data;
  })

  $scope.fields = ProductsFactory.getfields(function(data) {
    $scope.fields = data;
  })

  $scope.user = ProductsFactory.getuser(function(data) {
    $scope.user = data;

    $scope.authorized = data.status == "admin" || data.status == "manager";
    $scope.adminOnly = data.status == "admin";
    $scope.myName = data.username || data.netId || data.name;

    console.log("AUTHORIZED:")
    console.log($scope.authorized);

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

  console.log($scope.tags);
  console.log($scope.fields);

  $scope.addProduct = function() {
    console.log("Query submited!");
    console.log("new product");
    console.log($scope.customFields);
    $scope.new_product.tags = $scope.currentTags;
    var cleanCustomFields = [];
    for (var i = 0; i < $scope.customFields.length; i++) {
      if ($scope.customFields[i].name && $scope.customFields[i].value) {
        cleanCustomFields.push($scope.customFields[i]);
      }
    }
    // Uncomment after back end integration: $scope.new_product.custom_fields = cleanCustomFields;
    console.log($scope.new_product);
    $scope.new_product.quantity_available = $scope.new_product.quantity;
    console.log(cleanCustomFields);
    $scope.currentTags = [];
    $scope.customFields = [];
    ProductsFactory.addProduct($scope.new_product, function(data) {
      if(data.error) {
        $scope.errorMessage = data.error;
        console.log($scope.products);
      }
      else {
        console.log("addProduct success");
        $scope.errorMessage = null;
        $scope.new_product.date = new Date();
        /*
        if(showProduct($scope.new_product)) {
          $scope.products.push($scope.new_product);
        }
        $scope.originalProducts.push($scope.new_product);
        $scope.new_product = {};
        */
        $scope.excludeTags = [];
        $scope.searchTags = []
        $scope.products = ProductsFactory.getproducts(function(data) {
          $scope.products = data;
          $scope.originalProducts = data;
          $scope.currentTags = [];
        });
        window.location.assign("/dispProducts");
      }
    });
  }

  var showProduct = function(prod) {
    return !findOne($scope.excludeTags, prod.tags) && containsAll($scope.searchTags, prod.tags);
  }

  $scope.addCustomField = function(){
    console.log("Add custom field");
    var newField = {};
    newField.name = "";
    newField.value = "";
    $scope.customFields.push(newField);
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
    $scope.currentTags = [];

    $('#deleteConfirmModal').modal('hide');
    $('#productModal').modal('hide');
    window.location.assign("/dispProducts");
    //$('#createItemForm').reset();
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

  $scope.calculateMyLoans = function(product) {
    console.log("Calculate My Loans");
    console.log(product);
    console.log($scope.myOrders);
    let myLoanTotal = 0;
    for (var i = 0; i < $scope.myOrders.length; i++) {
      if ($scope.myOrders[i].items) {
        for (var j = 0; j < $scope.myOrders[i].items.length; j++) {
          if ($scope.myOrders[i].items[j].item.name === product.name) {
            myLoanTotal += $scope.myOrders[i].items[j].quantity;
          }
        }
      }
    }
    return myLoanTotal;
  }

  $scope.confirmEditModal = function(product) {
    console.log("confirm edit");

    console.log(product);
    product.tags = $scope.currentTags;
    ProductsFactory.updateProduct(product, function (data) {
      console.log("confirm edit calling factory");
    })

    window.location.assign("/dispProducts");
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
    //var customerSelected = $document[ 0 ].getElementById('customerList');
    //$scope.new_order.customer_name = customerSelected.options[customerSelected.selectedIndex].text;
    console.log($scope.new_order);
    console.log("Current user stuff: ");
    var stopper = $scope.new_order.quantity;
    //console.log($scope.user);

    //console.log($scope.authorized);
    //if(!$scope.authorized) {
    //  $scope.new_order.userId = $scope.user_id;
    //}
    $scope.new_order.item = $scope.new_order.itemId;

    var stopper = $scope.new_order.quantity;
    if (stopper > 0){

      ProductsFactory.addOrder($scope.new_order, function(data) {
        $scope.new_order = {};
      })
      /*
      $scope.currentTags = [];
      $('#requestModal').modal('hide');
      $('#productModal').modal('hide');
      */
      window.location.assign("/dispProducts");
    }
  }


  $scope.viewProduct = function(product) {
    console.log("View product selected");
    console.log(product.name);
    console.log(product._id);
    console.log("Current user id: ");

    $scope.currentProduct = angular.copy(product);
    originalProduct = angular.copy(product);
    $scope.currentTags = product.tags;
    ProductsFactory.viewProduct(/*$scope.myID, */product, function(data, orders) {
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

  // TODO: Remove parent mess (due to ng-controller="productsController" in select tag probably)
  $scope.tagClicked = function(customer) {
    console.log("tagClicked");
    console.log(customer);
    console.log($scope.$parent.currentTags);
    if($scope.$parent.currentTags.indexOf(customer.name) == -1) {
      $scope.$parent.currentTags.push(customer.name);
    }
    console.log($scope.$parent.currentTags);
  }

  // TODO: refactor to combine tagClicked and searchTag to be tagClicked(tag, tagList);
  $scope.searchTag = function(tag) {
    console.log("searchTag");
    console.log(tag);
    console.log($scope.searchTags);
    if($scope.searchTags.indexOf(tag.name) == -1) {
      $scope.searchTags.push(tag.name);
    }
    console.log($scope.searchTags);
    $scope.filterTags();
  }

  // TODO: refactor with above
  $scope.excludeTag = function(tag) {
    if($scope.excludeTags.indexOf(tag.name) == -1) {
      $scope.excludeTags.push(tag.name);
    }
    $scope.filterTags();
  }

  $scope.addTag = function() {
    console.log("add tag");
    console.log($scope.newTag);
    $scope.currentTags.push($scope.newTag.name);

    ProductsFactory.addTag($scope.newTag, function(data) {
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

  // TODO: refactor to combine removeTag and removeSearchTag to be removeTag(tag, tagList);
  $scope.removeSearchTag = function(tag) {
    for (var i =0; i < $scope.searchTags.length; i++)
    {
      if ($scope.searchTags[i] === tag) {
          $scope.searchTags.splice(i,1);
          break;
        }
    }
    console.log("remove search tag called");
    console.log(tag);
    console.log($scope.searchTags);
    $scope.filterTags();
  }

  $scope.removeExcludeTag = function(tag) {
    for (var i =0; i < $scope.excludeTags.length; i++)
    {
      if ($scope.excludeTags[i] === tag) {
          $scope.excludeTags.splice(i,1);
          break;
        }
    }
    console.log("remove exclude tag called");
    console.log(tag);
    console.log($scope.excludeTags);
    $scope.filterTags();
  }

  // TODO: Refactor
  $scope.filterTags = function() {
    var showIncludeProducts = getIncludeProducts();
    var showExcludeProducts = getExcludeProducts();
    $scope.products = intersect(showIncludeProducts, showExcludeProducts);
  }

  var intersect = function(a, b) {
    var setA = new Set(a);
    var setB = new Set(b);
    var intersection = new Set([...setA].filter(x => setB.has(x)));
    return Array.from(intersection);
  }

  var getIncludeProducts = function() {
    var incProducts = []
    if($scope.searchTags.length > 0) {
      for (var i = 0; i < $scope.originalProducts.length; i++) {
        if (containsAll($scope.searchTags, $scope.originalProducts[i].tags)) {
          incProducts.push($scope.originalProducts[i]);
        }
      }
      return incProducts
    }
    else {
      return $scope.originalProducts;
    }
  }

  var getExcludeProducts = function() {
    var exProducts = []
    if($scope.excludeTags.length > 0) {
      for (var i = 0; i < $scope.originalProducts.length; i++) {
        if (!findOne($scope.excludeTags, $scope.originalProducts[i].tags)) {
          exProducts.push($scope.originalProducts[i]);
        }
      }
      return exProducts
    }
    else {
      return $scope.originalProducts;
    }
  }

  // True if small is a subset of large
  var containsAll = function(small, large) {
    for(var i = 0; i < small.length; i++) {
      if (large.indexOf(small[i]) == -1) {
        return false;
      }
    }
    return true;
  }

  // True if at least one is in common between haystack and arr
  var findOne = function (haystack, arr) {
    return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
    });
  }

  $scope.closeItemModal = function() {
    $scope.currentTags = [];
  }


  // from logs view

  $scope.scrollIntoView = function(rowNum) {
      console.log("in scroll into view");
        var element = document.getElementById('myItemTable').getElementsByTagName('tr')[rowNum];

        if (element) {
          var container = "window";
          var containerTop = $(container).scrollTop();
          var containerBottom = containerTop + $(container).height();
          var elemTop = element.offsetTop;
          var elemBottom = elemTop + $(element).height();

          var elemAbsTop = element.getBoundingClientRect().top;

          $("#myItemTable tr:nth-child("+rowNum+")")[0].scrollIntoView();

          window.scrollBy(0,-100);

          var cols = element.getElementsByTagName('td');

          for (var x = 0; x < cols.length; x++) {
            cols[x].style.backgroundColor = "lightgreen";
          }

        }

      }

})

products_app.controller('customersController', function($scope, ProductsFactory) {
    $scope.customers = ProductsFactory.getuser(function(data) {

      $scope.customers = data;
      console.log("inside prod cust");
      console.log($scope.customers)
  })
  console.log("customers");
  console.log($scope.customers);
})

products_app.controller('ordersController', function($scope, /*auth,*/ ProductsFactory) {
    //var thisId = {userId: auth.currentUserID()};
    console.log("thisId: " + thisId);
    $scope.orders = ProductsFactory.getorders(function(/*thisId,*/ data) {
      $scope.orders = data;
      console.log("inside prod order");
      console.log($scope.orders);
  })
  console.log("orders");
  console.log($scope.orders);
})

// TODO: refactoring Is this used?
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

// TODO: refactoring Is this used?
products_app.controller('fieldsController', function($scope, ProductsFactory) {
  $scope.fields = ProductsFactory.getfields(function(data) {
    console.log("Fields in Products");
    console.log(data);
    $scope.fields = data;
  })
})
