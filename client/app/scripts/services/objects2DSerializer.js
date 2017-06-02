; (function () {
    'use strict';

    var dependencies = ['roomStuff', 'roomStuffFactory', 'objectCheckerSrvc',
        'roomStateManager', 'constants', 'Scene2d'];

    var service = function (roomStuff, roomStuffFactory, objectCheckerSrvc,
        roomStateManager, constants, Scene2d) {

        var scaleObject = function (mesh) {
            mesh.scale.set(mesh.userData.length / mesh.userData.entity.length,
                mesh.userData.width / mesh.userData.entity.width,
                mesh.userData.height / mesh.userData.entity.height);
        };

        return {
            serialize: function (objects) {
                var i = 0,
                    roomObject,
                    meshData,
                    entity,
                    objectToSave,
                    color,
                    result = [];

                for (; i < objects.length; i++) {
                    roomObject = objects[i];
                    meshData = roomObject.userData;
                    entity = meshData.entity;
                    color = roomStateManager.getColorSchemeByObjectId(roomObject.uuid);
                    objectToSave = {
                        id: entity.id,
                        position: roomObject.position.clone(),
                        rotation: roomObject.rotation.clone(),
                        wall: meshData.wall,
                        groupId: meshData.groupId,
                        isGeneric: entity.isGeneric,
                        colorScheme: color ? color.scheme : ''
                    };

                    if (entity instanceof constants.RoomObject.Door) {
                        objectToSave.extra = angular.copy(meshData.flip);
                    } else if (entity instanceof constants.RoomObject.Cabinet) {
                        objectToSave.extra = angular.copy(meshData.flip);
                    }

                    if (entity.isGeneric) {
                        objectToSave.width = meshData.width;
                        objectToSave.height = meshData.height;
                        objectToSave.length = meshData.length;
                    }

                    result.push(objectToSave);
                }

                return result;
            },
            deserialize: function (objects) {
                var i = 0,
                  obj,
                  entity,
                  mesh,
                  wall,
                  result = [];

                for (; i < objects.length; i++) {
                    obj = objects[i];
                    entity = roomStuff.getById(obj.id);

                    if (!entity) {
                        console.error('error load room item , entity not found ', obj);
                        continue;
                    }

                    mesh = roomStuffFactory.buildRoomItem(entity, obj.extra);
                    mesh.position.copy(obj.position);
                    mesh.rotation.copy(obj.rotation);

                    if (obj.groupId) {
                        mesh.userData.groupId = obj.groupId;
                    }
                    if (obj.width) {
                        mesh.userData.width = obj.width;
                        mesh.userData.height = obj.height;
                        mesh.userData.length = obj.length;
                        scaleObject(mesh);
                    }

                    if (objectCheckerSrvc.isWallEmbeddable(mesh)) {
                        wall = Scene2d.getObjectByName(obj.wall);
                        mesh.userData.wall = obj.wall;
                        wall.add(mesh);
                    } else {
                        Scene2d.addModel(mesh);
                        //result.push(mesh);
                    }

                    if (entity.base_model_name) {
                        roomStateManager.saveObjectColorScheme({
                            entityId: mesh.userData.entity.id,
                            objectId: mesh.uuid,
                            scheme: obj.colorScheme
                        });
                    }

                    //assign color scheme to apply it when build 3d room
                    mesh.userData.colorScheme = obj.colorScheme;
                }

                //return result;
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('objects2DSerializer', service);

})();
