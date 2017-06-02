; (function () {
    'use strict';

    var dependencies = ['objectCheckerSrvc', 'collisionSrvc', 'objectGapHelperSrvc',
        'constants', 'stage', 'wallCutHelper'];

    var service = function (objectCheckerSrvc, collisionSrvc,
        objectGapHelperSrvc, constants, stage, wallCutHelper) {

        var getObjectPosition = function (selectedObj) {
            if (objectCheckerSrvc.isWallMountable(selectedObj))
                return getWallMountableObjectPosition(selectedObj);
            else if (objectCheckerSrvc.isWallEmbeddable(selectedObj))
                return getWallEmbeddableObjectPosition(selectedObj);
            else
                return getFloorObjectPosition(selectedObj);
        };

        var getStaticObjects = function (currentObj) {
            var floor = stage.getFloor();
            return stage.getChildren().filter(function (obj) {
                return obj.visible &&
                    obj.userData.entity &&
                    //obj instanceof THREE.Mesh &&
                    obj !== floor &&
                    currentObj.parent !== obj
            });
        };

        var getFloorObjectPosition = function (originalObj) {

            originalObj.updateMatrixWorld();

            var bb = new THREE.Box3().setFromObject(originalObj),
                size = bb.size(),
                sceneObjects = getStaticObjects(originalObj),
                entity = originalObj.userData.entity,
                gap = objectGapHelperSrvc.getGapBetweenTwoObjects(entity, entity),
                originalPosition = originalObj.parent.position, //container position
                i = 0,
                positionToTest,
                newPosition,
                positions = [
                    new THREE.Vector3(size.x + gap, 0, 0),
                    new THREE.Vector3(-size.x - gap, 0, 0),
                    new THREE.Vector3(0, 0, size.z + gap),
                    new THREE.Vector3(0, 0, -size.z - gap)
                ];

            for (; i < positions.length; i++) {
                positionToTest = positions[i];
                newPosition = originalPosition.clone().add(positionToTest);
                if (!collisionSrvc.isCollide(originalObj, sceneObjects, {
                    draggedObjectPosition: newPosition
                })) {
                    return newPosition;
                }
            }

            return null;
        };

        var getWallMountableObjectPosition = function (originalObj) {

            originalObj.updateMatrixWorld();

            var entity = originalObj.userData.entity,
                gap = objectGapHelperSrvc.getGapBetweenTwoObjects(entity, entity),
                sceneObjects = getStaticObjects(originalObj),
                originalPosition = originalObj.parent.position,
                i = 0,
                isAboveRoof,
                newPosition,
                positions = [
                    new THREE.Vector3(entity.length + gap, 0, 0),
                    new THREE.Vector3(-entity.length - gap, 0, 0),
                    new THREE.Vector3(0, entity.height + gap, 0),
                    new THREE.Vector3(0, -entity.height - gap, 0)
                ];

            for (; i < positions.length; i++) {
                newPosition = positions[i].applyMatrix4(originalObj.matrixWorld);
                isAboveRoof = newPosition.y + entity.height / 2 > constants.wallHeight;
                if (isAboveRoof)
                    continue;
                if (!collisionSrvc.isCollide(originalObj, sceneObjects, {
                    draggedObjectPosition: newPosition
                })) {
                    return newPosition;
                }
            }

            return null;
        };

        var getWallEmbeddableObjectPosition = function (originalObj) {

            originalObj.updateMatrixWorld();

            var entity = originalObj.userData.entity,
                wallName = originalObj.parent.userData.wall,
                gap = objectGapHelperSrvc.getGapBetweenTwoObjects(entity, entity),
                sceneObjectsWithoutThisWall = getStaticObjects(originalObj).filter(function (obj) {
                    return obj.name !== wallName;
                }),
                originalPosition = originalObj.parent.position,
                i = 0,
                isAboveRoof,
                newPosition,
                positions = [
                    new THREE.Vector3(entity.length + gap, 0, 0),
                    new THREE.Vector3(-entity.length - gap, 0, 0),
                    new THREE.Vector3(0, entity.height + gap, 0),
                    new THREE.Vector3(0, -entity.height - gap, 0)
                ];

            for (; i < positions.length; i++) {
                newPosition = positions[i].applyMatrix4(originalObj.matrixWorld);
                isAboveRoof = newPosition.y + entity.height / 2 > constants.wallHeight;
                if (isAboveRoof)
                    continue;
                if (!collisionSrvc.isCollide(originalObj, sceneObjectsWithoutThisWall, {
                    draggedObjectPosition: newPosition
                })) {
                    return newPosition;
                }
            }
            return null;
        };

        return {
            clone: function (selectedObj) {

                var position = getObjectPosition(selectedObj);

                if (position) {

                    var newObj = selectedObj.clone(),
                        entity = selectedObj.userData.entity;

                    newObj.material = selectedObj.material.clone();
                    //newObj.position.copy(position);
                    newObj.getObjectByName('selection').visible = false;
                    //newObj.userData.entity = entity;
                    newObj.userData.wall = selectedObj.parent.userData.wall;

                    return {
                        mesh: newObj,
                        position: position,
                        rotation: selectedObj.parent.rotation.clone()
                    };
                }

                return null;
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('object3DCloneSrvc', service);

})();
