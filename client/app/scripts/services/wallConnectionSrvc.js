; (function () {
    'use strict';

    var dependencies = [];

    var service = function () {

        var plane = new THREE.Plane();
        var ray = new THREE.Ray();

        var viewType = {
            VIEW_2D: 0,
            VIEW_3D: 1
        };

        var connectAllWalls = function (walls) {
            var count = walls.length,
                 i = 0,
                 currentWall,
                 nextWall;

            for (; i < count; i++) {
                currentWall = walls[i];
                nextWall = walls[(i + 1) % count];
                connectTwoWalls(currentWall, nextWall);
            }
        };


        var moveWallAVertices = function (wall, position) {
            /*
              vertex[1] - back top right
              vertex[3] - back bottom right
             */

            wall.geometry.vertices[3].x = position.x;
            wall.geometry.vertices[3].z = position.z;
            wall.geometry.vertices[1].x = position.x;
            wall.geometry.vertices[1].z = position.z;
            wall.geometry.verticesNeedUpdate = true;
        };

        var moveWallBVertices = function (wall, position) {
            /*
             vertex[4] - back left top 
              vertex[6] - back left bottom 
             */

            wall.geometry.vertices[6].x = position.x;
            wall.geometry.vertices[6].z = position.z;
            wall.geometry.vertices[4].x = position.x;
            wall.geometry.vertices[4].z = position.z;
            wall.geometry.verticesNeedUpdate = true;
        };

        var connectTwoWalls = function (wallA, wallB) {

            wallA.updateMatrixWorld();
            wallB.updateMatrixWorld();

            var currentPoint = wallA.localToWorld(new THREE.Vector3(wallA.geometry.vertices[2].x, 0, 0)),
                prevPoint = wallA.localToWorld(new THREE.Vector3(0, 0, 0)),
                currentWallDir = wallA.getWorldDirection(),
                nextWallDirection = wallB.getWorldDirection(),
                wallAWidth =  wallA.userData.entity.width,
                wallBWidth = wallB.userData.entity.width,
                wallAPoint,
                wallBPoint,
                planePosition,
                upVector,
                rayDir,
                rayOrigin,
                angle,
                sign = 1,
                intersectionPoint,
                dotProduct = currentWallDir.dot(nextWallDirection);

            if (dotProduct >= 0.995 && dotProduct <= 1.01) {
                var direction = currentWallDir.clone().negate();
                wallAPoint = wallA.worldToLocal(direction.clone().multiplyScalar(wallAWidth).add(currentPoint));
                wallBPoint = wallB.worldToLocal(direction.multiplyScalar(wallBWidth).add(currentPoint));
                moveWallAVertices(wallA, wallAPoint);
                moveWallBVertices(wallB, wallBPoint);
            }
            else {

                //if (vType === viewType.VIEW_3D) {
                    currentWallDir.negate();
                    nextWallDirection.negate();
                    planePosition = nextWallDirection.clone().multiplyScalar(wallBWidth).add(currentPoint);
                    rayOrigin = currentWallDir.clone().multiplyScalar(wallAWidth).add(prevPoint);
                    upVector = new THREE.Vector3(0, 1, 0);
                    angle = ((Math.atan2(nextWallDirection.x, nextWallDirection.z) -
                        Math.atan2(currentWallDir.x, currentWallDir.z) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
                    sign = -1;
                        //angle > 0 ? -1 : 1; //inner / outer angle
               // }
                //else {
                //    planePosition = nextWallDirection.clone().negate().multiplyScalar(wallBWidth).add(currentPoint);
                //    rayOrigin = currentWallDir.clone().negate().multiplyScalar(wallAWidth).add(prevPoint);
                //    upVector = new THREE.Vector3(0, 0, 1);
                //}

                rayDir = currentWallDir.clone().applyAxisAngle(upVector, Math.PI / 2 * sign);
                plane.setFromNormalAndCoplanarPoint(nextWallDirection, planePosition);
                ray.set(rayOrigin, rayDir);

                intersectionPoint = ray.intersectPlane(plane);

                if (intersectionPoint) {
                    wallAPoint = wallA.worldToLocal(intersectionPoint.clone());
                    wallBPoint = wallB.worldToLocal(intersectionPoint);
                    moveWallAVertices(wallA, wallAPoint);
                    moveWallBVertices(wallB, wallBPoint);
                }
            }
        };

        //var connectTwoWalls = function (wallA, wallB, vType) {

        //    wallA.updateMatrixWorld();

        //    var wallLength = wallA.geometry.vertices[2].x,
        //        connectionPoint = wallA.localToWorld(new THREE.Vector3(wallLength, 0, 0)),
        //        currentWallDir,
        //        nextWallDirection,
        //        planePosition,
        //        angle,
        //        sign,
        //        rayDir,
        //        origin;

        //    if (vType === viewType.VIEW_3D) {
        //        currentWallDir = wallA.getWorldDirection().negate();
        //        nextWallDirection = wallB.getWorldDirection().negate();
        //        planePosition = nextWallDirection.clone().multiplyScalar(wallB.userData.entity.width).add(connectionPoint);
        //        origin = currentWallDir.clone().multiplyScalar(wallA.userData.entity.width).add(connectionPoint);
        //        angle = ((Math.atan2(nextWallDirection.x, nextWallDirection.z) -
        //            Math.atan2(currentWallDir.x, currentWallDir.z) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
        //        sign = angle > 0 ? -1 : 1; //inner / outer angle
        //        rayDir = currentWallDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2 * sign);
        //    }
        //    else {
        //         currentWallDir = wallA.getWorldDirection();
        //         nextWallDirection = wallB.getWorldDirection();
        //         planePosition = nextWallDirection.clone().negate().multiplyScalar(wallB.userData.width).add(connectionPoint);
        //         origin = currentWallDir.clone().negate().multiplyScalar(wallA.userData.width).add(connectionPoint);
        //         angle = ((Math.atan2(nextWallDirection.x, nextWallDirection.y) -
        //                Math.atan2(currentWallDir.x, currentWallDir.y) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
        //         sign = angle > 0 ? -1 : 1; //inner / outer angle
        //         rayDir = currentWallDir.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2 * sign);
        //    }

        //    plane.setFromNormalAndCoplanarPoint(nextWallDirection, planePosition);
        //    ray.set(origin, rayDir);

        //    var intr = ray.intersectPlane(plane);

        //    if (intr) {

        //        /*
        //          vertex[4] - back left top 
        //          vertex[6] - back left bottom 

        //          vertex[1] - back top right
        //          vertex[3] - back bottom right
        //        */

        //        var cur = wallA.worldToLocal(intr.clone());
        //        var nxt = wallB.worldToLocal(intr.clone());

        //        wallA.geometry.vertices[3].x = cur.x;
        //        wallA.geometry.vertices[3].z = cur.z;
        //        wallA.geometry.vertices[1].x = cur.x;
        //        wallA.geometry.vertices[1].z = cur.z;
        //        wallA.geometry.verticesNeedUpdate = true;

        //        wallB.geometry.vertices[6].x = nxt.x;
        //        wallB.geometry.vertices[6].z = nxt.z;
        //        wallB.geometry.vertices[4].x = nxt.x;
        //        wallB.geometry.vertices[4].z = nxt.z;
        //        wallB.geometry.verticesNeedUpdate = true;
        //    }
        //}

        return {
            connectAllWalls: connectAllWalls,
            connectTwoWalls2D: function (wallA, wallB) {
                connectTwoWalls(wallA, wallB, viewType.VIEW_2D);
            },
            connectTwoWalls3D: function () {
                connectTwoWalls(wallA, wallB, viewType.VIEW_3D);
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('wallConnectionSrvc', service);

})();
