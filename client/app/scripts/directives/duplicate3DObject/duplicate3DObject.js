; (function () {
    'use strict';

    var directive = function () {
        return {
            restrict: 'E',
            templateUrl: '/views/duplicate3DObject.html',
            replace: true,
            scope: {},
            controller: controller
        }
    };

    var dependencies = ['$scope', 'engine3DSrvc', 'constants', 'scene3D', 
        'collisionSrvc', 'objectGapHelperSrvc', 'scene2DSyncSrvc', 'roomStateManager'];

    var controller = function ($scope, engine3DSrvc, constants, scene3D, 
        collisionSrvc, objectGapHelperSrvc, scene2DSyncSrvc, roomStateManager) {

        //var select3DComponent = engine3DSrvc.getEngine().findComponentByType(Select3D);

        //var cloneMaterial = function (material) {
        //    var cloned = [],
        //        i = 0,
        //        materials = material.materials;

        //    for (; i < materials.length; i++) 
        //        cloned.push(materials[i].clone());

        //    return new THREE.MeshFaceMaterial(cloned);
        //};

        var canDuplicateObject = function (selection) {

            var onlyOneSelected = selection.length === 1;

            if (!onlyOneSelected)
                return false;

            var entity = selection[0].userData.entity;
            var isValidObjectType = !entity.isWall &&
                                    !entity.isFloor &&
                                    !(entity instanceof constants.RoomObject.Window) &&
                                    !(entity instanceof constants.RoomObject.Door);

            if (!isValidObjectType)
                return false;

            return true;
        };

        var getFloorObjectPosition = function (originalObj) {

            originalObj.updateMatrixWorld();

            if (!originalObj.geometry.boundingBox)
                originalObj.geometry.computeBoundingBox();

            var bb = originalObj.geometry.boundingBox.clone();
            bb.applyMatrix4(originalObj.matrixWorld);

            var size = bb.size();

            var floor = scene3D.getObject('floor');
            var sceneObjects = scene3D.getChildren().filter(function (obj) {
                return obj.visible &&
                    obj instanceof THREE.Mesh &&
                    obj !== floor &&
                    originalObj !== obj
            });

            var entity = originalObj.userData.entity;
            var gap = objectGapHelperSrvc.getGapBetweenTwoObjects(entity, entity);

            var positions = [
                new THREE.Vector3(size.x + gap, 0, 0),
                new THREE.Vector3(-size.x - gap, 0, 0),
                new THREE.Vector3(0, 0, size.z + gap),
                new THREE.Vector3(0, 0, -size.z - gap)
            ];

            var originalPosition = originalObj.position,
                 i = 0,
                 positionToTest,
                 newPosition;

            for (; i < positions.length; i++) {
                positionToTest = positions[i];
                newPosition = originalPosition.clone().add(positionToTest);
                if (!collisionSrvc.isCollide(originalObj, sceneObjects, {
                    draggedObjectPosition: newPosition,
                    upAxis : 'y'
                })) {
                    return newPosition;
                }
            }

            return null;
        };

        var getWallObjectPosition = function (originalObj) {

            originalObj.updateMatrixWorld();

            var entity = originalObj.userData.entity;

            var gap = objectGapHelperSrvc.getGapBetweenTwoObjects(entity, entity);

            var floor = scene3D.getObject('floor');
            var sceneObjects = scene3D.getChildren().filter(function (obj) {
                return obj.visible &&
                    obj instanceof THREE.Mesh &&
                    obj !== floor &&
                    originalObj !== obj
            });

            var positions = [
               new THREE.Vector3(entity.length + gap, 0, 0),
               new THREE.Vector3(-entity.length - gap, 0, 0),
               new THREE.Vector3(0, entity.height + gap, 0),
               new THREE.Vector3(0, -entity.height - gap, 0)
            ];

            var originalPosition = originalObj.position,
                 i = 0,
                 isAboveRoof,
                 newPosition;

            for (; i < positions.length; i++) {
                newPosition = positions[i].applyMatrix4(originalObj.matrixWorld);
                isAboveRoof = newPosition.y + entity.height / 2 > constants.wallHeight;
                if (isAboveRoof)
                    continue;
                if (!collisionSrvc.isCollide(originalObj, sceneObjects, {
                    draggedObjectPosition: newPosition,
                    upAxis: 'y'
                })) {
                    return newPosition;
                }
            }

            return null;
        };

        var getObjectPosition = function (selectedObj) {
            var entity = selectedObj.userData.entity;
            if(entity instanceof constants.RoomObject.WallPanel || 
                (entity instanceof constants.RoomObject.Cabinet && entity.type === constants.CabinetType.WALL)) {
                return getWallObjectPosition(selectedObj);
            }
            else {
                return getFloorObjectPosition(selectedObj);
            }
        };

        $scope.isVisible = false;

        $scope.duplicate = function () {

            var selectedObj = select3DComponent.selectedObjects[0],
                position = getObjectPosition(selectedObj);
            
            if (position) {
                var newObj = selectedObj.clone(),
                    entity = selectedObj.userData.entity;

                newObj.material = selectedObj.material.clone();
                newObj.position.copy(position);
                newObj.getObjectByName('selection').visible = false;

                newObj.userData.entity = entity;

                var cs = roomStateManager.getColorSchemeByObjectId(selectedObj.uuid);
                roomStateManager.saveObjectColorScheme({
                    entityId: entity.id,
                    objectId: newObj.uuid,
                    scheme: cs.scheme
                });

                scene3D.add(newObj);

                scene2DSyncSrvc.addObject(newObj);
            }
        };

        //var unsubscribe = select3DComponent.on('select', function (selection) {
        //    $scope.isVisible = canDuplicateObject(selection);
        //    $scope.$applyAsync();
        //});

        $scope.$on('$destroy', function () {
          //  unsubscribe();
        });

    };

    controller.$inject = dependencies;

    angular.module('vigilantApp').directive('duplicateObject', directive);

})();
