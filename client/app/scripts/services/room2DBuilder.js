; (function () {
    'use strict';

    var dependencies = ['constants', 'roomSizeManager', 'wallConnectionSrvc',
        'object3DSelectionBox', 'wall3DDataManager', 'defaultMaterialSetter'];

    var service = function (constants, roomSizeManager, wallConnectionSrvc,
        object3DSelectionBox, wall3DDataManager, defaultMaterialSetter) {

        var wallMaterial = new THREE.MeshFaceMaterial([
            new THREE.MeshStandardMaterial({ color: 0x000000 }),
            new THREE.MeshStandardMaterial({ color: 0x000000 }),
            new THREE.MeshPhongMaterial({ color: 0x000000 }), //wall top face
            new THREE.MeshStandardMaterial({ color: 0x000000 }), //wall bottom
            new THREE.MeshPhongMaterial({ name: 'WALL', color: 0xffffff }), //inner plane
            new THREE.MeshPhongMaterial({ name: 'WALL', color: 0xffffff }) //outer palne
        ]);

        var createFloor2D = function (points) {

            var rotateMinus90DegMatx = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(-90));

            var shape = new THREE.Shape();

            for (var i = 0; i < points.length; i++) {

                var p = points[i];

                if (i == 0) {
                    shape.moveTo(p.x, p.z);
                }
                else {
                    shape.lineTo(p.x, p.z);
                }
            }

            var material = new THREE.MeshBasicMaterial({
                color: 0x83ACF2,
                name: 'FLOOR',
                side: THREE.DoubleSide
            }),
               geometry = new THREE.ShapeGeometry(shape),//.applyMatrix(rotateMinus90DegMatx),
               mesh = new THREE.Mesh(geometry, material);

            mesh.floor = true;
            mesh.name = 'floor';
            mesh.position.y = 1;
            mesh.userData.isFloor = true;
            mesh.rotation.x = Math.PI / 2;
            mesh.uuid = 'FLOOR';

            object3DSelectionBox.addSelectionBoxToMesh(mesh);

            roomSizeManager.buildFloorSize(mesh);

           // defaultMaterialSetter.set(mesh);

            return mesh;
        };

        var createConnectionPoint = function (point, index) {
            var circle = new THREE.CircleBufferGeometry(9, 32);
            var mesh = new THREE.Mesh(circle, new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: false, depthTest: false }));
            mesh.position.set(point.x, 0, point.z);
            mesh.name = 'connectionPoint ' + (index + 1);
            mesh.userData.isConnectionPoint = true;
            mesh.userData.index = index;
            mesh.rotation.x = -Math.PI / 2;
            mesh.renderOrder = 1;
            return mesh;
        };

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

            buildConnectionPoints: function (points) {

                var i = 0,
                    count = points.length,
                    a, b,
                    result = [],
                    wall;

                for (; i < count; i++) {
                    a = points[i];
                    b = points[(i + 1) % count];

                    a = new THREE.Vector3(a.x, 0, a.z);
                    b = new THREE.Vector3(b.x, 0, b.z);

                    result.push(createConnectionPoint(a, i));
                }

                return result;
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

                wall.uuid = wall.name;
                //wall.userData.isWall = true;

                //  wall.renderOrder = 0.1;
                //wall.updateMatrixWorld();

                object3DSelectionBox.addSelectionBoxToMesh(wall);

                wall3DDataManager.add(wall, wallLen, constants.wallHeight, width);

                defaultMaterialSetter.set(wall);

                return wall;
            },

            buildFloor: createFloor2D,

            createConnectionPoint: createConnectionPoint,

            updateWallLength: function (wall, startPoint, endPoint) {
                var geometry = wall.geometry,
                    vertx = geometry.vertices,
                    newLength = startPoint.distanceTo(endPoint),
                    rotation = -Math.atan2(endPoint.z - startPoint.z, endPoint.x - startPoint.x);

                vertx[0].x = newLength;
                vertx[2].x = newLength;

                wall.rotation.set(0, rotation, 0);
                wall.position.copy(startPoint);

                wall3DDataManager.updateWallData(wall, newLength, wall.userData.entity.height, wall.userData.entity.width);

                geometry.verticesNeedUpdate = true;
                geometry.boundingSphere = null;
                geometry.boundingBox = null;

                object3DSelectionBox.updateSize(wall);
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

            updateFloor: function (floor, points) {
                var geometry = floor.geometry,
                    vertx = geometry.vertices,
                    faces = geometry.faces,
                    i = 0,
                    trianglesIndexes = THREE.ShapeUtils.triangulateShape(points, []),
                    triangleIndexes,
                    face;

                for (; i < points.length; i++) {
                    vertx[i].copy(points[i]);
                }

                for (i = 0; i < faces.length; i++) {
                    triangleIndexes = trianglesIndexes[i];
                    face = faces[i];
                    face.a = triangleIndexes[0];
                    face.b = triangleIndexes[1];
                    face.c = triangleIndexes[2];
                }

                geometry.verticesNeedUpdate = true;
                geometry.elementsNeedUpdate = true;

                geometry.boundingSphere = null;
                geometry.boundingBox = null;

                object3DSelectionBox.rebuild(floor);
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('room2DBuilder', service);

})();
