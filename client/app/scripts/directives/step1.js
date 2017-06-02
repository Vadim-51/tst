'use strict';

/**
 * @ngdoc directive
 * @name vigilantApp.directive:step1
 * @description
 * # step1
 */
angular.module('vigilantApp').directive('step1', ['SaveStateService', '$rootScope', 'ResourceService',
  'AuthenticationService', '$location',
  function (SaveStateService, $rootScope, ResourceService, AuthenticationService, $location) {
    return {
      templateUrl: 'views/steps/step1.html',
      restrict: 'E',
      controller: function ($scope, $rootScope) {

        $scope.showWelcome = !SaveStateService.getHideWelcomeOn1st();
        $scope.showPopupLayouts = SaveStateService.getHideWelcomeOn1st();
        $scope.user = AuthenticationService.userLogged();

        $scope.InvisibleStep1 = function (room) {
          $rootScope.$broadcast('SelectRoom', room);
        };
        $scope.clearSavedState = function () {
          SaveStateService.clearSavedState();
          $rootScope.editedRoomData = null;
        };
        $scope.hidePopup = function () {
          $scope.showPopupLayouts = false;
        };
        $scope.onLayoutChecked = function (layout) {
          console.debug(layout._id);
          $scope.selected = layout._id;
          $scope.layout = layout;
        };
        $scope.start = function () {
          console.debug($scope.layout._id);
          if (!$scope.layout) return;
          if ($scope.layout.titleProject === 'Start from Scratch') {
            $scope.InvisibleStep1($scope.layout);
          }
          else {
            var path;
            if (AuthenticationService.publisher()) {
              path = '/templates/';
            } else if ($scope.defTab) {
              path = '/templates/';
            } else {
              path = '/planning/';
            }
            // path = ($scope.defTab? '/templates/': '/planning/')+$scope.layout;
            path += $scope.layout._id;
            $location.path(path);
            if (!$scope.defTab) {
              $rootScope.$broadcast('loadRoom', $scope.layout);
            }
            // else{
            //   $scope.InvisibleStep1($scope.layout);
            // }
            $scope.layout = null;
            $scope.selected = null;
          }
        };
        $scope.defTab = true;
        $scope.userRooms = [];
        if (AuthenticationService.publisher()) {
          ResourceService.getAllTemplates().then(function (data) {
            makeRows(data);
          }, function (data) {
            toastr.error(data.message);
          });
        } else {
          ResourceService.getAllroom().then(function (data) {
            makeRows(data);
          }, function (data) {
            toastr.error(data.message);
          });
        }
        function makeRows(data) {
          for (var i = 0; i < data.length; i += 3) {
            var row = [];
            for (var j = i; j < (i + 3) && j < data.length; j++) {
              row.push(data[j]);
            }
            $scope.userRooms.push(row);
          }
        };
      },
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
