; (function () {

    'use strict'

    var directive = function () {
        return {
            templateUrl: 'views/steps/step3.html',
            restrict: 'E',
            scope: {},
            controller: controller
        };
    };

    var dependencies = ['$rootScope', '$scope', 'roomStuff', 'Scene2d', 'roomStuffFactory',
        'step3Helper', 'constants', 'roomStateManager', 'engine', 'productDetailDialogSrvc'];

    var controller = function ($rootScope, $scope, roomStuff, Scene2d, roomStuffFactory, step3Helper,
        constants, roomStateManager, engine, productDetailDialogSrvc) {

        var step3IsActive = false;

        var selection2d = engine.get().findComponentByType(Selection2D);

        $scope.cabinets = [];

        $scope.abilities = constants.ItemOption;

        $scope.draggedEntity = null;
        $scope.selectedMesh = null;

        $scope.optionIsVisible = function (optionAbilities) {
            if (this.selectedMesh) {
                var meshAbilities = this.selectedMesh.userData.entity.abilities;
                if (meshAbilities) {
                    return meshAbilities.some(function (item) {
                        return optionAbilities.indexOf(item) !== -1;
                    });
                }
            }
            return false;
        };

        $scope.doorMenuItemClick = function (index) {

            var flip = $scope.selectedMesh.userData.flip,
                door,
                wall = $scope.selectedMesh.parent;

            if (index === 0)
                flip.x = !flip.x;
            else
                flip.y = !flip.y;

            door = roomStuffFactory.buildRoomItem($scope.selectedMesh.userData.entity, flip);

            door.position.copy($scope.selectedMesh.position);
            door.rotation.copy($scope.selectedMesh.rotation);
            door.userData.flip = flip;

            door.userData.wall = wall.userData.name;

            $scope.selectedMesh.userData.flip = null;
            wall.remove($scope.selectedMesh);

            wall.add(door);

            $scope.selectedMesh = door;

            selection2d.setSelected(door);

            Scene2d.render();
        };

        $scope.flipBtnClick = function () {
            var flip = !$scope.selectedMesh.userData.flip,
                stairs = roomStuffFactory.buildRoomItem($scope.selectedMesh.userData.entity, flip);

            stairs.position.copy($scope.selectedMesh.position);
            stairs.rotation.copy($scope.selectedMesh.rotation);
            Scene2d.addModel(stairs);

            Scene2d.remove($scope.selectedMesh);

            $scope.selectedMesh = stairs;

            selection2d.setSelected(stairs);

            Scene2d.render();
        };

        $scope.rotationAngle = 0;

        $scope.$watch('rotationAngle', function (val) {
            if ($scope.selectedMesh) {
                $scope.selectedMesh.rotation.z = THREE.Math.degToRad(val);
                Scene2d.render();
            }
        });

        $scope.productClick = function (entity) {
            selection2d.setActiveEntity(entity);
        };

        var cleanUp = function () {
            if (step3IsActive) {
                step3IsActive = false;
            }
        };

        var activeStepChangeUnregister = $rootScope.$on('stepActive', function (events, step) {

            var points = roomStateManager.getPoints();

            if (step === 'step3' && points.length !== 0) {

                if (step3IsActive)
                    return;

                step3IsActive = true;

                $scope.showSideMenu = false;

            } else
                cleanUp();
        });

        var routeChangeUnregister = $rootScope.$on("$routeChangeStart", cleanUp);

        $scope.itemClick = function (entity) {
            selection2d.setActiveEntity(entity);
        };

        var selectedObjectUnreg = selection2d.on('objectSelect', function (item) {
            $scope.selectedMesh = item;
            var entity = item ? item.userData.entity : null;
            if (entity && entity.color_scheme) {
                roomStateManager.saveObjectColorScheme({
                    objectId: item.uuid,
                    entityId: entity.id,
                    scheme: entity.color_scheme[0],
                    updateIfExist: false
                });
            }
            $scope.showSideMenu = entity || false;
            $scope.rotationAngle = item ? THREE.Math.radToDeg(item.rotation.z) : 0;
            $scope.$applyAsync();
        });

        var dblClickedOdjectUnreg = selection2d.on('objectDoubleClick', function (item) {
            //productDetailDialogSrvc.show(item.userData.entity, item, '2d');
            $rootScope.$broadcast('productSelect', item);
        });

        $scope.$on('$destroy', function () {
            //engine2DSrvc.dispose();
            activeStepChangeUnregister();
            routeChangeUnregister();
            selectedObjectUnreg();
            dblClickedOdjectUnreg();
        });
    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('step3', directive);
})();
