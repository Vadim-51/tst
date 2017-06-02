; (function () {
    'use strict';

    var directive = function () {
        return {
            templateUrl: 'views/cameraNavControl.html',
            restrict: 'E',
            scope: {
                activeStep: '='
            },
            controller: controller
        };
    };

    var dependencies = ['$rootScope', '$scope', 'orbitControl', 'scene3D',
        'Scene2d', 'engine2DSrvc', 'wallNumberSrvc', 'engine3DSrvc', 'cameraManager', 'fitRoom', 'engine'];

    var controller = function ($rootScope, $scope, orbitControl, scene3D, Scene2d,
        engine2DSrvc, wallNumberSrvc, engine3DSrvc, cameraManager, fitRoom, engine) {

        var timer;
        var speed = 3;
        var camera2D = cameraManager.getOrtografic();
        var camera3D = cameraManager.getPerspective();
        var viewWallComponent = engine.get().findComponentByType(WallView);

        var clearTimer = function () {
            clearInterval(timer);
            timer = null;
        };

        var move2DCamera = function (x, z) {
            camera2D.position.z += z;
            camera2D.position.x += x;
            //camera2D.updateMatrixWorld();
            //Scene2d.render();
        };

        var scene2DHandler = function (actionName) {

            clearTimer();

            switch (actionName) {
                case 'up':
                    timer = setInterval(angular.bind(null, move2DCamera, 0, -speed), 1);
                    break;
                case 'down':
                    timer = setInterval(angular.bind(null, move2DCamera, 0, speed), 1);
                    break;
                case 'left':
                    timer = setInterval(angular.bind(null, move2DCamera, -speed, 0), 1);
                    break;
                case 'right':
                    timer = setInterval(angular.bind(null, move2DCamera, speed, 0), 1);
                    break;
                case 'home':
                    {
                        //var zoomCamera = engine2DSrvc.get().findComponentByType(ZoomCamera);
                        //zoomCamera.fitRoom();
                        fitRoom.in2D();
                    }
                    break;
            }
        };

        var scene3DHandler = function (actionName) {

            clearTimer();

            switch (actionName) {
                case 'up':
                    timer = setInterval(angular.bind(null, orbitControl.pan, 0, speed), 1);
                    break;
                case 'down':
                    timer = setInterval(angular.bind(null, orbitControl.pan, 0, -speed), 1);
                    break;
                case 'left':
                    timer = setInterval(angular.bind(null, orbitControl.pan, speed, 0), 1);
                    break;
                case 'right':
                    timer = setInterval(angular.bind(null, orbitControl.pan, -speed, 0), 1);
                    break;
                case 'home':
                    {
                        fitRoom.in3D();                       
                        wallNumberSrvc.updateScale(camera3D.position);
                    }
                    break;
            }

        };

        $scope.isVisible = true;

        $scope.invokeAction = function (actionName) {
            var handler = $scope.activeStep == 3 ? scene3DHandler : scene2DHandler;
            handler(actionName);
        };

        $scope.finish = function () {
            clearTimer();
        };

        var wallModeEnterUnreg = viewWallComponent.on('enter', function () {
            $scope.isVisible = false;
        });

        var wallModeLeaveUnreg = viewWallComponent.on('leave', function () {
            $scope.isVisible = true;
        });

        var stepChangeUnregister = $rootScope.$on('stepActive', function (events, step) {
            $scope.isVisible = true;
        });

        $scope.$on('$destroy', function () {
            wallModeEnterUnreg();
            wallModeLeaveUnreg();
            stepChangeUnregister();
        });
    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('cameraNavControl', directive);

})();
