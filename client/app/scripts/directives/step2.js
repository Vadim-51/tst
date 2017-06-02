; (function () {
    'use strict';

    var directive = function () {
        return {
            templateUrl: 'views/steps/step2.html',
            restrict: 'E',
            controller: controller
        }
    };

    var dependencies = ['$scope', '$rootScope', 'Scene2d', 'sceneHelper', '$window',
        'constants', '$timeout', 'engine2DSrvc', 'roomStateManager', 'roomSizeManager',
        'roomStuff', 'stage', 'engine'];

    var controller = function ($scope, $rootScope, Scene2d, sceneHelper, $window,
        constants, $timeout, engine2DSrvc, roomStateManager,
        roomSizeManager, roomStuff, stage, engine) {

        $scope.showCeilingPopup = true;
        $scope.measure = {
            inches: "true"
        };
        $scope.ceilingHeight = '';
        var popup = angular.element('.popup-info'); //popup info when selected wall
        var popupPoint = angular.element('.popup-info-point'); //popup info when selected point
        $rootScope.checkPopupInfoHidden = false;
        var timerId;

        var wallHighlight = engine.get().findComponentByType(WallHighlight);
        var moveWall = engine.get().findComponentByType(MoveWall);
        var zoomCamera = engine.get().findComponentByType(ZoomCamera);
        var drawCustomRoom = engine.get().findComponentByType(DrawCustomRoom);

        var selectPointUnsubscribe = $rootScope.$on('selectPoint', function () {
            var popupPoint = angular.element('.popup-info-point');
            popupPoint.fadeIn('slow');
        });

        $scope.popupInfoPointHidden = function () {
            var popupPoint = angular.element('.popup-info-point');
            popupPoint.fadeOut('slow');
        };

        var hiddenPopupInfoUnsubscribe = $rootScope.$on('hiddenPopupInfo', function () {
            //popup.hide();
            popupPoint.hide();
        });

        var changeFloorAreaUnsubscribe = $rootScope.$on('changeFloorArea', function () {
            if ($scope.VisibleStep2)
                roomSizeManager.updateFloorArea(stage.getObjectByName('floor'));
        });

        var changeUnitLengthForWallUnsubscribe = $rootScope.$on('changeUnitLengthForWall', function (e, unit) {

            roomSizeManager.updateWallsSizes(stage.getWalls());

            $rootScope.$broadcast('changeFloorArea');

           // Scene2d.render();
        });

        var zoomUnsubscribe = zoomCamera.on('zoom', function (zoom) {
            if ($scope.VisibleStep2) {
                roomSizeManager.scaleAllSizes(stage.getFloor(), stage.getWalls(), zoom);
                $rootScope.$broadcast('updateWallSizeDialog');
                //Scene2d.render();
            }
        });

        var wallClickUnsubscribe = wallHighlight.on('select', function (wall) {
            if (wall) {
                $rootScope.$broadcast('updateWallSizeDialog', wall.name);
            }
            else {
                $rootScope.$broadcast('updateWallSizeDialog');
                $rootScope.$broadcast('hiddenPopupInfo');
            }
        });
      
        var roomCreateUnsubscribe = drawCustomRoom.on('created', function (points) {
            //zoomCamera.fitRoom();
            //roomStateManager.setPoints(points);
            $rootScope.$broadcast('changeFloorArea');
        });

        drawCustomRoom.on("zoomOut", function () {
            zoomCamera.zoomInOut(1);
        });

        var updateWallSizeInput = function () {
            $rootScope.$broadcast('updateWallSizeDialog');
        };

        $window.addEventListener('resize', updateWallSizeInput, false);

        $scope.changeCeilingHeight = function () {
            if (!isNaN($scope.ceilingHeight) && $scope.ceilingHeight > 0) {
                var height;
                if ($scope.measure.inches == "true") {
                    height = $scope.ceilingHeight * 30.48;
                } else {
                    height = $scope.ceilingHeight;
                }
                roomStuff.filterByHeight(height);
                $scope.showCeilingPopup = false;
                constants.wallHeight = height;
                $rootScope.$broadcast("ceilingHeightUpdate", null);
            }
        }

        $scope.$on('$destroy', function () {
            zoomUnsubscribe();
            wallClickUnsubscribe();
            roomCreateUnsubscribe();
            selectPointUnsubscribe();
            hiddenPopupInfoUnsubscribe();
            changeFloorAreaUnsubscribe();
            changeUnitLengthForWallUnsubscribe();
            $window.removeEventListener('resize', updateWallSizeInput, false);
        });
    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('step2', directive);

})();
