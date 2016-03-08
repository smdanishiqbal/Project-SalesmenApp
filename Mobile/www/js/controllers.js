angular.module('starter.controllers', ['firebase','LocalStorageModule','ngCordova'])

  .constant("myfirebaseAddress","https://salesmenapp15.firebaseio.com/")
  .factory('service', function(){
    var companyid;
    function set(id){
      storedid=id;
    }
    function get(){
      return storedid;
    }
    return {
      set:set,
      get:get
    }
  })


  .controller('DashCtrl', function($scope,myfirebaseAddress,$location,$http,$state,service,localStorageService) {

    var ref = new Firebase(myfirebaseAddress);
    ///////login post

    $scope.user = {
      password : "",
      email : ""
    };
    var vm = this;
    $scope.login=function() {
      $scope.isLoading = true;
      console.log($scope.user);
      $http.post("/login",  $scope.user)
        .success(function(config){
          $scope.id=config._id;
          localStorageService.set('User',$scope.id);
          service.set(localStorageService.get('User')  );
          console.log("Saved successfully");
          ref.authWithPassword($scope.user, function (error, authData) {
              $scope.isLoading = false;
              console.log("Authenticated successfully with payload:", authData);
            $scope.id= service.get();
            console.log("Id form service  = "+  $scope.id);
              $state.go("account");
          });
        })
        .error(function(){
          console.log("Invalid Email or Password");
        });








    };

  })

.controller('SignUpCtrl', function($scope,myfirebaseAddress,$location) {
    var ref = new Firebase(myfirebaseAddress);
    var vm = this;
    $scope.Array=[];




    //Button for SignUP User
$scope.submit=function()
{
  //$scope.Array.push(
  //  {
  //    FName:$scope.name,
  //    Pass:$scope.pass,
  //    Email:$scope.email
  //  });
  //ref.push({FirstName:$scope.name,Password:$scope.pass,Email:$scope.email});

  ref.createUser({
    "email": $scope.email,
    password: $scope.pass
  }, function(error, userData) {
    if (error) {
      switch (error.code) {
        case "EMAIL_TAKEN":
          console.log("The new user account cannot be created because the email is already in use.");
          break;
        case "INVALID_EMAIL":
          console.log("The specified email is not a valid email.");
          break;
        default:
          console.log("Error creating user:", error);
      }
    } else {
      console.log("Successfully created user account with uid:", userData.uid);
      $scope.$apply(function() { $location.path("/dash"); });

    }
  });

};





})

//.controller('ChatDetailCtrl', function($scope,myfirebaseAddress,$location,$timeout) {
//    var ref = new Firebase(myfirebaseAddress);
//    $scope.messagesArray=[];
//
//    ref.on("child_added", function(dataSnapshot){
//      console.log(dataSnapshot.val());
//      $timeout(function(){
//        $scope.messagesArray.push(dataSnapshot.val());
//
//      },0);
//    });
//  })
//

  .controller('DetailCtrl', function($scope,myfirebaseAddress,$location,$timeout,$http) {
    //var ref = new Firebase(myfirebaseAddress);
    $scope.users = [];

    $http.get('/details').then(function(d)
      {
      console.log(d.data);

        $scope.users= d.data;
      },function(err)
      {
        console.log("ERRor"+err);            }
    );
    $scope.userImg="img/user.jpg";





  })






  .controller('AccountCtrl', function($scope,$ionicPlatform,$ionicLoading,myfirebaseAddress,$location, $http,service,localStorageService, $cordovaGeolocation) {
    var ref = new Firebase(myfirebaseAddress);
    var vm = this;
    $scope.userData = {};
    $scope.lat="";
    $scope.long="";

    $scope.saveProduct = function(){
      //$scope.id= service.get();
      $scope.id=localStorageService.get('User')  ;
      console.log($scope.id);
      console.log($scope.lat);
      //action="/account" method="post"

      $http.post("/account", {
        id:$scope.id,
        Shop:$scope.userData.Shop,
        Product:$scope.userData.Product,
        quantity:$scope.userData.quantity,
        Lat: $scope.lat,
        Long:$scope.long
      })
        .success(function(config){
          console.log(config);

          //console.log("Saved successfully");
          //ref.push({Email:$scope.userData.email,Password:$scope.userData.pass,salesMen:$scope.userData.userName,Company:$scope.userData.Company,phone:$scope.userData.Phone});

        })
        .error(function(){
          console.log("Error in saving");
        });
    };
    //For geting user Product
    $scope.view = function(){
      $scope.id=localStorageService.get('User')  ;

      console.log($scope.id);
      //action="/account" method="post"

      $http.post("/viewproduct", {
        id:$scope.id
      })
        .success(function(config){
          console.log(config);
          $scope.product=config;
          //console.log("Saved successfully");
          //ref.push({Email:$scope.userData.email,Password:$scope.userData.pass,salesMen:$scope.userData.userName,Company:$scope.userData.Company,phone:$scope.userData.Phone});

        })
        .error(function(){
          console.log("Error in saving");
        });
    };


    ///////////////Geo location
    $ionicPlatform.ready(function() {

      $ionicLoading.show({
        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
      });

      var posOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      };

      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        $scope.lat  = position.coords.latitude;
        $scope.long = position.coords.longitude;
        //console.log(lat);
        //console.log(long);

        var myLatlng = new google.maps.LatLng($scope.lat,$scope.long);

        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        $scope.map = map;
        $ionicLoading.hide();

      }, function(err) {
        $ionicLoading.hide();
        console.log(err);
      });
    })


  });
