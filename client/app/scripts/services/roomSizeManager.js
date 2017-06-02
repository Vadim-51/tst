; (function () {
    'use strict';

    var dependencies = ['constants', 'roomStateManager', 'sizeHelper', 'geometryHelper', 'appSettings'];

    var service = function (constants, roomStateManager, sizeHelper, geometryHelper, appSettings) {

        var sizeLineMaterial = new THREE.LineBasicMaterial({
            color: 0x8C8C8C,
            depthWrite: false,
            depthTest: false
        });
        var sizeLineOffset = 5;
        var sizeTextMeshWidth = 100;
        var sizeTextMeshHeight = 50;

        var sizeType = {
            INNER: 0,
            OUTER: 1
        };

        var textToImage = function (text, isBold) {
            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', 128);
            canvas.setAttribute('height', 64);
            var ctx = canvas.getContext("2d");
            var bold = isBold ? 'bold ' : '';
            ctx.font = bold + "22px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(text, canvas.width / 2, (canvas.height / 2) + 9);
            // ctx.strokeRect(0, 0, canvas.width, canvas.height);
            return canvas;
        };

        var updateTextureImage = function (mesh, img) {
            if (mesh.material.map)
                mesh.material.map.image = img;
            else {
                mesh.material.map = new THREE.Texture(img);
                mesh.material.map.anisotropy = constants.maxAnisotropy;
            }
            mesh.material.map.needsUpdate = true;
            mesh.material.needsUpdate = true;
        };

        var buildSizes = function (type, wall) {

            var sizeContainer = new THREE.Object3D();
            sizeContainer.name = Object.getOwnPropertyNames(sizeType)[type];

            var lineOffset = sizeLineOffset * -1;
            var containerVerticalOffset;
            var containerRotationDirection;
            var sizeTextRotation;

            if (type === sizeType.INNER) {
                containerRotationDirection = -1;
                containerVerticalOffset = 0;
                sizeTextRotation = 0;
            }
            else {
                containerRotationDirection = 1;
                containerVerticalOffset = -wall.userData.entity.width;
                sizeTextRotation = Math.PI;
            }

            var linesContainer = new THREE.Object3D();
            linesContainer.name = 'lines';

            var geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(1, 0, 0)
            );
            var line = new THREE.Line(geometry, sizeLineMaterial);
            line.name = 'horizontal';
            line.position.y = lineOffset;
            line.renderOrder = 2;
            linesContainer.add(line);

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, lineOffset, 0)
            );
            line = new THREE.Line(geometry, sizeLineMaterial);
            line.name = 'vertical left';
            line.renderOrder = 2;
            linesContainer.add(line);

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(1, lineOffset, 0)
            );
            line = new THREE.Line(geometry, sizeLineMaterial);
            line.name = 'vertical right';
            line.renderOrder = 2;
            linesContainer.add(line);

            geometry = new THREE.PlaneBufferGeometry(sizeTextMeshWidth, sizeTextMeshHeight);
            var plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
                transparent: true,
                depthWrite: false,
                depthTest: false
            }));
            plane.position.y = (sizeLineOffset + sizeTextMeshHeight / 2) * -1;
            plane.name = 'sizeText';
            plane.visible = false;
            plane.renderOrder = 2;
            plane.rotation.x = sizeTextRotation;

            sizeContainer.add(plane);
            sizeContainer.add(linesContainer);

            wall.add(sizeContainer);

            sizeContainer.rotation.x = Math.PI / 2 * containerRotationDirection;
            sizeContainer.position.z = containerVerticalOffset;
            sizeContainer.visible = false;
        };

        return {
            buildForCustomRoom: function (wallContainer) {
                var sizeLineOffset = sizeTextMeshWidth / 2;

                var sizeContainer = new THREE.Object3D();

                var horizontalLineOffset = new THREE.Vector3(0, sizeLineOffset / 2, 0);

                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0.5, 0, 0),
                    new THREE.Vector3(1, 0, 0)
                );
                var line = new THREE.Line(geometry, sizeLineMaterial);
                line.name = 'horizontal';
                line.position.add(horizontalLineOffset);
                sizeContainer.add(line);

                geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, sizeLineOffset, 0)
                );
                line = new THREE.Line(geometry, sizeLineMaterial);
                line.name = 'vertical left';
                sizeContainer.add(line);

                geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(1, sizeLineOffset, 0)
                );
                line = new THREE.Line(geometry, sizeLineMaterial);
                line.name = 'vertical right';
                sizeContainer.add(line);

                //create text
                var parent = wallContainer.parent;
                geometry = new THREE.PlaneBufferGeometry(sizeTextMeshWidth, sizeTextMeshHeight);
                var plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
                    transparent: true
                }));
                // plane.position.y = sizeLineOffset * 2;
                plane.position.y += sizeLineOffset;
                plane.name = 'sizeText';
                plane.visible = false;
                parent.add(plane);

                wallContainer.add(sizeContainer);
            },

            build2: function (wall) {
                buildSizes(sizeType.INNER, wall);
                buildSizes(sizeType.OUTER, wall);
                this.updateWallSizes(wall);
            },

            updateWallSizes: function (wall) {

                var names = Object.getOwnPropertyNames(sizeType);
                var vertices = wall.geometry.vertices;

                var innerLength = vertices[2].x;
                this.updateSize(innerLength, 0, 0, wall, names[0]);

                var outerLength = Math.abs(vertices[3].x) + (-vertices[6].x)
                this.updateSize(outerLength, vertices[6].x, -wall.userData.entity.width, wall, names[1]);
            },

            buildAll: function (walls) {
                for (var i = 0; i < walls.length; i++)
                    this.build2(walls[i]);
            },

            updateSize: function (len, containerXOffset, containerYOffset, wall, containerName) {
                var wallLength = this.getWallCurrentSize(len);
                var img = textToImage(wallLength);
                var sizeContainer = wall.getObjectByName(containerName);
                var mesh = sizeContainer.getObjectByName('sizeText');

                sizeContainer.position.set(containerXOffset, 0, containerYOffset);

                mesh.visible = true;
                mesh.position.x = len / 2;
                mesh.rotation.z = -wall.rotation.y;
                updateTextureImage(mesh, img);

                var horizontal = sizeContainer.getObjectByName('lines');
                horizontal.scale.x = len;
            },

            updateWallSizeCustomRoom: function (wallContainer) {

                var wall = wallContainer.getObjectByName('Wall');
                var len = wall.scale.x;
                var wallLength = this.getWallCurrentSize(len);

                var img = textToImage(wallLength);
                var mesh = wallContainer.getObjectByName('sizeText');

                updateTextureImage(mesh, img);

                mesh.position.x = len / 2;
                mesh.visible = true;
                mesh.rotation.z = -wallContainer.rotation.z;
            },

            getWallInnerLength: function (wall) {
                var innerLength = wall.geometry.vertices[2].x;
                return this.getWallCurrentSize(innerLength);
            },

            getWallWidth: function (wall) {
                var width = wall.userData.entity.width;
                if (appSettings.getSizeUnits() === constants.SizeUnit.CM)
                    return width;
                else
                    return sizeHelper.CMToFTAndINCH(width);
            },

            getWallCurrentSize: function (len) {
                var wallLength = parseFloat(len.toFixed(2));
                if (appSettings.getSizeUnits() === constants.SizeUnit.CM)
                    return wallLength;
                else
                    return sizeHelper.CMToFTAndINCH(wallLength);
            },

            buildFloorSize: function (floor) {
                var geometry = new THREE.PlaneBufferGeometry(sizeTextMeshWidth, sizeTextMeshHeight);
                var plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
                    transparent: true,
                    depthTest: false,
                    depthWrite: false,
                    side: THREE.DoubleSide
                }));
                plane.name = 'floorArea';
                plane.rotation.x = -Math.PI;
                floor.add(plane);
                this.updateFloorArea(floor);
            },

            updateFloorArea: function (floor) {
                var floorSize = floor.getObjectByName('floorArea');
                var points = roomStateManager.getPoints();
                var position = geometryHelper.getPolygonCenter(floor.geometry.vertices);

                //floor.geometry.computeBoundingSphere();
                //var position = floor.geometry.boundingSphere.center;


                floorSize.position.set(position.x, position.y, 1);

                var converted = [];
                for (var i = 0; i < points.length; i++) {
                    converted.push(new THREE.Vector3(points[i].x, points[i].z, 0));
                }

                var floorArea = sizeHelper.getFloorArea(converted);
                if (appSettings.getSizeUnits() === constants.SizeUnit.FT)
                    floorArea = sizeHelper.convertM2ToFT2(floorArea) + ' ft\xB2';
                else
                    floorArea = floorArea.toFixed(2) + ' m\xB2';

                var img = textToImage(floorArea, true);

                updateTextureImage(floorSize, img);
            },

            setFloorAreaVisibility: function (floor, bool) {
                if (floor) {
                    var floorSize = floor.getObjectByName('floorArea');
                    floorSize.visible = bool;
                }
            },

            scaleAllSizes: function (floor, walls, scale) {

                var names = Object.getOwnPropertyNames(sizeType);
                for (var i = 0; i < walls.length; i++) {
                    var wall = walls[i];
                    var inner = wall.getObjectByName(names[0]).getObjectByName('sizeText');
                    var outer = wall.getObjectByName(names[1]).getObjectByName('sizeText');
                    inner.scale.set(scale, scale, 1);
                    outer.scale.set(scale, scale, 1);
                }

                if (floor) {
                    var floorArea = floor.getObjectByName('floorArea');
                    floorArea.scale.set(scale, scale, 1);
                }
            },

            setWallSizeVisibility: function (wall, bool) {
                var names = Object.getOwnPropertyNames(sizeType);
                wall.getObjectByName(names[0]).visible = bool;
                wall.getObjectByName(names[1]).visible = bool;
            },

            updateWallsSizes: function (walls) {
                for (var i = 0; i < walls.length; i++) {
                    this.updateWallSizes(walls[i]);
                }
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('roomSizeManager', service);

})();
