; (function () {
    'use strict';

    var dependencies = ['Scene2d', 'roomStuffFactory', 'ScaleService',
        'roomStateManager', 'modelLoader', 'scene3D', 'objectCheckerSrvc',
        'wallCutHelper', 'objectMaterial'];

    var service = function (Scene2d, roomStuffFactory, ScaleService,
        roomStateManager, modelLoader, scene3D, objectCheckerSrvc,
        wallCutHelper, objectMaterial) {

        var convertPosition3DTo2D = function (pos3D) {
            var firstPoint = roomStateManager.getPoint(0),
                offset = new THREE.Vector3(firstPoint.x, 0, -firstPoint.y),
                position = pos3D.clone();

            position.add(offset);

            return new THREE.Vector3(position.x, -position.z, position.y);
        };

        var updateWall = function (obj) {
            var wallName = obj.userData.wall,
                nonCuttedWall = scene3D.getNonCuttedWallByName(wallName),
                oldWall = scene3D.getObject(wallName),
                wallObjects = scene3D.getWallChildren(wallName),
                newWall = wallCutHelper.cutHolesInWall(nonCuttedWall, wallObjects, []);

            if (oldWall.children.length !== 0)
                newWall.add.apply(newWall, oldWall.children);

            scene3D.replace(oldWall, newWall);
        };

        var createObj2D = function (obj3D) {
            var entity = obj3D.userData.entity,
                mesh2D = roomStuffFactory.buildRoomItem(entity),
                pos = convertPosition3DTo2D(obj3D.position);

            mesh2D.position.copy(pos);
            mesh2D.rotation.z = obj3D.rotation.y;
            mesh2D.uuid = obj3D.uuid;
            return mesh2D;
        };

        var setDefaultMaterial = function (obj3D) {
            var entity = obj3D.userData.entity;
            var mahTexture = THREE.ImageUtils.loadTexture('/textures/Mah_Laq_Natural_STL.jpg');
            var colorScheme = entity.color_scheme ? roomStateManager.getLastColorScheme() : null;
            if(colorScheme) {
                objectMaterial.setMaterial(obj3D, colorScheme)
                .then(function () {
                    if (colorScheme.length === 2) {
                        obj3D.userData.entity.img = '../images/ProductImage/' + obj3D.userData.entity.base_model_name
                            + colorScheme + '.png';
                    }
                    roomStateManager.saveObjectMaterial(obj3D);
                    roomStateManager.saveObjectColorScheme({
                        objectId: obj3D.uuid,
                        entityId: obj3D.userData.entity.id,
                        scheme: colorScheme
                    });
                });
                // objectMaterial.setMaterial(obj3D, colorScheme)
                //     .then(function () {
                //         roomStateManager.saveObjectMaterial(obj3D);
                //         roomStateManager.saveObjectColorScheme({
                //             objectId: obj3D.uuid,
                //             entityId: entity.id,
                //             scheme: colorScheme
                //         });
                //     });
            }
        };

        return {

            addObject: function (obj3D) {
                var mesh2D = createObj2D(obj3D);
                Scene2d.addModel(mesh2D);
            },

            addWallEmbeddableObject: function (obj3D) {
                var entity = obj3D.userData.entity,
                    mesh2D = roomStuffFactory.buildRoomItem(entity),
                    pos = convertPosition3DTo2D(obj3D.position);

                mesh2D.rotation.z = obj3D.rotation.y;
                mesh2D.uuid = obj3D.uuid;

                var wallForModel = Scene2d.getObjectByName(obj3D.userData.wall);

                wallForModel.add(mesh2D);
                wallForModel.worldToLocal(pos);

                mesh2D.position.copy(pos);

                mesh2D.rotation.set(THREE.Math.degToRad(-90), 0, 0);
            },

            moveObject: function (obj3D) {

                var pos = convertPosition3DTo2D(obj3D.position);

                var obj2D = Scene2d.getObjectByUUID(obj3D.uuid);

                obj2D.position.copy(pos);
            },

            moveWallObject: function (obj3D, wallName) {

                var pos = convertPosition3DTo2D(obj3D.position);

                var wall2D = Scene2d.getObjectByName(wallName);

                var obj2D = Scene2d.getObjectByUUID(obj3D.uuid);

                wall2D.worldToLocal(pos);

                obj2D.position.copy(pos);
            },

            scaleObject: function (uuid) {
                var obj2D = Scene2d.getObjectByUUID(uuid);
                ScaleService.scale(obj2D, false);
            },

            rotate: function (obj3D) {
                var obj2D = Scene2d.getObjectByUUID(obj3D.uuid);
                obj2D.rotation.z = obj3D.rotation.y < 0 ? Math.PI * 2 + obj3D.rotation.y : obj3D.rotation.y;
            },

            createObject: function (entity, data) {
                modelLoader.load({ entity: entity }).then(function (obj3D) {
                    obj3D.userData.entity = entity;
                    obj3D.position.copy(data.position);
                    obj3D.rotation.copy(data.rotation);

                    scene3D.add(obj3D);

                    setDefaultMaterial(obj3D);

                    if (objectCheckerSrvc.isWallEmbeddable(entity)) {
                        var obj2D = createObj2D(obj3D);

                        obj3D.userData.wall = data.wall;
                        updateWall(obj3D);

                        obj2D.rotation.set(-Math.PI / 2, 0, 0);
                        obj2D.userData.wall = data.wall;
                        Scene2d.getObjectByName(data.wall).add(obj2D);

                        this.moveWallObject(obj3D, data.wall);
                    }
                    else {
                        this.addObject(obj3D);
                    }

                }.bind(this));
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('scene2DSyncSrvc', service);

})();
