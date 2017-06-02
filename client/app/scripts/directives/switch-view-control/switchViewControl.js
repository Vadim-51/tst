; (function () {
    'use strict';

    var directive = function () {
        return {
            templateUrl: 'views/switchViewControl.html',
            restrict: 'E',
            scope: {},
            controller: controller
        };
    };

    var dependencies = ['$scope', '$rootScope', 'cameraManager',
        'orbitControl', 'engine', 'geometryHelper', 'stage', 'fitRoom'];

    var controller = function ($scope, $rootScope, cameraManager, orbitControl,
        engine, geometryHelper, stage, fitRoom) {

        var saveCameraState = false;

        var doSaveCameraState = function () {
            if (saveCameraState) {
                saveCameraState = false;
                cameraManager.saveState('view3D');
            }
        };

        $scope.planView = function () {
            $rootScope.$broadcast('changeStep', { index: 2, silent: true });
        };

        $scope.birdEye = function () {
            doSaveCameraState();
            $rootScope.$broadcast('changeStep', { index: 3, silent: true });
        };

        $scope.view3D = function () {
            $rootScope.$broadcast('changeStep', { index: 3, silent: true, reset3DCamera: !cameraManager.hasState('view3D') });
            cameraManager.restoreState('view3D');
            saveCameraState = true;
        };

        $scope.wallView = function () {
            $rootScope.$broadcast('changeStep', { index: 3, silent: true, wallView: true, reset3DCamera: false });
        };

        var stepChangeUnregister = $rootScope.$on('stepActive', doSaveCameraState);

        $scope.$on('$destroy', function () {
            stepChangeUnregister();
        });
    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('switchViewControl', directive);

})();
