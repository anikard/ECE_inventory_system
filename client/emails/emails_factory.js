var emails_app = angular.module('emails_app', []);

    emails_app.factory('EmailFactory', function($http) {
      var factory = {};
      var orders = [];
      var customers = [];

      factory.getUsers = function(callback) {
          $http.get('/api/user/show').success(function(output) {
            customers = output;
            callback(customers);
          })
        }

        factory.updateUser = function(info, callback) {
          $http.post('/api/user/subscribe', info).success(function(output) {
            callback();
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

          console.log(orders);
          orders.forEach(function(elem) {
            //WHAT I REMOVED WAS ONE LINE OF COMMENTS HERE
            // elem["customer_name"] = elem["userId"].name;
            //elem.customer_name = "SAMPLE NAME"
          })
          console.log(orders);

          callback(orders);
        })
      }

      return factory;
    });


    emails_app.controller('emailsController', function($scope, $http, $window, EmailFactory, /*auth,*/ $document) {
        //console.log("USER ID: " + auth.currentUserID());
        //var thisId = {userId: auth.currentUserID()};
        
        console.log("IN CONROLLER");


        // $(window).load(function(){  
        //  $( "#datepicker" ).datepicker();
        // });
        // $("#datepicker").datepicker({
        //       dateFormat: 'yy-mm-dd' ,
        //         onSelect: function(dateText, inst) {
        //             $scope.dateSelected = $(this).val();
        //             // if (!$scope.search) {
        //             //   $scope.search = {};
        //             // }
        //         }
        //     });


        $scope.users = EmailFactory.getUsers(function(data) {
          $scope.users = data;
          console.log("GETTTING USERS");
          console.log($scope.users);


          $scope.sub_managers = [];

          for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].subscribed == "subscribed") {
              $scope.sub_managers.push($scope.users[i]);
            }
          }





          console.log("hhh");
          // $("#datepicker").datepicker({
          //     dateFormat: 'yy-mm-dd' ,
          //       onSelect: function(dateText, inst) {
          //           $scope.dateSelected = $(this).val();
          //           // if (!$scope.search) {
          //           //   $scope.search = {};
          //           // }
          //       }
          //   });
        


          // if (!$scope.emailSaved) {
          //   $scope.emailSaved = {};
          // }
          // else {
          //   $scope.email.subject_tag = $scope.emailSaved.subject_tag;
          //   $scope.email.subject = $scope.emailSaved.subject;
          //   $scope.email.body = $scope.emailSaved.body;
          // }


          // TABS 
          // jQuery('.tabs .tab-links a').on('click', function(e)  {
          //   console.log("HEREERERE");
          //     var currentAttrValue = jQuery(this).attr('href');
       
          //     // Show/Hide Tabs
          //     jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
       
          //     // Change/remove current tab to active
          //     jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
       
          //     e.preventDefault();
          // });
       

          // $(document).ready(function(){
          //     $('#datePick').multiDatesPicker();
          // });


        });


        $scope.user = EmailFactory.getuser(function(data) {
          $scope.user = data;
          $scope.authorized = data.status == "admin" || data.status =="manager";
          $scope.myName = data.username || data.netId || data.name;

          console.log("AUTHORIZED:")
          console.log($scope.authorized);
        })

        $scope.subscribeMyself = function(me) {
          var info = {};
          info.subscribed = "subscribed";
          info.email = me.myEmail;
          info._id = $scope.user._id;
            EmailFactory.updateUser(info, function() {
              console.log("subscribed myself Success");
              if(!alert('Successfully subscribed')){window.location.reload();}
            })
        }

        $scope.unsubscribeUser = function(userId) {
          var info = {};
          info.subscribed = "unsubscribed";
          info._id = userId;
            EmailFactory.updateUser(info, function() {
              console.log("unsubscribed Success");
              if(!alert('Successfully unsubscribed')){window.location.reload();}
            })
        }




         $scope.saveEmail = function(email) {
          var savedEmail = email;
          var text = $document[0].getElementById('emailBody').value;
          text1 = text.replace(/\n\r?/g, '<br />');
          var text2 = text.replace(/\n\r?/g, "\\r\\n")
          savedEmail.body = text2;

          var dates = email.date ? email.date.split(',') : [];
          savedEmail.date = dates;

          // $scope.emailSaved = email;
          console.log(savedEmail);

          var efrom = $document[0].getElementById('email_from');
          var eto = $document[0].getElementById('email_to');
          var esubjTag = $document[0].getElementById('email_subj_tag');
          var esubj = $document[0].getElementById('email_subj');
          var eBody = $document[0].getElementById('email_body');
          efrom.innerHTML = "eceInventory@duke.edu";
          eto.innerHTML = " - - - ";
          esubjTag.innerHTML = email.subject_tag + ":";
          esubj.innerHTML = email.subject;
          eBody.innerHTML = text1;

        }


        // AUTH
        $scope.logout = function() {
          $http.get('/api/auth/logout').success(function(output) {
            $scope.isLoggedIn = false;
            window.location.assign("/");
          });
        }
        console.log("hhh2");
        //  $(window).load(function(){  
        //  $( "#datepicker" ).datepicker();
        // });
        // $("#datepicker").datepicker({
        //       dateFormat: 'yy-mm-dd' ,
        //         onSelect: function(dateText, inst) {
        //             $scope.dateSelected = $(this).val();
        //             // if (!$scope.search) {
        //             //   $scope.search = {};
        //             // }
        //         }
        //     });
        

    })
