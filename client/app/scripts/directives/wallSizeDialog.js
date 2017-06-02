; (function () {
    'use strict';

    var dependencies = ['$rootScope', 'engine', 'stage', 'constants',
        'roomStateManager', '$timeout', 'roomSizeManager', 'sizeHelper',
        'room2DBuilder', 'wallConnectionSrvc', 'sceneUtils', 'appSettings'];

    var directive = function ($rootScope, engine, stage, constants,
        roomStateManager, $timeout, roomSizeManager, sizeHelper, room2DBuilder,
        wallConnectionSrvc, sceneUtils, appSettings) {

        return {
            restrict: 'E',
            templateUrl: '/views/wallSizeDialog.html',
            replace: true,
            scope: {},
            link: function (scope, dialog) {

                var wallHighlight = engine.get().findComponentByType(WallHighlight);
                var moveWall = engine.get().findComponentByType(MoveWall);
                var zoomCamera = engine.get().findComponentByType(ZoomCamera);

                var lengthInput = $(dialog).find('input').first();
                var positionSelectedWall = new THREE.Vector3();
                var formName = $(dialog).attr('name');

                var goToNextWall = function () {
                    var selectedWall = wallHighlight.getWall();
                    if (selectedWall) {
                        var currentWallIndex = selectedWall.userData.index;
                        var nextWallIndex = roomStateManager.getNextPointIndex(currentWallIndex);
                        var nextWall = stage.getWallByIndex(nextWallIndex + 1);
                        wallHighlight.deselect(selectedWall);
                        wallHighlight.select(nextWall);
                        $rootScope.$broadcast('updateWallSizeDialog', nextWall.name);
                    }
                };

                scope.applyNewLength = function (e) {
                    if (e.which === 13 && scope[formName].$valid) { // press key Enter
                        var activeWall = wallHighlight.getWall();
                        var newLength = sizeHelper.toCM(scope.selectedWallLength, appSettings.getSizeUnits());
                        moveWall.setWallLength(newLength, activeWall);
                        zoomCamera.fitRoom();
                        //Scene2d.render();
                    }
                };

                //scope.applyNewWidth = function (e) {
                //    if (e.which === 13 && scope[formName].$valid) { // press key Enter

                //        var wall = wallHighlight.getWall(),
                //            newWidth = sizeHelper.toCM(scope.selectedWallWidth, roomSizeManager.getCurrentUnits()),
                //            points = roomStateManager.getPoints(),
                //            currentWallIndex = wall.userData.index,
                //            nextPointIndex = roomStateManager.getNextPointIndex(currentWallIndex),
                //            prevPointIndex = roomStateManager.getPrevPointIndex(currentWallIndex);

                //        room2DBuilder.updateWallWidth(wall, newWidth);

                //        wallConnectionSrvc.connectTwoWalls2D(stage.getWallByIndex(prevPointIndex + 1), wall);
                //        wallConnectionSrvc.connectTwoWalls2D(wall, stage.getWallByIndex(nextPointIndex + 1));

                //        roomStateManager.updatePoint(currentWallIndex, points[currentWallIndex], newWidth);

                //        roomSizeManager.updateWallSizes(wall);

                //        zoomCamera.fitRoom();
                //        //Scene2d.render();

                //        goToNextWall();
                //    }
                //};

                scope.pressTab = function (e) {
                    if (e.which === 9) {
                        e.preventDefault();
                        goToNextWall();
                    }
                };

                var inputUpdateUnsubscribe = $rootScope.$on('updateWallSizeDialog', function (event, wallName) {

                    var selectedWall = wallName ? stage.getObjectByName(wallName) : wallHighlight.getSelectedWall();

                    if (selectedWall) {

                        var BoundingClientRect = stage.getCanvas().getBoundingClientRect();

                        scope.selectedWallLength = roomSizeManager.getWallInnerLength(selectedWall);
                        scope.selectedWallWidth = roomSizeManager.getWallWidth(selectedWall);

                        positionSelectedWall.set(selectedWall.geometry.vertices[2].x / 2, 0, 0);
                        selectedWall.updateMatrixWorld();
                        selectedWall.localToWorld(positionSelectedWall);

                        sceneUtils.worldToScreen(positionSelectedWall);

                        var left = (positionSelectedWall.x + BoundingClientRect.left) - dialog.width() / 2;
                        var top = (positionSelectedWall.y + BoundingClientRect.top) - dialog.height() / 2;

                        dialog.css({
                            display: 'block',
                            left: left + 'px',
                            top: top + 'px'
                        });

                        lengthInput.focus();
                        $timeout(function () {
                            lengthInput.select();
                        }, 0);
                    }
                    else {
                        dialog.css({
                            display: 'none'
                        });
                    }
                });

                scope.$on('$destroy', function () {
                    inputUpdateUnsubscribe();
                });
            }
        }
    };

    directive.$inject = dependencies;

    angular.module('vigilantApp').directive('wallSizeDialog', directive);

})();
