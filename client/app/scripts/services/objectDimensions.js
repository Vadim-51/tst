; (function () {
    'use strict';

    var dependencies = ['objectCheckerSrvc', 'imageUtils', 'rendererSrvc', 
        'rayHelper', 'sizeHelper', 'appSettings', 'constants'];

    var service = function (objectCheckerSrvc, imageUtils, rendererSrvc, 
        rayHelper, sizeHelper, appSettings, constants) {

        var dimensions = null;
        var cube = null;
        var upAxis = new THREE.Vector3(0, 1, 0);
        var deg90 = Math.PI / 2;
        var rc = new THREE.Raycaster();

        var constructBoundingCube = function (obj) {

            if (!cube) {
                cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
            }

            cube.scale.set(obj.userData.length || obj.userData.entity.length,
                obj.userData.height || obj.userData.entity.height,
                obj.userData.width || obj.userData.entity.width);

            cube.position.copy(obj.position);
            cube.rotation.copy(obj.rotation);
            cube.updateMatrixWorld();

            return cube;
        };

        var updateLine = function (axis, size, offset) {
            var line = dimensions.getObjectByName(axis);
            var position = line.userData.direction.clone().multiplyScalar(offset);
            line.position.copy(position);
            line.visible = true;
            switch (axis) {
                case '-X':
                case '+X':
                    line.scale.x = size;
                    break;
                case '-Z':
                case '+Z':
                    line.scale.z = size;
                    break;
                case '+Y':
                case '-Y':
                    line.scale.y = size;
                    break;
            }
        };

        var getSizeUnits = function (distance, units) {
            switch(units){
                case constants.SizeUnit.CM:
                    return distance + ' cm';
                    break;
                case constants.SizeUnit.FT:
                    return sizeHelper.CMToFT(distance).toFixed(2) + ' ft';
                    break;
            }
        };

        var updateSprite = function (direction, axisName, offset, distance) {
            var sprite = dimensions.getObjectByName(axisName + ' size');
            var position = direction.clone().multiplyScalar(offset);
            var sizeUnits = appSettings.getSizeUnits();
            var img = imageUtils.textToImage(getSizeUnits(distance, sizeUnits));
            sprite.position.copy(position);
            updateSpriteMap(sprite, img);
            sprite.visible = true;
        };

        var createLine = function (name, direction) {

            var geometry = new THREE.Geometry();

            geometry.vertices.push(
                new THREE.Vector3(0, 0, 0),
               direction
            );

            var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
                color: 0x0000ff,
                depthTest: false,
                depthWrite: false
            }));
            line.name = name;
            line.userData.direction = direction.clone();
            line.renderOrder = 1;

            return line;
        };

        var createSprite = function (name) {
            var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
                color: 0xffffff,
                transparent: true,
                depthTest: false,
                depthWrite: false
            }));
            sprite.scale.set(80, 40, 1);
            sprite.name = name;
            sprite.renderOrder = 2;
            return sprite;
        };

        var updateSpriteMap = function (sprite, img) {
            if (sprite.material.map)
                sprite.material.map.image = img;
            else {
                sprite.material.map = new THREE.Texture(img);
                sprite.material.map.anisotropy = rendererSrvc.getMaxAnisotropy();
            }
            sprite.material.map.needsUpdate = true;
            sprite.material.needsUpdate = true;
        };

        var updateSize = function (obj, staticObjs, exclude) {
            var angle = obj.rotation.y,
                bc = constructBoundingCube(obj),
                lines = dimensions.children.filter(function (obj) {
                    return obj instanceof THREE.Line &&
                        exclude.indexOf(obj.name) === -1;
                }),
                i = 0,
                direction,
                axisName,
                edgePoint,
                intersection,
                intersected,
                line,
                transformedDirection,
                lineSize,
                dimension;

            for (; i < lines.length; i++) {

                line = lines[i];
                direction = line.userData.direction;
                axisName = line.name;
                transformedDirection = direction.clone().applyAxisAngle(upAxis, angle);

                rc.set(obj.position, transformedDirection);
                intersection = rc.intersectObject(bc);
                edgePoint = intersection[0].point;

                rc.set(edgePoint, transformedDirection);
                intersection = rayHelper.intersectObjectsObb(rc.ray, staticObjs);
                //rc.intersectObjects(staticObjs);
                intersected = intersection[0];

                if (intersected) {
                    lineSize = obj.position.distanceTo(intersected.point);
                    dimension = intersected.distance;

                    if (dimension < 0.001) {
                        line.visible = false;
                        dimensions.getObjectByName(axisName + ' size').visible = false;
                    }
                    else {
                        updateLine(axisName, dimension, lineSize - dimension);
                        updateSprite(direction, axisName, lineSize - dimension / 2, dimension.toFixed(2));
                    }
                }
            }

            exclude.forEach(function (excluded) {
                dimensions.getObjectByName(excluded + ' size').visible = false;
                dimensions.getObjectByName(excluded).visible = false;
            });
        };

        return {

            build: function () {

                if (!dimensions) {

                    dimensions = new THREE.Object3D();
                    dimensions.name = 'objectDimensions';
                    dimensions.visible = false;

                    var data = [
                        {
                            name: '+X',
                            vector: new THREE.Vector3(1, 0, 0)
                        },
                        {
                            name: '-X',
                            vector: new THREE.Vector3(-1, 0, 0)
                        },
                        {
                            name: '+Z',
                            vector: new THREE.Vector3(0, 0, 1)
                        },
                        {
                            name: '-Z',
                            vector: new THREE.Vector3(0, 0, -1)
                        },
                        {
                            name: '+Y',
                            vector: new THREE.Vector3(0, 1, 0)
                        },
                        {
                            name: '-Y',
                            vector: new THREE.Vector3(0, -1, 0)
                        }
                    ];

                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        var line = createLine(item.name, item.vector);
                        dimensions.add(line);
                        dimensions.add(createSprite(item.name + ' size'));
                    }
                }

                return dimensions;
            },

            update: function (obj, staticObjs) {

                dimensions.position.copy(obj.position);
                dimensions.rotation.copy(obj.rotation);
                dimensions.updateMatrixWorld();

                if (objectCheckerSrvc.isWallEmbeddable(obj)) {
                    updateSize(obj, staticObjs, ['+Z', '-Z']);
                } else {
                    updateSize(obj, staticObjs, ['+Y', '-Y']);
                }

                dimensions.visible = true;
            }

        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('objectDimensions', service);

})();
