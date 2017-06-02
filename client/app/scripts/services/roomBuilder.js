; (function () {
    'use strict';

    var dependencies = ['$q', 'modelLoader', 'constants', 'roomStateManager',
        'wall3DDataManager', 'objectMaterial', 'materialSelector', 'object3DSelectionBox', 'materialStuffService', 'wallCutHelper',
        'ScaleService', 'wallConnectionSrvc'];

    var service = function ($q, modelLoader, constants, roomStateManager, wall3DDataManager, objectMaterial, materialSelector,
        object3DSelectionBox, materialStuffService, wallCutHelper, ScaleService, wallConnectionSrvc) {

        var mahTexture = THREE.ImageUtils.loadTexture('/textures/Mah_Laq_Natural_STL.jpg');

        var buildFloor = function (shape) {

            var material = new THREE.MeshBasicMaterial(),
                geometry = new THREE.ShapeGeometry(shape),
                mesh = new THREE.Mesh(geometry, material);

            material.name = 'FLOOR';
            mesh.rotation.x = THREE.Math.degToRad(90);
            mesh.name = 'floor';

            mesh.userData.entity = {
                isFloor: true,
                category: "Floor"
            };

            mesh.uuid = 'floor';

            return mesh;
        };

        var positionWallObject = function (wall, object, offset) {

            var wallSize,
                associatedEntity = object.userData.entity,
                model = object.model,
                position = object.position,
                floorOffset,
                z;

            if (associatedEntity instanceof constants.RoomObject.Door) {
                if (!associatedEntity.isOpening) {
                    model.rotation.y = object.userData.flip.x ? Math.PI : object.rotation.z;
                    model.userData.flip = angular.copy(object.userData.flip);
                }
                else {
                    if (object.userData.width && associatedEntity) {
                        ScaleService.setDimensions(model.userData, object.userData, true);
                        ScaleService.scale(model, true);
                    }
                }
            }

            if (wall) {
                wallSize = wall3DDataManager.getSize(wall.name);
                //offset = new THREE.Vector3(wallSize.halfOfLength, wallSize.halfOfHeight, -wallSize.halfOfWidth);
                //position.add(offset);
                floorOffset = position.y;
                z = position.z;
                model.rotation.y = wall.rotation.y;
            }
            else {
                floorOffset = position.z;
                position.sub(offset);
                z = -position.y;
                model.rotation.y = object.rotation.z;
            }

            var p = new THREE.Vector3(position.x, floorOffset, z);

            if (wall) {
                wall.updateMatrixWorld();
                wall.localToWorld(p);
            }
            model.position.copy(p);

            if (wall) {
                model.userData.wall = wall.name;
            }
            model.userData.entity = associatedEntity;

            return model;
        };

        var positionRoomObject = function (object, offset) {
            var objectData = object.userData,
                model = object.model,
                floorOffset = object.position.z;

            model.userData = objectData;

            object.position.sub(offset);

            model.position.set(object.position.x, floorOffset, -object.position.y);
            model.rotation.y = object.rotation.z;
            return model;
        };

        var onModelLoaded = function (mesh2D, model) {

            model.uuid = mesh2D.uuid;
            model.userData.entity = mesh2D.userData.entity;

            if (mesh2D.userData.width && mesh2D.userData.entity) {
                ScaleService.setDimensions(model.userData, mesh2D.userData, true);
                ScaleService.scale(model, true);
            }

            return $q.resolve({
                model: model,
                rotation: mesh2D.rotation.clone(),
                userData: mesh2D.userData,
                position: mesh2D.position.clone()
            });
        };

        var loadAllModels = function (objects) {

            var promises = [],
                promise,
                meshData,
                mesh2D,
                entity,
                i = 0;

            for (; i < objects.length; i++) {
                mesh2D = objects[i];
                meshData = mesh2D.userData;
                entity = meshData.entity;
                promise = modelLoader.load(meshData, entity.nocache).
                    then(angular.bind(null, onModelLoaded, mesh2D));
                promises.push(promise);
            }

            return $q.all(promises);
        };

        var restoreObjectMaterial = function (object, colorScheme) {

            //set color scheme loaded from server

            if (colorScheme) {

                objectMaterial.setMaterial(object, colorScheme)
                    .then(function () {
                        roomStateManager.saveObjectMaterial(object);
                        roomStateManager.saveObjectColorScheme({
                            objectId: object.uuid,
                            entityId: object.userData.entity.id,
                            scheme: colorScheme
                        });
                    });

            }
            else {
                var material = roomStateManager.getObjectMaterial(object.uuid);
                if (material) {
                    object.material = material;
                } else {
                    //set default
                    var materials,
                        tempMaterials;
                    if (object.userData.entity.isWall) {
                        var savedMat = roomStateManager.getSavedWallMaterial();
                        if (savedMat) {
                            objectMaterial.setMaterial(object, savedMat)
                                .then(function () {
                                    roomStateManager.saveObjectMaterial(object);
                                    roomStateManager.saveObjectColorScheme({
                                        objectId: object.uuid,
                                        entityId: object.userData.entity.id,
                                        scheme: savedMat
                                    });
                                });
                        }
                        else {
                            var groups = materialStuffService.wallGroupNames;
                            materials = materialStuffService.getWallMaterialNamesByGroupName(groups[1]);
                        }
                    }
                    else if (object.userData.entity.isFloor) {
                        var savedMat = roomStateManager.getSavedFloorMaterial();
                        if (savedMat) {
                            objectMaterial.setMaterial(object, savedMat)
                                .then(function () {
                                    roomStateManager.saveObjectMaterial(object);
                                    roomStateManager.saveObjectColorScheme({
                                        objectId: object.uuid,
                                        entityId: object.userData.entity.id,
                                        scheme: savedMat
                                    });
                                });
                        }
                        else {
                            var groups = materialStuffService.floorGroupNames;
                            materials = materialStuffService.getFloorMaterialNamesByGroupName(groups[0]);
                        }
                    }
                    else {
                        materials = materialSelector.getMaterials(object.userData.entity);
                    }
                    if (materials) {
                        if (object.userData.entity.isWall) {       // REMOVE
                            objectMaterial.setMaterial(object, materials[3])
                                .then(function () {
                                    roomStateManager.saveObjectMaterial(object);
                                });
                        }
                        else {
                            objectMaterial.setMaterial(object, materials[0])
                                .then(function () {
                                    if (object.name === 'floor') {
                                        object.material.side = 2;
                                    }
                                    roomStateManager.saveObjectMaterial(object);
                                    roomStateManager.saveObjectColorScheme({
                                        objectId: object.uuid,
                                        entityId: object.userData.entity.id,
                                        scheme: materials[0]
                                    });
                                });
                        }
                    }
                }
            }
            if (object.userData.entity && object.userData.entity.vigilant) {
                var materials = object.material.materials;
                for (var i = 0; i < materials.length; i++) {
                    if (!materials[i].map) {
                        materials[i].map = mahTexture;
                        roomStateManager.saveObjectMaterial(object);
                    }
                }
            }
        };

        var addObjectsToRoom = function (walls, floor, objects, offset) {

            return loadAllModels(objects).then(function (models) {

                // REFACTOR
                // if (roomStateManager.getSavedWallMaterial()) {
                //     angular.forEach(walls, function (wll) {
                //         restoreObjectMaterial(wll, roomStateManager.getSavedWallMaterial());
                //     })
                // }

                var cuttedWalls = walls.slice(0),
                    roomObjects = [],
                    j = 0,
                    model,
                    wallName,
                    wall,
                    wallIndex;

                for (; j < models.length; j++) {
                    model = models[j];

                    if (model.userData.entity.base_model_name) {
                        model.userData.colorScheme = roomStateManager.getColorSchemeByEntityId(model.userData.entity.id);
                    }

                    var colorScheme = model.userData.colorScheme;

                    //need clear color scheme
                    model.userData.colorScheme = null;

                    if (model.userData.entity.wallInteraction === 'embeddable') {
                        wallName = model.userData.wall;
                        wallIndex = parseInt(wallName.split(' ')[1]) - 1;
                        model = positionWallObject(cuttedWalls[wallIndex], model, offset);
                        wall = wallCutHelper.cutHoleInWall(cuttedWalls[wallIndex], model);
                        roomObjects.push(model);
                    } else {
                        model = positionRoomObject(model, offset);
                        roomObjects.push(model);
                    }

                    var color = roomStateManager.getColorSchemeByObjectId(model.uuid);
                    color = color ? color.scheme : null;
                    restoreObjectMaterial(model, color || colorScheme);

                    if (wall) {
                        cuttedWalls[wallIndex] = wall;
                        restoreObjectMaterial(wall);
                    }
                }

                return {
                    originalWalls: walls,
                    cuttedWalls: cuttedWalls,
                    floor: floor,
                    roomObjects: roomObjects
                };
            });
        };

        return {
            buildRoom: function (roomData, objects) {

                var i = 0,
                    pointA,
                    pointB,
                    wallLen,
                    wallHeight,
                    wallWidth,
                    geometry,
                    wallMesh,
                    material,
                    wallMeshes = [],
                    floor = new THREE.Shape(),
                    floorMesh,
                    wallConnectionPoint,
                    prevWallMesh,
                    wallName,
                    count = roomData.length,
                    centerOfCoordinateOffset = new THREE.Vector3(roomData[0].x, roomData[0].y, 0);

                floor.moveTo(0, 0);

                for (; i < count; i++) {

                    wallName = 'Wall ' + (i + 1);

                    pointA = roomData[i];
                    pointB = roomData[(i + 1) % count];

                    pointA = new THREE.Vector3(pointA.x, pointA.y, 0);
                    pointB = new THREE.Vector3(pointB.x, pointB.y, 0);

                    wallLen = pointB.clone().sub(pointA).length();
                    wallHeight = constants.wallHeight;
                    wallWidth = roomData[i].depth;

                    //roomStateManager.trackWallLength(wallData.name, wallLen);

                    geometry = new THREE.BoxGeometry(wallLen, wallHeight, wallWidth);
                    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(wallLen / 2, wallHeight / 2, -wallWidth / 2));

                    //geometry.faces[4].color.setHex(0x000000);
                    //geometry.faces[5].color.setHex(0x000000);
                    //geometry.colorsNeedUpdate = true;

                    material = new THREE.MeshBasicMaterial();

                    material.name = 'WALL';

                    wallMesh = new THREE.Mesh(geometry, material);

                    wallMesh.name = wallName;
                    wallMesh.uuid = wallName;
                    wallMesh.userData.entity = {
                        length: wallLen,
                        height: wallHeight,
                        width: wallWidth,
                        isWall: true,
                        category: "Wall"
                    };

                    if (i !== 0) {
                        prevWallMesh = wallMeshes[i - 1];

                        wallConnectionPoint = prevWallMesh.geometry.vertices[2].clone();
                        prevWallMesh.updateMatrixWorld();
                        wallConnectionPoint.applyMatrix4(prevWallMesh.matrixWorld);

                        wallMesh.position.set(wallConnectionPoint.x, 0, wallConnectionPoint.z);
                        floor.lineTo(wallConnectionPoint.x, wallConnectionPoint.z);
                    }

                    wallMesh.rotation.y = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);

                    wall3DDataManager.add(wallMesh, wallLen, wallHeight, wallWidth);

                    var groups = materialStuffService.wallMaterials;
                    roomStateManager.saveObjectColorScheme({
                        objectId: wallMesh.uuid,
                        scheme: materialStuffService.wallGroupNames[0],
                        updateIfExist: false
                    });

                    restoreObjectMaterial(wallMesh);

                    wallMeshes.push(wallMesh);

                    object3DSelectionBox.addSelectionBoxToMesh(wallMesh);
                }

                wallConnectionSrvc.connectAllWalls3D(wallMeshes);

                floorMesh = buildFloor(floor);

                object3DSelectionBox.addSelectionBoxToMesh(floorMesh);

                roomStateManager.saveObjectColorScheme({
                    objectId: floorMesh.uuid,
                    scheme: materialStuffService.floorGroupNames[0],
                    updateIfExist: false
                });

                // if (roomStateManager.getSavedFloorMaterial() !== undefined) {
                //     restoreObjectMaterial(floorMesh, roomStateManager.getSavedFloorMaterial());
                // }
                // else {
                restoreObjectMaterial(floorMesh);
                // }

                return addObjectsToRoom(wallMeshes, floorMesh, objects, centerOfCoordinateOffset);
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('roomBuilder', service);

})();
