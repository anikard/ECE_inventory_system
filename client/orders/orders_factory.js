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
          for (var i = 0; i < $scope.orders.length; i++) {
            if ($scope.orders[i]._id == $scope.selected_request) {
              thisReqIndex = i;
            }
          }

          $scope.requestIndex = thisReqIndex+1;

          $scope.scrollIntoView(thisReqIndex+1);

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
          $scope.scrollIntoView($scope.requestIndex);
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
            for (var i =0; i < $scope.orders.length; i++)
            {  if ($scope.orders[i]._id === order._id) {
                  $scope.orders.splice(i,1);
                  break;
                }
            }
        });

      }


      $scope.viewOrder = function(order) {
          OrderFactory.viewOrder(order, function(data) {

            $scope.thisOrder = data;
            $scope.thisOrder.customer_name = data.user.username;
            console.log("THIS ORDER");
            console.log($scope.thisOrder);
            if ($scope.thisOrder.status != "open") {
              ($document[0].getElementById('cancelOrderButton')).style.display = "none";
              ($document[0].getElementById('request_response_form')).style.display = "none";
            }
            else {
              ($document[0].getElementById('cancelOrderButton')).style.display = "inline";
              ($document[0].getElementById('request_response_form')).style.display = "block";
              ($document[0].getElementById('respondOrderButton')).style.display = "inline";
            }
            console.log(data);
        });

      }

      $scope.respondToOrder = function() {

        // $scope.orderResponse.dateFulfilled = new Date();
        console.log("RESPONDING TO ORDER");
        var approved = $document[0].getElementsByClassName('approveButton')[0].checked;
        var denied = $document[0].getElementsByClassName('denyButton')[0].checked;

        console.log(approved);
        console.log(denied);

        $scope.responseToOrder = {};

        if (approved) { $scope.responseToOrder.status = "approved"; }
        else if (denied) { $scope.responseToOrder.status = "denied"; }
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
          }
        });
      }

  // from logs view
    $scope.scrollIntoView = function(rowNum) {
        console.log("in scroll into view ");
          var trs = document.getElementById('myRequestsTable').getElementsByTagName('tr');
          var arr = Array.prototype.slice.call( trs )

          var element = {};
          if ($scope.requestIndex) {
            element = trs[$scope.requestIndex];
          }
          else {
            element = trs[rowNum];
          }

          // var element = trs[$scope.requestIndex];

          if (rowNum || element) {
            var container = "window";
            var containerTop = $(container).scrollTop();
            var containerBottom = containerTop + $(container).height();
            var elemTop = element.offsetTop;
            var elemBottom = elemTop + $(element).height();

            var elemAbsTop = element.getBoundingClientRect().top;

            $("#myRequestsTable tr:nth-child("+$scope.requestIndex+")")[0].scrollIntoView();

            window.scrollBy(0,-100);

            var cols = element.getElementsByTagName('td');

            for (var x = 0; x < cols.length; x++) {
              cols[x].style.backgroundColor = "lightgreen";
            }
          }
        }
    })
