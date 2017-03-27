var orders_app = angular.module('orders_app', []);

    orders_app.factory('OrderFactory', function($http) {
      var factory = {};
      var orders = [];
      var customers = [];
      var products = [];

      factory.getproducts = function(callback) {
        $http.get('/products').success(function(output) {
          products = output;
          callback(products);
        })
      }

      factory.getcustomers = function(callback) {
        $http.get('/customers').success(function(output) {
          customers = output;
          callback(customers);
        })
      }

      factory.getuser = function(callback) {
        $http.get('/api/user').success(function(output) {
          callback(output);
        })
      }

      factory.getorders = function(callback) {
        $http.get('/api/request/show').success(function(output) {
          orders = output;
          callback(orders);
        })
      }

      factory.viewOrder = function(order, callback) {
        callback(order);

      }

      factory.updateOrder = function(info, callback) {
        $http.post('/api/request/update', info)
          .success(function(output) {
              callback(output);
          })
          .error(function(error) {
            callback(error);
          })
      }

      factory.removeOrder = function(order, callback) {
        $http.post('/api/request/del', order).success(function(output) {
            console.log(output.length);
            orders = output;
            callback(orders);
        })
      }

      factory.addOrder = function(info, callback) {
        $http.post('/api/request/add', info).success(function(output) {
            console.log("add order success");
            console.log(output);
        })
      }

      return factory;
    });


  orders_app.controller('productsController', function($scope, $http, OrderFactory) {
        $scope.products = OrderFactory.getproducts(function(data) {
        $scope.products = data;
      })
    })

    orders_app.controller('customersController', function($scope, OrderFactory) {
        $scope.customers = OrderFactory.getcustomers(function(data) {
        $scope.customers = data;

        //TODO: delete this line and the two below
        console.log("inside ord cust");
        console.log($scope.customers);
      })
    })

    orders_app.controller('ordersController', function($scope, $http, $window, OrderFactory,  $document) {
        //console.log("USER ID: " + auth.currentUserID());
        //var thisId = {userId: auth.currentUserID()};
        $scope.orders = OrderFactory.getorders(/*thisId,*/ function(data) {
          $scope.orders = data;

          console.log("ORDERS");
          console.log($scope.orders);


          // using for LOGS
          if ($window.localStorage['requestSelected'] && !$scope.selected_request) {
            $scope.selected_request = $window.localStorage['requestSelected'];
          }
          $window.localStorage['requestSelected'] = "";

          var thisReqIndex = -1;
          var thisReq = {};
          for (var i = 0; i < $scope.orders.length; i++) {
            if ($scope.orders[i]._id == $scope.selected_request) {
              thisReqIndex = i;
              thisReq = $scope.orders[i];
            }
          }

          $scope.requestIndex = thisReqIndex+1;

          $scope.scrollIntoView(thisReqIndex+1, thisReq);

        });

        // TABS for loans vs disbursements
        // --> changed design decision: single table view for requests 3/20
        $('.tabs .tab-links a').on('click', function(e)  {
            var currentAttrValue = jQuery(this).attr('href');

            // Show/Hide Tabs
            jQuery('.tabs ' + currentAttrValue).show().siblings().hide();

            // Change/remove current tab to active
            jQuery(this).parent('li').addClass('active').siblings().removeClass('active');

            e.preventDefault();
        });

        $scope.user = OrderFactory.getuser(function(data) {
          $scope.user = data;

          $scope.authorized = data.status == "admin" || data.status =="manager";
          $scope.myName = data.username || data.netId || data.name;

          console.log("AUTHORIZED:")
          console.log($scope.authorized);

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

          $scope.tableRows = document.getElementById('myRequestsTable').getElementsByTagName('tr');
          // $scope.scrollIntoView($scope.requestIndex);
        })

        // AUTH
        $scope.logout = function() {
          $http.get('/api/auth/logout').success(function(output) {
            $scope.isLoggedIn = false;
            window.location.assign("/");
          });
        }

        $scope.removeOrder = function(order) {
          $('#orderModal').modal('hide');
          OrderFactory.removeOrder(order, function(data) {
            /*
            for (var i =0; i < $scope.orders.length; i++)
            {  if ($scope.orders[i]._id === order._id) {
                  $scope.orders.splice(i,1);
                  break;
                }
            }
            */
            $scope.refreshOrders();
        });

      }

      $scope.refreshOrders = function () {
          $scope.orders = OrderFactory.getorders(/*thisId,*/ function(data) {
            $scope.orders = data;
          });
      }

      $scope.viewOrder = function(order) {
          OrderFactory.viewOrder(order, function(data) {

            $scope.thisOrder = data;
            $scope.thisOrder.customer_name = data.user.username;
            console.log("THIS ORDER");
            console.log($scope.thisOrder);
            for (var i = 0; i < $scope.thisOrder.items.length; i++) {
              var item = $scope.thisOrder.items[i];
              item.quantity_to_loan = 0;
              item.quantity_to_deny = 0;
              item.quantity_to_disburse = 0;
              item.quantity_to_return = 0;
            }
            if($scope.thisOrder.status == "outstanding" || $scope.thisOrder.status == "onLoan") {
              ($document[0].getElementById('cancelOrderButton')).style.display = "inline";
              ($document[0].getElementById('request_response_form')).style.display = "block";
              ($document[0].getElementById('respondOrderButton')).style.display = "inline";
            }
            else {
              ($document[0].getElementById('cancelOrderButton')).style.display = "none";
              ($document[0].getElementById('request_response_form')).style.display = "none";
            }
            console.log(data);
        });

      }

      $scope.respondToOrder = function() {
        console.log("RESPONDING TO ORDER");
        $scope.responseToOrder = {};

        if ($scope.thisOrder.status == "outstanding") {
          $scope.openResponse();
        }
        else if ($scope.thisOrder.status == "onLoan") {
          $scope.onLoanResponse();
        }
        if (!$scope.errorMessage){

          $scope.responseToOrder.note = $document[0].getElementById('message-text').value;;
          $scope.responseToOrder._id = $scope.thisOrder._id;

          console.log($scope.responseToOrder);
          OrderFactory.updateOrder($scope.responseToOrder, function(data) {
            console.log("in update");
            console.log(data);
            if(data.error) {
              console.log("error")
              $scope.errorMessage = data.error;
            }
            else {
              $scope.orderResponse = {};
              $scope.responseToOrder = {};
              $('#orderModal').modal('hide');
              $scope.refreshOrders();
              alert("Successfully " + data.status + ".");
            }
          });

          //$scope.refreshOrders();
        }
      }

      $scope.openResponse = function() {
        console.log($scope.thisOrder);
        $scope.errorMessage = null;
        for (var i = 0; i < $scope.thisOrder.items.length; i++) {
          var item = $scope.thisOrder.items[i];
          console.log($scope.thisOrder.items);
          console.log(item);
          // var currentRequested = item.quantity;
          // item.quantity is the total requested;
          var totalActedOn = item.quantity_to_disburse + item.quantity_to_loan +
            item.quantity_to_deny;
          if (totalActedOn != item.quantity) {
            $scope.errorMessage = "Quantity Mismatch!";
            console.log("Quantity Mismatch")
            console.log(totalActedOn);
            console.log(item.quantity);
          }
          else if (item.quantity_to_deny == item.quantity) {
            $scope.responseToOrder.status = "denied";
            // TODO: LOG this
          }
          else if (item.quantity_to_disburse == item.quantity) {
            $scope.responseToOrder.status = "disbursed";
            $scope.responseToOrder.type = "disburse";
            // TODO: LOG this
          }
          else if (item.quantity_to_loan == item.quantity) {
            $scope.responseToOrder.status = "onLoan";
            $scope.responseToOrder.type = "loan";
            // TODO: LOG this
          }
          else {
            $scope.convertResponse();
            console.log("Converted Condition");
          }
        }
      }

    $scope.onLoanResponse = function() {
      console.log($scope.thisOrder);
      var quantityMismatch = null;
      for (var i = 0; i < $scope.thisOrder.items.length; i++) {
        var item = $scope.thisOrder.items[i];
        console.log($scope.thisOrder.items);
        console.log(item);
        var totalActedOn = item.quantity_to_disburse + item.quantity_to_return;
        if (totalActedOn != item.quantity) {
          $scope.quantityMismatch = "Quantity Mismatch";
        }
        else if (item.quantity_to_return == item.quantity) {
          $scope.responseToOrder.status = "returned";
          //TODO: update available pool
        }
        else if (item.quantity_to_disburse == item.quantity) {
          $scope.responseToOrder.status = "disbursed";
          $scope.responseToOrder.previous_status = "onLoan";
        }
        else {
          console.log("Converted Condition");
          $scope.convertedLoan()
        }
      }
    }

    $scope.convertResponse = function() {
      console.log("Convert Response");
      console.log($scope.thisOrder);
      var disburseItems = [];
      var loanItems = [];
      var denyItems = [];
      var returnItems = [];
      var convertedOrders = [];
      //TODO: populate various items;
      for (var i = 0; i < $scope.thisOrder.items.length; i++) {
        var item = $scope.thisOrder.items[i];
        if(item.quantity_to_disburse > 0) {
          console.log("in disb");
          var currentItem = {};
          currentItem.item = item.item;
          currentItem.quantity = item.quantity_to_disburse
          disburseItems.push(currentItem);
        }
        if(item.quantity_to_loan > 0) {
          console.log("in loan");
          var currentItem = {};
          currentItem.item = item.item;
          currentItem.quantity = item.quantity_to_loan
          loanItems.push(currentItem);
        }
        if(item.quantity_to_deny > 0) {
          console.log("in deny");
          var currentItem = {};
          currentItem.item = item.item;
          currentItem.quantity = item.quantity_to_deny
          denyItems.push(currentItem);
        }
        if(item.quantity_to_return > 0) {
          console.log("in return");
          var currentItem = {}
          currentItem.item = item.item;
          currentItem.quantity = item.quantity_to_return
          returnItems.push(currentItem);
        }
      }
      // TODO: addOrder for each item type
      if(loanItems.length > 0) {
        $scope.addLoanOrder(loanItems);
      }
      if(disburseItems.length > 0) {
        $scope.addDisburserOrder(disburseItems, "outstanding");
      }
      if(denyItems.length > 0) {
        $scope.addDenyOrder(denyItems);
      }
      if(returnItems.length > 0) {
        $scope.addReturnOrder(returnItems);
      }

      // TODO: deprecate this order by transitioning it to converted state
      $scope.responseToOrder.status = "converted";

    }

    $scope.convertedLoan = function() {
      console.log("Converted Loan Response");
      console.log($scope.thisOrder);
      var disburseItems = [];
      var returnItems = [];
      var convertedOrders = [];
      //TODO: populate various items;
      for (var i = 0; i < $scope.thisOrder.items.length; i++) {
        var item = $scope.thisOrder.items[i];
        if(item.quantity_to_disburse > 0) {
          console.log("in disb");
          var currentItem = {};
          currentItem.item = item.item;
          currentItem.quantity = item.quantity_to_disburse
          disburseItems.push(currentItem);
        }
        if(item.quantity_to_return > 0) {
          console.log("in return");
          var currentItem = {}
          currentItem.item = item.item;
          currentItem.quantity = item.quantity_to_return
          returnItems.push(currentItem);
        }
      }
      // TODO: addOrder for each item type

      if(disburseItems.length > 0) {
        $scope.addDisburserOrder(disburseItems, "onLoan");
      }
      if(returnItems.length > 0) {
        $scope.addReturnOrder(returnItems, "onLoan");
      }

      // TODO: deprecate this order by transitioning it to converted state
      $scope.responseToOrder.status = "converted";

    }

    $scope.addLoanOrder = function(loanItems) {
      var loanOrder = {};
      loanOrder.items = loanItems;
      loanOrder.convert = "true";
      loanOrder.user = $scope.thisOrder.user;
      loanOrder.reason = $scope.thisOrder.reason;
      loanOrder.note = $scope.thisOrder.note;
      loanOrder.status = "onLoan";
      loanOrder.type = "loan"
      $scope.addOrder(loanOrder);
    }

    $scope.addDisburserOrder = function(disburseItems, previousStatus) {
      var disburseOrder = {};
      disburseOrder.items = disburseItems;
      disburseOrder.convert = "true";
      disburseOrder.user = $scope.thisOrder.user;
      disburseOrder.reason = $scope.thisOrder.reason;
      disburseOrder.note = $scope.thisOrder.note;
      disburseOrder.status = "disbursed";
      disburseOrder.previousStatus = previousStatus;
      disburseOrder.type = "disburse";
      $scope.addOrder(disburseOrder);
    }

    $scope.addDenyOrder = function(denyItems) {
      var denyOrder = {};
      denyOrder.items = denyItems;
      denyOrder.convert = "true";
      denyOrder.user = $scope.thisOrder.user;
      denyOrder.reason = $scope.thisOrder.reason;
      denyOrder.note = $scope.thisOrder.note;
      denyOrder.status = "denied";
      denyOrder.type = $scope.thisOrder.type;
      $scope.addOrder(denyOrder);
    }

    $scope.addReturnOrder = function(returnItems) {
      var returnOrder = {};
      returnOrder.items = returnItems;
      returnOrder.convert = "true";
      returnOrder.user = $scope.thisOrder.user;
      returnOrder.reason = $scope.thisOrder.reason;
      returnOrder.note = $scope.thisOrder.note;
      returnOrder.status = "returned";
      returnOrder.type = "loan";
      $scope.addOrder(returnOrder);
    }


    $scope.addOrder = function(order) {
      OrderFactory.addOrder(order, function(data) {
        console.log("adding order");
        $scope.errorMessage = null;
      });
    }

  // from logs view
    $scope.scrollIntoView = function(rowNum, req) {
        console.log("in scroll into view ");

          if (req && rowNum > 0) {
            $scope.viewOrder(req);
            $("#orderModal").modal();
          }

        }
    })
