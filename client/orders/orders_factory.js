var orders_app = angular.module('orders_app', []);

    orders_app.factory('OrderFactory', function($http) {
      var factory = {};
      var orders = [];
      var customers = [];
      var products = [];
      var backfills = [];

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

      factory.getbackfills = function(callback) {
        $http.get('/api/backfill/show').success(function(output) {
          backfills = output;
          callback(backfills);
        })
      }

      factory.getorders = function(callback) {
        $http.get('/api/request/show').success(function(output) {
          orders = output;
          callback(orders);
        })
      }

      factory.viewOrder = function(info, callback) {
        $http.post('/api/request/findOne', info)
          .success(function(output) {
            callback(output);
          })
          .error(function(error) {
            console.log("ERR in fcatory viewOrder");
            callback(error);
          })
      }



      factory.updateOrder = function(info, oldOrder, callback) {
        $http.post('/api/request/update', info)
          .success(function(output) {
              callback(output, null);
          })
          .error(function(error) {
            callback(error, oldOrder);
          })
      }

      factory.respondOrder = function(info, callback) {
        $http.post('/api/request/respond', info)
          .success(function(output) {
            callback(output);
          })
          .error(function(error) {
            callback(error);
          })
      }

      factory.removeOrder = function(order, callback) {
        $http.post('/api/request/close', order).success(function(output) {
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
          $scope.thisOrder = {};
          console.log("ORDERS");
          console.log($scope.orders);
          /** PAGINATION **/
          // show more functionality source: http://www.angulartutorial.net/2014/04/angular-js-client-side-show-more.html
          var pagesShown = 1;
          var pageSize = 5;
          $scope.paginationLimit = function(data) {
           return pageSize * pagesShown;
          };

          $scope.hasMoreItemsToShow = function() {
            if ($scope.orders) {
             return pagesShown < ($scope.orders.length / pageSize);
            }
          };

          $scope.showMoreItems = function() {
           pagesShown = pagesShown + 1;
          };
          /** END OF PAGINATION **/
          /** LOG LINKS **/
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
          /** END OF LOG LINKS **/
        });

        $scope.backfills = OrderFactory.getbackfills(function(data) {
          $scope.backfills = data;
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
          // TODO: ask mike to get user id from backend on this call
          $scope.user = data;

          $scope.isAuthorized = data.status == "admin" || data.status =="manager";
          $scope.myName = data.username || data.netId || data.name;
          $scope.myId = data._id;

          console.log("AUTHORIZED:")
          console.log($scope.isAuthorized);

          if ($scope.isAuthorized) {
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
            $scope.refreshOrders();
        });

      }

      $scope.refreshOrders = function () {
          $scope.orders = OrderFactory.getorders(/*thisId,*/ function(data) {
            $scope.orders = data;
          });
      }

      $scope.hasOutstanding = function() {
        // Some bullshit hack to remove console errors,
        // Why is this method being called outside of modal on page load??
        if($scope.thisOrder && $scope.thisOrder.user) {
          for (var i = 0; i < $scope.thisOrder.items.length; i++) {
            if ($scope.thisOrder.items[i].quantity_requested > 0) {
              return true;
            }
          }
        }
        return false;
      }

      $scope.hasDisburse = function() {
        // Some bullshit hack to remove console errors,
        // Why is this method being called outside of modal on page load??
        if($scope.thisOrder && $scope.thisOrder.user) {
          for (var i = 0; i < $scope.thisOrder.items.length; i++) {
            return ($scope.thisOrder.items[i].quantity_disburse +
            $scope.thisOrder.items[i].quantity_deny +
            $scope.thisOrder.items[i].quantity_return) > 0;
          }
        }
        return false;
      }

      $scope.hasLoan = function() {
        // Some bullshit hack to remove console errors,
        // Why is this method being called outside of modal on page load??
        if($scope.thisOrder && $scope.thisOrder.user) {
          for (var i = 0; i < $scope.thisOrder.items.length; i++) {
            if ($scope.thisOrder.items[i].quantity_loan > 0) {
              return true;
            }
          }
        }
        return false;
      }

      $scope.hasBackfill = function() {
        if ($scope.thisOrder) {
          if ($scope.thisOrder.backfills) {
            return $scope.thisOrder.backfills.length > 0;
          }
        }
        return false;
      }

      $scope.validBackfillStatuses = function(status) {
        switch (status.copyStatus) {
          case 'requested':
            return ['inTransit', 'deny'];
          case 'inTransit':
            return ['fulfilled', 'failed'];
          default:
            return [];
        }
      }

      $scope.backfillStatuses = ['requested', 'inTransit', 'denied', 'failed', 'fulfilled', 'closed'];

      $scope.viewOrder = function(order) {
        //$scope.backfillStatuses = ['requested', 'inTransit', 'denied', 'failed', 'fulfilled', 'closed'];
        OrderFactory.viewOrder(order, function(data) {
          $scope.errorMessage = null;
          $scope.thisOrder = data;
          //$scope.populateZerosInTables();
          $scope.copyStatus();
          $scope.orderId = order.user._id;
          $scope.isMe = $scope.orderId == $scope.myId;
          $('#orderModal').modal('show');
        });
      }

      $scope.copyStatus = function() {
        for (var i = 0; i < $scope.thisOrder.backfills.length; i++) {
          $scope.thisOrder.backfills[i].copyStatus = $scope.thisOrder.backfills[i].status;
        }
      }

      $scope.respondToOrder = function(order) {
        var oldOrder = angular.copy(order);
        console.log("RESPONDING TO ORDER");
        var debug = $scope.thisOrder;
        //$scope.updateThisOrderQuantities();
        if($scope.thisOrder.currentNote) $scope.thisOrder.notes.push($scope.thisOrder.currentNote);
        // SIMPLIFIED RESPONSE
        OrderFactory.updateOrder($scope.thisOrder, oldOrder, function(data, oldOrder) {
          console.log("in respond");
          console.log(data);
          if(data.err) {
            console.log("error")
            $scope.errorMessage = data.err;
            $scope.thisOrder = oldOrder;
          }
          else {
            $scope.orderResponse = {};
            $scope.responseToOrder = {};
            $('#orderModal').modal('hide');
            $scope.refreshOrders();
            alert("Successfully changed status to " + data.status + "");
          }
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
