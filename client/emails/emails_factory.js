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

        factory.getEmail = function(callback) {
          $http.get('/api/email/show').success(function(output) {
            callback(output);
          })
        }

        factory.addEmail = function(info, callback) {
          $http.post('/api/email/add', info).success(function(output) {
            callback(output);
          })
        }

        factory.updateEmail = function(info, callback) {
          $http.post('/api/email/update', info).success(function(output) {
            callback();
          })
        }

        factory.getuser = function(callback) {
          $http.get('/api/user').success(function(output) {
            callback(output);
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

          // var default_email = {
          //   _id: "58d1c285a756ee64682ef8ad",
          //   subject: "hello",
          //   body: "I say hello, you say goodbye.",
          //   send_dates: "some date"
          // };

          var default_email = {
            _id: "58d1c285a756ee64682ef8ad"
          };

          EmailFactory.addEmail(default_email, function(data) {
            console.log("ADDED EMAIL");
            console.log(data);
          })
       


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

          $scope.savedEmailInfo = EmailFactory.getEmail(function(data) {
            $scope.savedEmailInfo = data[0];
            var txt = $scope.savedEmailInfo.body;
            // console.log(JSON.stringify($scope.savedEmailInfo.body));
            var text1 = txt.split("\n").join("<br />");
            var efrom = $document[0].getElementById('email_from');
            var eto = $document[0].getElementById('email_to');
            var esubjTag = $document[0].getElementById('email_subj_tag');
            var esubj = $document[0].getElementById('email_subj');
            var eBody = $document[0].getElementById('email_body');
            efrom.innerHTML = "noreply@duke.edu";
            eto.innerHTML = " - - - ";
            esubj.innerHTML = $scope.savedEmailInfo.subjectTag + ": " + $scope.savedEmailInfo.subject;
            eBody.innerHTML = text1;
          });

        });



        $scope.user = EmailFactory.getuser(function(data) {
          $scope.user = data;
          $scope.authorized = data.status == "admin" || data.status =="manager";
          $scope.myName = data.username || data.netId || data.name;

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
         
          if (email.body) {
            $scope.savedEmailInfo.body = email.body;
          }
          if (email.subject_tag) {
            $scope.savedEmailInfo.subjectTag = email.subject_tag;
          }
          if (email.subject) {
            $scope.savedEmailInfo.subject = email.subject;
          }
          if (email.date) {
            $scope.savedEmailInfo.dates = email.date.split(",");
          }

          var efrom = $document[0].getElementById('email_from');
          var eto = $document[0].getElementById('email_to');
          var esubjTag = $document[0].getElementById('email_subj_tag');
          var esubj = $document[0].getElementById('email_subj');
          var eBody = $document[0].getElementById('email_body');
          efrom.innerHTML = "noreply@duke.edu";
          eto.innerHTML = " - - - ";
          esubj.innerHTML = $scope.savedEmailInfo.subjectTag + ": " + $scope.savedEmailInfo.subject;
          eBody.innerHTML = $scope.savedEmailInfo.body.replace(/\n\r?/g, '<br />');

          EmailFactory.updateEmail($scope.savedEmailInfo, function(data) {
            console.log("updated EMAIL");
            console.log(data);
            $scope.email = {};
            $document[0].getElementById('emailInput1').value = "";
            $document[0].getElementById('emailInput2').value = "";
            $document[0].getElementById('emailBody').value = "";
            $document[0].getElementById('datepicker').value = "";
          })
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
