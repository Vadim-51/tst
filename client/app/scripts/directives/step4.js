; (function () {
    'use strict';

    var directive = function () {
        return {
            templateUrl: 'views/steps/step4.html',
            restrict: 'E',
            scope: {
                flipHelpBtn: '='
            },
            controller: controller
        };
    };

    var dependencies = ['$scope', '$rootScope', 'scene3D', 'constants', 'roomStateManager', 'objectMaterial', 'orbitControl',
        'engine3DSrvc', 'ngDialog', '$timeout', 'wall3DDataManager', 'Scene2d', 'productDetailDialogSrvc', 'engine', 'cameraManager'];

    var controller = function ($scope, $rootScope, scene3D, constants, roomStateManager, objectMaterial,
        orbitControl, engine3DSrvc, ngDialog, $timeout, wall3DDataManager, Scene2d, productDetailDialogSrvc, engine, cameraManager) {

        var step4IsActive = false,
            newStep,
            defaultOption = 'Change View',
            cabinets;

        var select3DComponent = engine.get().findComponentByType(Select3D);
        var viewWallComponent = engine.get().findComponentByType(WallView);
        var addObjectComponent = engine.get().findComponentByType(ObjectAdd);

        $scope.walls = [];
        $scope.selectedWall = defaultOption;
        $scope.isInWallMode = false;
        $scope.freeCamera;
        $scope.areCars = false;

       // var p, r, t;

        $scope.onWallChange = function (wall) {
            if (!$scope.freeCamera) {
                $scope.freeCamera = true;
                //var c = cameraManager.getCamera();
                //p = c.position.clone();
                //r = c.rotation.clone();
                //t = orbitControl.getTarget().clone();

                cameraManager.saveState('wallView');

            }
            $scope.selectedWall = wall;
            var isInWallMode = $scope.selectedWall !== defaultOption;

            if (isInWallMode) {
                select3DComponent.clearSelection();
                viewWallComponent.enter($scope.selectedWall);
            }
            else {

                cameraManager.restoreState('wallView');

                //var c = cameraManager.getCamera();
                //c.position.copy(p);
                //c.rotation.copy(r);
                //c.updateMatrixWorld();
                //orbitControl.setTarget(t);
                $scope.freeCamera = false;
                //p = null;
                //r = null;
                //t = null;

                viewWallComponent.leave();
            }

            $scope.isInWallMode = isInWallMode;
            $scope.flipHelpBtn = isInWallMode;
        };

        $scope.freeLookBtnClick = function () {
            $scope.onWallChange(defaultOption);
        };

        $scope.changeWall = function (dir) {
            var wall = viewWallComponent.changeWall(dir);
            this.onWallChange(wall);
        };

        var cleanUp = function () {
            //viewWallComponent.leave();
            if (step4IsActive) {
                step4IsActive = false;
                //if (newStep !== 'step5')
                //    scene3D.dispose();
            }
        };

        var openProductDetails = function (item, mesh, sender, item2d) {
            if (!item) return;
            ngDialog.open({
                disableAnimation: true,
                template: '/views/productDetails.html',
                className: 'ngdialog-theme-default product-details-popup',
                data: {
                    item: item,
                    mesh: mesh,
                    sender: sender,
                    item2d: item2d
                },
                controller: 'ProductDetailsController'
            });
        };

        var stepChangeUnregister = $rootScope.$on('stepActive', function (events, step, wallView) {

            newStep = step;

            viewWallComponent.leave();

            if (step === 'step4') {

                //function checkCars() {
                //    var chdrn = scene3D.getChildren();
                //    for (var i = 0; i < chdrn.length; i++) {
                //        if (chdrn[i].userData.entity) {
                //            if (chdrn[i].userData.entity.type === "vehicle") {
                //                $scope.areCars = true;
                //                break;
                //            }
                //            else {
                //                $scope.areCars = false;
                //            }
                //        }
                //    }
                //}
         
                if (wallView) {
                    setTimeout(function () {
                        $scope.onWallChange('Wall 1');
                    }, 100);
                }

                if (step4IsActive)
                    return;

                step4IsActive = true;

                $scope.walls.length = 0;

                $scope.selectedWall = defaultOption;

                $scope.walls.push(defaultOption);

                for (var j = 0; j < roomStateManager.getPoints().length; j++)
                    $scope.walls.push('Wall ' + (j + 1));

                //$timeout(checkCars, 500);

            } else {
                $scope.flipHelpBtn = false;
                $scope.isInWallMode = false;
                cabinets = null;
                //cleanUp();
            }
        });

       // var routeChangeUnregister = $rootScope.$on("$routeChangeStart", cleanUp);

        var wallDbClickHandler = viewWallComponent.on('wallDoubleClick', function (wallName) {
            $scope.onWallChange(wallName);
            $scope.$applyAsync();
        });

        $scope.itemClick = function (entity) {
            addObjectComponent.setEntity(entity);
        };

        var selectUnreg = select3DComponent.on('select', function (objects) {
            if (objects.length <= 1)
                $rootScope.$broadcast('productSelect', objects[0]);
        });

        $scope.$on('$destroy', function () {
            stepChangeUnregister();
            //routeChangeUnregister();
            wallDbClickHandler();
            selectUnreg();
            engine3DSrvc.dispose();
        });

    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('step4', directive);

})();