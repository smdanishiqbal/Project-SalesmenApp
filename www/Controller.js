/**
 * Created by SMD on 1/29/2016.
 */
angular.module('myApp', ['ngMaterial','firebase','ui.router'])

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


  /////  Routes
    .config(function ($stateProvider,$urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');
        $stateProvider


            .state('Salesmens',{
                url:"/Salesmens",
                templateUrl:'Components/Salesmens.html',
                controller:'detailsCtrl'
            })
            .state('login',{
                url:"/login",
                templateUrl:'Components/login.html',
                controller:'login'

            })
            .state('details',{
                url:"/details",
                templateUrl:'Components/Details.html',
                controller:'detailsCtrl'

            })
            .state('admin',{
                url:"/admin",
                templateUrl:'Components/admin.html',
                controller:'login'

            })
            .state('CompanyUsers',{
                url:"/CompanyUsers",
                templateUrl:'Components/CompanyUsers.html',
                controller:'SalesmenCtrl'

            })
            .state('Account',{
                url:"/Account",
                templateUrl:'Components/Account.html',
                controller:'AccountCtrl'

            });

    })



















    .controller('login', function($scope,myfirebaseAddress,$location,$mdToast,$http,$state,service) {

        var ref = new Firebase(myfirebaseAddress);
        $scope.userImg="img/wallpaper.jpg";


        var last = {
            bottom: false,
            top: true,
            left: false,
            right: true
        };
        $scope.toastPosition = angular.extend({},last);
        $scope.getToastPosition = function() {
            sanitizePosition();
            return Object.keys($scope.toastPosition)
                .filter(function(pos) { return $scope.toastPosition[pos]; })
                .join(' ');
        };
        function sanitizePosition() {
            var current = $scope.toastPosition;
            if ( current.bottom && last.top ) current.top = false;
            if ( current.top && last.bottom ) current.bottom = false;
            if ( current.right && last.left ) current.left = false;
            if ( current.left && last.right ) current.right = false;
            last = angular.extend({},current);
        }

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

                    service.set($scope.id);

                    ref.authWithPassword($scope.user, function (error, authData) {
                        if (error) {
                            $scope.isLoading = false;
                            console.log("Login Failed!", error);
                        } else {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Successfully Login!')
                                    .position($scope.getToastPosition())
                                    .hideDelay(3000)
                            );

                            $scope.isLoading = false;
                            console.log("Authenticated successfully with payload:", authData);
                            $scope.$apply(function() { $location.path("/CompanyUsers"); });

                        }
                    });
                    })

                .error(function(){
                    $scope.isLoading = false;
                    console.log("Error in posting");
                });
        };
        //For Admin Login
        $scope.admin={
            password:'',
            email:''

        };
        $scope.adminlogin=function() {

            $scope.isLoading = true;
            console.log($scope.user);
            $http.post("/adminlogin",  $scope.admin)
                .success(function(config){
                    console.log(config);
                    $scope.isLoading = false;


                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Successfully Login!')
                                    .position($scope.getToastPosition())
                                    .hideDelay(3000)
                            );
                            $scope.isLoading = false;
                            $state.go('Account');



                })

                .error(function(){
                    console.log("Error in posting");
                });
        };
        //Show Company users


    })

    .controller('SalesmenCtrl', function($scope,myfirebaseAddress,$location,service,$http,$mdSidenav,$mdMedia,$mdDialog) {
        $scope.Banner="img/company.jpg";
        $scope.userImg="img/user.jpg";
        $scope.ShowUsers=function() {
            $scope.id= service.get();
            console.log($scope.id);
            $http.post("/companyuser",{id:$scope.id})
                .success(function(config){

                    $scope.users=config;
                })
                .error(function(){
                    console.log("Error ");
                });
        };

        $scope.show=function(id){
            $scope.id=id;
            $http.post('/viewSalesmen',{id:$scope.id})
                .success(function(config) {
                    $scope.salesmen=config;
                    console.log(config);

                });
            $mdSidenav('left').toggle();
        };

        //-------------------------------------
        $scope.showProducts=function(ev,id){
            $scope.cid=id;
            $http.post('/viewSalesmen',{id:$scope.cid})
                .success(function(config) {
                    $scope.salesmen=config;
                    console.log(config);

                });
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
            $mdDialog.show({

                templateUrl: 'users.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                fullscreen: useFullScreen
            })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
            $scope.$watch(function() {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function(wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });



        };
        $scope.close=function(){
            // Easily hides most recent dialog shown...
            // no specific instance reference is needed.
            $mdDialog.hide();
        };










        ///////---------------------------


    })

    .controller('detailsCtrl', function($scope,myfirebaseAddress,$location,$timeout,$http, $mdDialog,$mdMedia,service,$mdSidenav) {
        var ref = new Firebase(myfirebaseAddress);

        $scope.users = {};
        $scope.showAdvanced=function(ev,id){
            $scope.cid=id;

            service.set(id);
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
            $mdDialog.show({

                templateUrl: 'addsalesmen.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                fullscreen: useFullScreen
            })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
            $scope.$watch(function() {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function(wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });



        };


        $http.get('/details').then(function(d)
            {
             //  console.log(d);
                $scope.users= d.data;
            },function(err)
            {
                console.log(err);            }
        );
        $scope.userImg="img/user.jpg";


        $scope.isSidenavOpen = false;



        $scope.$watch('isSidenavOpen', function(isSidenavOpen) {
           // alert('sidenav is ' + (isSidenavOpen ? 'open' : 'closed'));
        });
        //



        $scope.show=function(id){
            $scope.comid=id;
            console.log($scope.comid);
            $http.post('/viewuser',{comid:$scope.comid})
                .success(function(config) {
                   $scope.salesmen=config;
                    console.log(config);

                });
           $mdSidenav('left').toggle();
        };
        $scope.close=function(){
                // Easily hides most recent dialog shown...
                // no specific instance reference is needed.
                $mdDialog.hide();
            };



        ///Create Salesmen Account

        $scope.createSalemen = function(){
            //action="/Salesmen" method="post"

            $scope.id= service.get();


                console.log($scope.userData.salesmen);
            $http.post("/salesmen",{
                comid:$scope.id,
                uname:$scope.userData.salesmen,
                uemail:$scope.userData.email,
                upassword:$scope.userData.password

            })

                .success(function(config){

                    console.log(config);
                    console.log("Saved successfully");
                    ref.createUser({
                        "email": $scope.userData.email,
                        password: $scope.userData.password
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
                            $scope.close();



                        }
                    });
                })
                .error(function(){
                    console.log("Error in saving");
                });
        };




    })

    .controller('AccountCtrl', function($scope,myfirebaseAddress,$location, $http,$interval) {
        var ref = new Firebase(myfirebaseAddress);
        var vm = this;
        $scope.userData = {};
        $scope.SalemenData = {};

        $scope.CreateCompany = function(){
            //action="/account" method="post"


            $http.post("/account",  $scope.userData)
                .success(function(config){
                    console.log(config);
                    console.log("Saved successfully");
                    ref.createUser({
                        "email": $scope.userData.email,
                        password: $scope.userData.password
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
                            $scope.$apply(function() { $location.path("/Salesmens"); });

                        }
                    });
                })
                .error(function(){
                    console.log("Error in saving");
                });
        };












    });


//Dialog function

function DialogController($scope, $mdDialog,service) {
    $scope.id= service.get();
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}

