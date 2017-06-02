'use strict';

/**
 * @ngdoc overview
 * @name vigilantApp
 * @description
 * # vigilantApp
 *
 * Main module of the application.
 */
angular.module('checkboxExample', [])
  .controller('ExampleController', ['$scope', function ($scope) {
    $scope.checkboxModel = {
      value1: true,
      value2: 'YES'
    };
  }]);
angular.module('vigilantApp.driCoreServices', []);
angular.module('vigilantApp', ['vigilantApp.driCoreServices', 'ngAnimate', 'ngCookies', 'ngResource',
  'ngRoute', 'ngSanitize', 'ngTouch', 'toastr', 'LocalStorageModule', 'ngDialog', 'ui.bootstrap-slider',
  'ui.dateTimeInput', 'ui.bootstrap.datetimepicker', 'ngFileUpload', 'colorpicker.module', 'ngLodash'])
  .config(['$routeProvider', function ($routeProvider) {
    angular.element(document).ready(function () {
      console.log('document ready');
      angular.element("body").tooltip({ selector: '[data-toggle=tooltip]' });
    });

    $routeProvider
      .when('/', {
        // templateUrl: 'views/main.html',
        // templateUrl: 'views/planning_room.html',
        // controller: 'MainCtrl'
        redirectTo: 'login'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        access: { requiredLogin: true }
      })
      .when('/planning', {
        templateUrl: 'views/planning_room.html',
        controller: 'MainCtrl',
        access: { requiredLogin: true }
      })
      .when('/models_publish', {
        templateUrl: 'views/modelsCRUD.html',
        controller: 'ModelPublCtrl',
        access: { requiredPublisher: true }
      })
      .when('/material_publish', {
        templateUrl: 'views/materialsCRUD.html',
        controller: 'MaterialPublCtrl',
        access: { requiredPublisher: true }
      })
      .when('/left_menu_publish', {
        templateUrl: 'views/leftMenuCRUD.html',
        controller: 'LeftMenuPublCtrl',
        access: { requiredPublisher: true }
      })
      .when('/suite_publish', {
        templateUrl: 'views/suitesCRUD.html',
        controller: 'SuitePublCtrl',
        access: { requiredPublisher: true }
      })
      .when('/color_sheme_publish', {
        templateUrl: 'views/colorSchemesCRUD.html',
        controller: 'ColorSchemePublCtrl',
        access: { requiredPublisher: true }
      })
      .when('/templates/:room_id', {
        templateUrl: 'views/planning_room.html',
        controller: 'MainCtrl',
        resolve: {
          loadRoom: function ($rootScope, $timeout, ResourceService, toastr, $routeParams) {
            $rootScope.isTemplate = true;
            $rootScope.notStep = true;
            $timeout(function () {
              ResourceService.getOneTemplate($routeParams.room_id).then(function (data) {
                $rootScope.editedRoomData = data;
                $rootScope.$broadcast('loadRoom', data);
                $rootScope.notStep = false;
              },
                function (data) {
                  toastr.error(data);
                });
            }, 1000);
          }
        },
        access: { requiredLogin: true }
      })
      .when('/planning/:room_id', {
        templateUrl: 'views/planning_room.html',
        controller: 'MainCtrl',
        resolve: {
          loadRoom: function ($rootScope, $timeout, ResourceService, toastr, $routeParams) {
            $rootScope.notStep = true;
            //Change
            $rootScope.isTemplate = false;
            $timeout(function () {
              ResourceService.getOne($routeParams.room_id).then(function (data) {
                $rootScope.editedRoomData = data;
                $rootScope.$broadcast('loadRoom', data);
                $rootScope.notStep = false;
              },
                function (data) {
                  toastr.error(data);
                });
            }, 1000);
          }
        },
        access: { requiredLogin: true }
      })
      .when('/browsing/:room_id', {
        templateUrl: 'views/planning_room.html',
        controller: 'MainCtrl',
        resolve: {
          loadRoom: function ($rootScope, $timeout, ResourceService, toastr, $routeParams) {
            $timeout(function () {
              ResourceService.getOne($routeParams.room_id).then(function (data) {
                $rootScope.editedRoomData = data;
                $rootScope.$broadcast('loadRoom', data);
              },
                function (data) {
                  toastr.error(data);
                });
            }, 1000);
          }
        }
      })
      .when('/login', {
        templateUrl: 'views/auth/login.html',
        controller: 'AuthCtrl',
        access: { requiredAuth: false }
      })
      .when('/account', {
        templateUrl: 'views/auth/userAccount.html',
        controller: 'AuthCtrl',
        access: { requiredAuth: true }
      })
      .when('/forgot', {
        templateUrl: 'views/auth/forgotPassword.html',
        controller: 'ForgotPass',
        access: { requiredAuth: false }
      })
      .when('/reset/:user_id', {
        templateUrl: 'views/auth/formResetPassword.html',
        controller: 'ForgotPass',
        access: { requiredAuth: false }
      })
      .when('/admin/login', {
        templateUrl: 'views/admin/login.html',
        controller: 'AdminControl'
        //access: {requiredLogin: false}
      })
      .when('/admin/main', {
        templateUrl: 'views/admin/main.html',
        controller: 'AdminControl'
        //access: {requiredLogin: false}
      })
      .otherwise({
        redirectTo: '/login'
      });
  }])

  .config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('');
  }])

  //app.config(function ($httpProvider) {
  //console.log("$httpProvider = ", $httpProvider);
  //$httpProvider.interceptors.push('TokenInterceptor');
  //});

  .config(['toastrConfig', function (toastrConfig) {
    angular.extend(toastrConfig, {
      allowHtml: false,
      autoDismiss: true,
      closeButton: false,
      closeHtml: '<button>&times;</button>',
      containerId: 'toast-container',
      extendedTimeOut: 2000,
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning'
      },
      maxOpened: 1,
      messageClass: 'toast-message',
      newestOnTop: true,
      onHidden: null,
      onShown: null,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      progressBar: true,
      tapToDismiss: true,
      target: 'body',
      templates: {
        toast: 'directives/toast/toast.html',
        progressbar: 'directives/progressbar/progressbar.html'
      },
      timeOut: 4000,
      titleClass: 'toast-title',
      toastClass: 'toast'
    });
  }])

  .config(['ngDialogProvider', function (ngDialogProvider) {
    ngDialogProvider.setDefaults({
      className: 'ngdialog-theme-default',
      plain: false,
      showClose: true,
      closeByDocument: true,
      closeByEscape: true,
      appendTo: false
    });
  }])


  .run(['$rootScope', '$location', 'AuthenticationService', 'toastr', 'localStorageService', 
    function ($rootScope, $location, AuthenticationService, toastr, localStorageService) {
    $rootScope.$on("$routeChangeStart", function (event, nextRoute, currentRoute) {

      if (nextRoute.$$route.originalPath === '/login') {
        $rootScope.loginPage = true;
        localStorageService.set("guest", null);
      }
      else {
        $rootScope.loginPage = false;
      }

      if (nextRoute.access) {
        if (nextRoute.access === undefined) {
          $location.path(nextRoute.$$route.originalPath);

        } else if (nextRoute.access.requiredLogin && !AuthenticationService.isLogged()) {
          $location.path("/login");
        } else if (nextRoute.access.requiredAuth && !AuthenticationService.isAuthenticated()) {
          $location.path("/login");
        } else if (nextRoute.access.requiredAuth === false && AuthenticationService.isAuthenticated()) {
          $location.path("/planning");
        }
        else if (AuthenticationService.isLogged() && nextRoute.access.requiredLogin === false) {
          $location.path("/account");
        }
        else if (nextRoute.access.requiredPublisher && !AuthenticationService.publisher()) {
          $location.path("/planning");
          toastr.warning("You don't have privileges to view this page");
        }
      }
    });
  }])
  .run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
      if (reload === false) {
        var lastRoute = $route.current;
        var un = $rootScope.$on('$locationChangeSuccess', function () {
          $route.current = lastRoute;
          un();
        });
      }
      return original.apply($location, [path]);
    };
  }]);
