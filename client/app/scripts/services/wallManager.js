; (function () {
    'use strict';

    var dependencies = ['wallConnectionSrvc', 'object3DSelectionBox'];

    var service = function (wallConnectionSrvc, object3DSelectionBox) {

        var wallMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000
        });

        return {

            buildWalls: function (points) {

                var i = 0,
                    count = points.length,
                    a, b,
                    result = [],
                    walls = [],
                    wall;

                for (; i < count; i++) {
                    a = points[i];
                    b = points[(i + 1) % count];

                    a = new THREE.Vector3(a.x, 0, a.z);
                    b = new THREE.Vector3(b.x, 0, b.z);

                    wall = this.buildWall(a, b, i, a.depth);

                    walls.push(wall);

                    result.push(createConnectionPoint(a, i));
                }

                wallConnectionSrvc.connectAllWalls(walls);

                roomSizeManager.buildAll(walls);

                return walls;
            },

            buildWall: function (pointA, pointB, index, width) {

                width = width || constants.wallWidth;

                var wallLen = pointA.distanceTo(pointB);

                var dir = pointB.clone().sub(pointA);
                //  var angle = Math.atan2(dir.z, dir.x);

                //var a1 = Math.atan2(pointA.z - pointB.z, pointA.x - pointB.x);
                var a2 = -Math.atan2(pointB.z - pointA.z, pointB.x - pointA.x);

                //console.log(THREE.Math.radToDeg(a1), THREE.Math.radToDeg(a2), THREE.Math.radToDeg(angle));


                var geometry = new THREE.BoxGeometry(wallLen, constants.wallHeight, width);
                geometry.applyMatrix(new THREE.Matrix4().makeTranslation(wallLen / 2, constants.wallHeight / 2, -width / 2));

                var wall = new THREE.Mesh(geometry, wallMaterial.clone());
                wall.name = 'Wall ' + (index + 1);

                //wall.scale.set(wallLen, constants.wallHeight, constants.wallWidth);
                wall.rotation.y = a2;

                //wall.position.copy(pointA);

                wall.position.set(pointA.x, 0, pointA.z);

                wall.userData.entity = {
                    length: wallLen,
                    height: constants.wallHeight,
                    width: width,
                    isWall: true,
                    category: "Wall"
                };

                wall.userData.index = index;
                //wall.userData.isWall = true;

                //  wall.renderOrder = 0.1;
                //wall.updateMatrixWorld();

                object3DSelectionBox.addSelectionBoxToMesh(wall);

                return wall;
            },

            updateWallLength: function (wall, startPoint, endPoint) {
                var geometry = wall.geometry,
                    vertx = geometry.vertices,
                    newLength = startPoint.distanceTo(endPoint),
                    rotation = -Math.atan2(endPoint.z - startPoint.z, endPoint.x - startPoint.x);

                vertx[0].x = newLength;
                vertx[2].x = newLength;

                wall.rotation.set(0, rotation, 0);
                wall.position.copy(startPoint);

                geometry.verticesNeedUpdate = true;
                geometry.boundingSphere = null;
                geometry.boundingBox = null;
            },

            updateWallWidth: function (wall, newWidth) {
                var geometry = wall.geometry,
                   vertx = geometry.vertices;

                vertx[1].z = -newWidth;
                vertx[3].z = -newWidth;
                vertx[4].z = -newWidth;
                vertx[6].z = -newWidth;

                wall.userData.width = newWidth;

                geometry.verticesNeedUpdate = true;
                geometry.boundingSphere = null;
                geometry.boundingBox = null;
            },

            updateWallHoles: function (wall, wallObjects) {

            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('wallManager', service);

})();
