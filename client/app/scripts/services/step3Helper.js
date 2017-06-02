; (function () {

    var dependencies = ['constants', 'collisionSrvc'];

    var service = function (constants, collisionSrvc) {

        var getAllDraggableExceptCurrent = function (objects, current) {
            var result = [], i, object;
            for (i = 0; i < objects.length; i++) {
                object = objects[i];
                if (object.id !== current.id && object.userData.draggable)
                    result.push(object);
            }
            return result;
        };

        var pointInPolygon = function (polygonPoints, point) {
            var count = polygonPoints.length,
                result = false, i, j;
            for (i = 0, j = count - 1; i < count; j = i++) {
                if (((polygonPoints[i].y >= point.y) !== (polygonPoints[j].y >= point.y)) &&
                    (point.x <= (polygonPoints[j].x - polygonPoints[i].x) * (point.y - polygonPoints[i].y)
                        / (polygonPoints[j].y - polygonPoints[i].y) + polygonPoints[i].x)
                )
                    result = !result;
            }
            return result;
        };

        var isIntersectWithOthers = function (current, others) {

            if (others.length === 0)
                return false;

            if (!current.geometry.boundingBox)
                current.geometry.computeBoundingBox();

            var objects = getAllDraggableExceptCurrent(others, current),
                matrix = current.matrix.clone(),
                size = current.geometry.boundingBox.size(),
                halfOfLength = size.x / 2,
                halfOfHeight = size.y / 2,
                halfOfWidth = size.z / 2,
                i, localVertex, vertexIndex,
                globalVertex, rayDirection,
                intersection, rayLength,
                position = new THREE.Vector3(0, 0, halfOfWidth + 0.1),
                vertices = [
                    [-halfOfLength, 0, 0],
                    [halfOfLength, 0, 0],
                    [-halfOfLength, -halfOfHeight, -halfOfWidth],
                    [-halfOfLength, halfOfHeight, -halfOfWidth],
                    [halfOfLength, -halfOfHeight, -halfOfWidth],
                    [halfOfLength, halfOfHeight, -halfOfWidth]
                ],
                ray;

            position.applyMatrix4(matrix);

            for (i = 0; i < vertices.length; i++) {
                vertexIndex = vertices[i];
                localVertex = new THREE.Vector3(vertexIndex[0], vertexIndex[1], vertexIndex[2]);
                globalVertex = localVertex.applyMatrix4(matrix);
                rayDirection = globalVertex.sub(position);
                rayLength = rayDirection.length();
                ray = new THREE.Raycaster(position, rayDirection.normalize(), 0, rayLength);
                intersection = ray.intersectObjects(objects);
                if (intersection.length > 0)
                    return true;
            }
            return false;
        };

        var vertexInsideRoomCount = function (object, polygonPoints) {

            var i,
                entity = object.userData.entity,
                halfOfLength = entity.length / 2,
                halfOfWidth = entity.width / 2,
                matrix = object.matrix,
                point,
                pointsInside = 0,
                objectPoints = [new THREE.Vector3(-halfOfLength, halfOfWidth, 0),
                new THREE.Vector3(-halfOfLength, -halfOfWidth, 0),
                new THREE.Vector3(halfOfLength, halfOfWidth, 0),
                new THREE.Vector3(halfOfLength, -halfOfWidth, 0)];

            for (i = 0; i < objectPoints.length; i++) {
                point = objectPoints[i];
                point.applyMatrix4(matrix);
                if (pointInPolygon(polygonPoints, point))
                    pointsInside++;
            }

            return pointsInside;
        };

        var isObjectOnWall = function (wall, object) {
            var i, intersection, rays = wall.userData.edgeRays, ray;
            for (i = 0; i < rays.length; i++) {
                ray = rays[i];
                intersection = ray.intersectObject(object);
                if (intersection.length > 0)
                    return false;
            }
            return true;
        };

        var snapToWall = function (position, wall) {

            var wallDirection = wall.getWorldDirection(),
                ray,
                intersection,
                intersectionPoint,
                floorOffset = position.y;

            position.add(wallDirection.clone().multiplyScalar(500));
            position.y = 1;

            ray = new THREE.Raycaster(position, wallDirection.negate());
            intersection = ray.intersectObject(wall);
            if (intersection.length > 0) {
                intersectionPoint = intersection[intersection.length - 1].point;
                intersectionPoint.y = floorOffset;
                return intersectionPoint;
            }

            return null;
        };

        var snapToWallV2 = function (position, wall) {

            var floorOffset = position.y;
            var wallDirection = wall.getWorldDirection();
            var result = position.clone();

            var dif = wall.position.clone().sub(position);
            dif.projectOnVector(wallDirection);

            result.add(dif);
            result.y = floorOffset;

            return result;
        };

        return {

            highlightIfDefined: function (mesh, color) {
                if (!mesh)
                    return;
                var children = mesh.getObjectByName('2D').children, i, child;
                for (i = 0; i < children.length; i++) {
                    child = children[i];
                    if (child.name === 'border') {
                        if (color === 0x000000) {
                            //if (mesh.userData.entityType === 'stairs' && mesh.userData.entity.id !== 4)
                            //    child.material.color.setHex(color);
                            //else
                            child.visible = false;
                        }
                        else {
                            child.material.color.setHex(color);
                            child.visible = true;
                        }
                    }
                }
            },
            highlightWallIfDefined: function (wall, color) {
                if (wall) {
                    wall.material.materials[2].color.setHex(color);
                }
            },
            highlightWall : function (wall) {
                if (wall) {
                    wall.material.materials[2].color.setHex(constants.HighlightState.SELECTED);
                }
            },
            unHighlightWall: function (wall) {
                if (wall) {
                    wall.material.materials[2].color.setHex(constants.HighlightState.DEFAULT);
                }
            },
            getObjectWallAlignedPosition: function (wall, objectPosition) {

                var wallDirection = wall.getWorldDirection(),
                    wallOpositeDirection = wallDirection.clone().negate(),
                    ray,
                    collisionResults,
                    offset,
                    objectZCoord = objectPosition.z,
                    center;

                objectPosition.z = 0;

                ray = new THREE.Raycaster(objectPosition.add(wallOpositeDirection.clone().multiplyScalar(100)),
                    wallDirection);

                collisionResults = ray.intersectObject(wall);

                offset = wallOpositeDirection.multiplyScalar(wall.userData.size.z / 2);

                center = collisionResults[0].point.clone();
                center.sub(offset);
                center.z = objectZCoord;

                return center;
            },
            getIntersectedWall: function (object, walls) {
                var width = object.userData.entity.width;
                var length = object.userData.entity.length;
                var max;
                if (width > length) {
                    max = width;
                } else {
                    max = length;
                }
                var matrix = object.matrix,
                    center = new THREE.Vector3(0, 0, 0),
                    topCenter = new THREE.Vector3(0, object.userData.entity.width / 2, 0),
                    bottomCenter = new THREE.Vector3(0, -object.userData.entity.width / 2, 0),
                    rotation = new THREE.Matrix4().makeRotationZ(object.rotation.z),
                    halfOfWidth = object.userData.entity.width / 2,
                    quadOfLenght = object.userData.entity.length / 4,
                    i = 0,
                    item,
                    ray,
                    intersection,
                    rayData;

                center.applyMatrix4(matrix);
                topCenter.applyMatrix4(matrix);
                bottomCenter.applyMatrix4(matrix);

                rayData = [
                    {
                        origin: center,
                        direction: new THREE.Vector3(0, 1, 0),
                        length: max
                    }, {
                        origin: center,
                        direction: new THREE.Vector3(0, -1, 0),
                        length: max
                    }, {
                        origin: topCenter,
                        direction: new THREE.Vector3(0, -1, 0),
                        length: max
                    }, {
                        origin: bottomCenter,
                        direction: new THREE.Vector3(0, 1, 0),
                        length: max
                    }, {
                        origin: center,
                        direction: new THREE.Vector3(1, 0, 0),
                        length: max
                    }, {
                        origin: center,
                        direction: new THREE.Vector3(-1, 0, 0),
                        length: max
                    }
                ];

                for (i; i < rayData.length; i++) {

                    item = rayData[i];

                    item.origin.z = 1;

                    ray = new THREE.Raycaster(item.origin, item.direction.applyMatrix4(rotation), 0, item.length);

                    intersection = ray.intersectObjects(walls);

                    if (intersection.length > 0)
                        return intersection[0].object;
                }

                return null;
            },
            preComputeWallsParameters: function (walls) {

                var i = 0, j, wall,
                    edgeRays,
                    wallSize,
                    result = [],
                    points, point,
                    matrix,
                    halfOfWallLength, halfOfWallWidth,
                    edgeRayDirection = new THREE.Vector3(0, 0, 1);

                for (; i < walls.length; i++) {

                    wall = walls[i];

                    wall.geometry.computeBoundingBox();

                    wallSize = wall.geometry.boundingBox.size();

                    matrix = wall.matrix;

                    halfOfWallLength = wallSize.x / 2;
                    halfOfWallWidth = wallSize.z / 2;

                    points = [
                        new THREE.Vector3(-halfOfWallLength, 0, 0),
                        new THREE.Vector3(halfOfWallLength, 0, 0),
                        new THREE.Vector3(-halfOfWallLength, 0, -halfOfWallWidth),
                        new THREE.Vector3(-halfOfWallLength, 0, halfOfWallWidth),
                        new THREE.Vector3(halfOfWallLength, 0, halfOfWallWidth),
                        new THREE.Vector3(halfOfWallLength, 0, -halfOfWallWidth)
                    ];

                    edgeRays = [];

                    for (j = 0; j < points.length; j++) {
                        point = points[j];
                        point.applyMatrix4(matrix);
                        edgeRays.push(new THREE.Raycaster(point, edgeRayDirection));
                    }

                    wall.userData.edgeRays = edgeRays;
                    wall.userData.name = wall.name;
                    wall.userData.size = wallSize;

                    result.push(wall);
                }

                return result;
            },
            isDragPerpendicularWall: function (wall, dragDirection) {

                var wallDirection = wall.getWorldDirection().clone(),
                    angle;

                wallDirection.applyMatrix4(new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(90)));

                angle = THREE.Math.radToDeg(wallDirection.angleTo(dragDirection));

                return angle >= 89 && angle <= 91;
            },
            canPlaceWallObject: function (object, wall) {
                object.updateMatrixWorld();
                object.geometry.computeBoundingBox();

                var valid = !isIntersectWithOthers(object, wall.children);

                if (!valid)
                    return false;

                valid = isObjectOnWall(wall, object);

                return valid;
            },
            getRoomPolygon: function (points, wallWidth) {

                var i,
                    count = points.length,
                    angle,
                    a,
                    b,
                    c,
                    ba,
                    bc,
                    sum,
                    offset = -wallWidth / 2,
                    result = [];

                for (i = 0; i < count; i++) {
                    a = points[i];
                    b = points[(i + 1) % count];
                    c = points[(i + 2) % count];

                    ba = new THREE.Vector2().subVectors(b, a).normalize();
                    bc = new THREE.Vector2().subVectors(b, c).normalize();
                    sum = new THREE.Vector2().addVectors(ba, bc);

                    angle = ((Math.atan2(ba.x, ba.y) - Math.atan2(bc.x, bc.y) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;

                    if (angle > 0)
                        sum.negate();

                    sum.multiplyScalar(offset);
                    sum.add(b);

                    result.push(sum);
                }

                return result;
            },
            vertexInsideRoomCount: vertexInsideRoomCount,
            isIntersectWithOthers: isIntersectWithOthers,
            getObjectsByEntityType: function (objects, type) {
                var result = [],
                    i = 0,
                    obj;
                for (; i < objects.length; i++) {
                    obj = objects[i];
                    if (obj.userData.entity instanceof type)
                        result.push(obj);
                }
                return result;
            },
            mountToWall: function (position, wall) {

                var snapPosition = snapToWall(position.clone(), wall);

                if (snapPosition) {
                    var offset = wall.getWorldDirection().multiplyScalar(constants.wallWidth / 2);
                    snapPosition.sub(offset);
                }

                return snapPosition;
            },
            snapToWallWithGap: function (object, wall) {

                var entity = object.userData.entity,
                    border = entity.borders,
                    snapPosition = snapToWallV2(object.position, wall),
                    wallDirection = wall.getWorldDirection();

                if (snapPosition) {

                    if (border && border.wall) {
                        var gapOffset = wallDirection.clone().multiplyScalar(parseFloat(border.wall));
                        snapPosition.add(gapOffset);
                    }

                    var offset = new THREE.Vector3(entity.length / 2 + 0.1, 0, entity.width / 2 + 0.1)
                        .applyAxisAngle(new THREE.Vector3(0, 1, 0), object.rotation.y)
                        .projectOnVector(wallDirection);
                    snapPosition.add(wallDirection.multiplyScalar(offset.length()));
                }

                return snapPosition;
            },
            cutSnapWall: function (object, wall) {
                var entity = object.userData.entity,
                    snapPosition = snapToWall(object.position.clone(), wall);

                if (snapPosition) {
                    var offset = wall.getWorldDirection().multiplyScalar(entity.width / 2);
                    snapPosition.sub(offset);
                }

                return snapPosition;
            },
            snapToWall: snapToWall,
            getWallInHotZone: function (object, walls) {

                var entity = object.userData.entity;

                if (!entity.hotzones || !entity.hotzones.wall)
                    return null;

                var halfOfLength = entity.length / 2,
                    halfOfWidth = entity.width / 2,
                    matrix = object.matrixWorld.clone(),
                    rotation = new THREE.Matrix4().extractRotation(matrix),
                    i = 0,
                    intersection,
                    rayCaster,
                    edgeRays = [
                        new THREE.Raycaster(new THREE.Vector3(0, halfOfWidth, 0), new THREE.Vector3(0, 0, 1)), //up
                        new THREE.Raycaster(new THREE.Vector3(0, -halfOfWidth, 0), new THREE.Vector3(0, 0, -1)), //down
                        new THREE.Raycaster(new THREE.Vector3(halfOfLength, 0, 0), new THREE.Vector3(1, 0, 0)), //right
                        new THREE.Raycaster(new THREE.Vector3(-halfOfLength, 0, 0), new THREE.Vector3(-1, 0, 0)) //left
                    ];

                for (; i < edgeRays.length; i++) {
                    rayCaster = edgeRays[i];
                    rayCaster.ray.origin.applyMatrix4(matrix);
                    rayCaster.ray.direction.applyMatrix4(rotation);
                    rayCaster.far = parseFloat(entity.hotzones.wall) || 1;
                    intersection = rayCaster.intersectObjects(walls)[0];
                    if (intersection)
                        return intersection.object;
                }

                return null;
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('step3Helper', service);

})();
