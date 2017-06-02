; (function () {
    'use strict';

    var dependencies = ['scene2DSyncSrvc', 'constants', 'scene3D'];

    var service = function (scene2DSyncSrvc, constants, scene3D) {

        var undoStack = [];

        var sync2DObject = function (selected) {
            if (selected.userData.wall) {
                scene2DSyncSrvc.moveWallObject(selected, selected.userData.wall);
            }
            else {
                scene2DSyncSrvc.moveObject(selected);
            }
        };

        return {
            push: function () {
                if (undoStack.length >= constants.UNDO_STACK_LIMIT) {
                    undoStack.pop();
                }
                var allSceneObjects = scene3D.getChildren(),
                    lastPosition = new THREE.Vector3();

                undoStack.unshift(allSceneObjects
                    .filter(function (obj) {
                        return obj.visible && obj instanceof THREE.Mesh
                            && !obj.userData.entity.isFloor
                            && !obj.userData.entity.isWall
                    })
                    .map(function (obj) {
                        lastPosition.copy(obj.position);
                        return {
                            uuid: obj.uuid,
                            position: new THREE.Vector3().copy(obj.position)
                        }
                    }));
            },
            pop: function () {
                var allSceneObjects = scene3D.getChildren().filter(function (obj) {
                    return obj.visible && obj instanceof THREE.Mesh
                        && !obj.userData.entity.isFloor
                        && !obj.userData.entity.isWall
                });
                for (var i = 0; i < allSceneObjects.length; i++) {
                    if (undoStack.length) {
                        for (var j = 0; j < undoStack[0].length; j++) {
                            if (allSceneObjects[i].uuid === undoStack[0][j].uuid) {
                                allSceneObjects[i].position.copy(undoStack[0][j].position);
                                sync2DObject(allSceneObjects[i]);
                                break;
                            }
                        }
                    }
                    else return false;
                }
                undoStack.shift();
                return true;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('object3DPositionHistory', service);

})();
