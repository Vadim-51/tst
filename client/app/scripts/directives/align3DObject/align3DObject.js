; (function () {
    'use strict';

    var directive = function () {
        return {
            restrict: 'E',
            templateUrl: '/views/align3DObject.html',
            replace: true,
            scope: {
                wall: '='
            },
            controller: controller
        }
    };

    var dependencies = ['$scope', 'engine3DSrvc', 'constants',
        'wall3DDataManager', 'scene3D', 'collisionSrvc', 'scene2DSyncSrvc'];

    var controller = function ($scope, engine3DSrvc, constants,
        wall3DDataManager, scene3D, collisionSrvc, scene2DSyncSrvc) {

        //var select3DComponent = engine3DSrvc.getEngine().findComponentByType(Select3D);

        var canAlign = function (selection) {

            var isOneSelected = selection.length === 1;

            if (!isOneSelected)
                return false;

            var entity = selection[0].userData.entity;
            var isValidObjectType = !entity.isWall && !entity.isFloor;

            if (!isValidObjectType)
                return false;

            return true;
        };

        var getAlignPoint = function (objectLeftEdgePoint, wallLefToRightCornerDirection, wallLeftEdgePoint, wallRightEdgePoint) {

            var lastIntersectionPoint = null,
                step = 10,
                segmentsCount = Math.floor(wallLeftEdgePoint.distanceTo(wallRightEdgePoint) / step),
                i = 1,
                size,
                offset,
                alignPoint,
                ray = new THREE.Ray(),
                intersectionPoint,
                plane = new THREE.Plane();

            ray.set(objectLeftEdgePoint, wallLefToRightCornerDirection.clone().negate());

            for (; i < segmentsCount - 1; i++) {

                size = i * step;
                offset = wallLefToRightCornerDirection.clone().multiplyScalar(size);
                alignPoint = wallLeftEdgePoint.clone().add(offset);

                plane.setFromNormalAndCoplanarPoint(wallLefToRightCornerDirection, alignPoint);

                intersectionPoint = ray.intersectPlane(plane);

                // if (intersectionPoint && intersectionPoint.distanceTo(objectLeftEdgePoint) !== 0) {
                if (intersectionPoint) {

                    lastIntersectionPoint = intersectionPoint;
                }
                else {
                    return lastIntersectionPoint;
                }

            }

            return null;
        };

        var canPlaceObject = function (selectedObj, newPosition) {

            var sceneObjects = scene3D.getChildren().filter(function (obj) {
                return obj.visible &&
                    obj instanceof THREE.Mesh &&
                    obj.name !== 'floor' &&
                    selectedObj !== obj
            });

            if (!collisionSrvc.isCollide(selectedObj, sceneObjects, {
                draggedObjectPosition: newPosition,
                upAxis: 'y'
            })) {
                return true;
            }

            return false;
        };

        $scope.align = function () {

            var selectedObj = select3DComponent.selectedObjects[0],
                wallName = $scope.wall,
                points = wall3DDataManager.getPoints(wallName),
                wallRightEdgePoint = points.right.clone(),
                wallLeftEdgePoint = points.left.clone(),
                wallDirection = wall3DDataManager.getDirection(wallName),
                wallLefToRightCornerDirection = wallDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(90)),
                selectedObjBoundingBox = new THREE.Box3().setFromObject(selectedObj),
                size = selectedObjBoundingBox.size(),
                edgePointOffset = wallLefToRightCornerDirection.clone().negate().multiplyScalar(size.x / 2),
                objectLeftEdgePoint = selectedObj.position.clone().add(edgePointOffset),
                alignPoint = getAlignPoint(objectLeftEdgePoint, wallLefToRightCornerDirection, wallLeftEdgePoint, wallRightEdgePoint);
                              
            if (alignPoint) {
                var moveDistance = objectLeftEdgePoint.distanceTo(alignPoint),
                    newPosition =
                    selectedObj.position.clone().add(wallLefToRightCornerDirection.clone().negate().multiplyScalar(moveDistance));

                if (canPlaceObject(selectedObj, newPosition)) {
                    selectedObj.position.copy(newPosition);
                    scene2DSyncSrvc.moveObject(selectedObj);
                }
            }
        };

        //var unsubscribe = select3DComponent.on('select', function (selection) {
        //    $scope.isVisible = $scope.wall && canAlign(selection);
        //    $scope.$applyAsync();
        //});

        //var wallChangeUnsubscribe = $scope.$watch('wall', function (newValue) {
        //    $scope.isVisible = newValue && canAlign(select3DComponent.selectedObjects);
        //});

        $scope.$on('$destroy', function () {
            //unsubscribe();
            //wallChangeUnsubscribe();
        });

    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('alignObjectButton', directive);

})();
