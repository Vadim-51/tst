; (function () {

    var dependencies = ['obbBuilder', 'constants'];

    var service = function (obbBuilder, constants) {

        var getProperty = function (propertyName) {
            if (this)
                return this[propertyName];
            return null;
        };

        var getBorder = function (entity) {
            var border = entity.borders;
            return border && border.default ? parseFloat(border.default) : null;
        };

        var getWallGap = function (entity) {
            var border = entity.borders;
            return border && border.wall ? parseFloat(border.wall) : null;
        };

        var getSizeWithBorder = function (obj, border) {

            var size,
                entity;
            if (obj.userData) entity = obj.userData.entity;

            if (!entity || entity.isWall
                || entity.isFloor) {
                if (!obj.geometry.boundingBox)
                    obj.geometry.computeBoundingBox();
                size = obj.geometry.boundingBox.size();
            }
            else {
                size = new THREE.Vector3(entity.length, entity.height, entity.width);
            }

            if (border)
                size.addScalar(border);

            return size;
        };

        var getMesh = function (obj) {
            if (obj instanceof THREE.Mesh)
                return obj;

            if (obj instanceof THREE.LineSegments)
                return obj;

            return obj.getObjectByName('3D') || obj.getObjectByName('2D');
        };

        return {
            objectOBBIntersectWalls: function (objOBB, walls) {
                var i = 0,
                    wall,
                    wallOBB;

                for (; i < walls.length; i++) {
                    wall = walls[i];
                    wallOBB = //wall.userData.obb || 
                        obbBuilder.create().build(wall); 
                    // wall.userData.obb = wallOBB; //cache obb
                    if (objOBB.isIntersectionOBB(wallOBB)) {
                        return wall;
                    }
                }

                return null;
            },
            isCollide: function (draggedObject, staticObjs, extraParams) {

                var mesh = getMesh(draggedObject);
               
                draggedObject.updateMatrixWorld();

                var draggedObjectEntity = draggedObject.userData.entity,
                     intersect = false,
                     i = 0,
                     staticObj,
                     staticObjPosition,
                     roomObjEntity,
                     currentOBB,
                     staticObjMesh,
                     staticObjectSize,
                     staticObjOBB,
                     border,
                     staticColliderCache = getProperty.call(extraParams, 'staticColliderCache'),
                     upAxis = getProperty.call(extraParams, 'upAxis'),
                     newRotation = getProperty.call(extraParams, 'newRotation'),
                     useObjectScale = getProperty.call(extraParams, 'useObjectScale'),
                     draggedObjectPosition = getProperty.call(extraParams, 'draggedObjectPosition');

                if (staticObjs && staticObjs.length !== 0) {

                    currentOBB = obbBuilder.create()
                                              .setPosition(draggedObjectPosition)
                                              .setSize(getSizeWithBorder(mesh, getBorder(draggedObjectEntity) || -0.2))
                                              .setRotation(newRotation)
                                              .useObjectScale(useObjectScale)
                                              .build(mesh);

                    for (; i < staticObjs.length; i++) {

                        staticObj = staticObjs[i];

                        staticObj.updateMatrixWorld();

                        staticObjMesh = getMesh(staticObj);

                        if (staticObj.userData)
                            roomObjEntity = staticObj.userData.entity;

                        border = (!roomObjEntity || roomObjEntity.isWall)
                            ? getWallGap(draggedObjectEntity) : getBorder(roomObjEntity);

                        if (staticColliderCache && staticColliderCache[staticObj.uuid]) {
                            staticObjOBB = staticColliderCache[staticObj.uuid];
                        }
                        else {
                            staticObjectSize = getSizeWithBorder(staticObjMesh, border, upAxis);
                            staticObjPosition = null;

                            //object is child
                            if (staticObj.parent instanceof THREE.Mesh)
                                staticObjPosition = staticObj.localToWorld(new THREE.Vector3());

                            staticObjOBB = obbBuilder.create()
                                                 .setPosition(staticObjPosition)
                                                .setSize(staticObjectSize)
                                                .build(staticObjMesh);

                            if (staticColliderCache)
                                staticColliderCache[staticObj.uuid] = staticObjOBB;
                        }

                        if (currentOBB.isIntersectionOBB(staticObjOBB)) {
                            return staticObj;
                        }
                    }
                }

                return null;
            },

            isCollideWithWall: function (draggedObject, staticObjs, extraParams) {

                var draggedObjectEntity = draggedObject.userData.entity,
                     intersect = false,
                     i = 0,
                     staticObj,
                     staticObjPosition,
                     roomObjEntity,
                     currentOBB,
                     staticObjectSize,
                     staticObjOBB,
                     border,
                     upAxis = getProperty.call(extraParams, 'upAxis');

                if (staticObjs && staticObjs.length !== 0) {

                    currentOBB = obbBuilder.create()
                                              .setPosition(getProperty.call(extraParams, 'draggedObjectPosition'))
                                              .setSize(getSizeWithBorder(draggedObject, getBorder(draggedObjectEntity) || -0.2, upAxis))
                                              .build(draggedObject);

                    for (; i < staticObjs.length; i++) {
                        staticObj = staticObjs[i];
                        // roomObjEntity = staticObj.userData.entity;
                        // border = (!roomObjEntity || roomObjEntity.objectType === 0) ? getWallGap(draggedObjectEntity) : getBorder(roomObjEntity);
                        staticObjectSize = getSizeWithBorder(staticObj, 0, upAxis);
                        staticObjPosition = null;

                        //object is child
                        if (staticObj instanceof THREE.Mesh)
                            staticObjPosition = staticObj.localToWorld(new THREE.Vector3());

                        staticObjOBB = obbBuilder.create()
                                             .setPosition(staticObjPosition)
                                            .setSize(staticObjectSize)
                                            .build(staticObj);

                        if (currentOBB.isIntersectionOBB(staticObjOBB)) {
                            return staticObj;
                        }
                    }
                }

                return null;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('collisionSrvc', service);

})();