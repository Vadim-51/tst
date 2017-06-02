; (function () {
    'use strict';

    var dependencies = ['constants', 'sizeHelper', 'geometryHelper', 'scene3D'];

    var service = function (constants, sizeHelper, geometryHelper, scene3D) {

        var rayHelper, intesrsectWithSelf;
            

        var textToImage = function (distance, unit) {
            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', 128);
            canvas.setAttribute('height', 64);
            var ctx = canvas.getContext("2d");
            ctx.font = "18px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText((Math.ceil(distance*20)/20).toFixed(2) + ' ' + unit, canvas.width / 2, (canvas.height / 2) + 9);
            return canvas;
        };

        var buildSizes = function (mesh, img, distance) {
            var spriteMaterial = new THREE.SpriteMaterial({ map: new THREE.Texture(img), color: 0xffffff });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.material.map.needsUpdate = true;
            sprite.material.needsUpdate = true;
            sprite.scale.set(80, 80, 80);
            sprite.position.setY(distance / 2);
            mesh.add(sprite);
        };

        var convertCMToFT = function (v) {
            return v * 0.032808399;
        }

        var filterIsNotWall = function (mesh) {
            if (mesh.userData.entity)
                return !mesh.userData.entity.isWall;
            else return true;
        };

        // TO DO
        // break into simpler functions
        var getDimensianalRadialsForWallEmbeddableModel = function (mesh, modelsWithoutCurrent, boundingCube) {
            var modelsWithoutCurrentAndWalls = modelsWithoutCurrent.filter(filterIsNotWall),
                lengthUnit = constants.wallUnitLength.M ? 'cm' : 'ft';

            var vFace = mesh.getWorldDirection();

            var axis = new THREE.Vector3(0, 1, 0);
            var angle = Math.PI / 2;

            var vRight = mesh.getWorldDirection().applyAxisAngle(axis, angle);

            angle = -(Math.PI / 2);
            var vLeft = mesh.getWorldDirection().applyAxisAngle(axis, angle);
            // var vLeft = mesh.getWorldDirection().applyAxisAngle(axis, angle).negate();

            var vTop = new THREE.Vector3(0, 1, 0),
                vBottom = new THREE.Vector3(0, -1, 0);

            rayHelper = new THREE.Raycaster(boundingCube.position, vFace);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube, true);
            var positionFace = intesrsectWithSelf[intesrsectWithSelf.length - 1].point;

            rayHelper = new THREE.Raycaster(boundingCube.position, vRight);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube, true);
            var positionRight = intesrsectWithSelf[intesrsectWithSelf.length - 1].point;
            var positionRightOnWallSurface = positionFace.clone().addScaledVector(
                vRight, (mesh.userData.length / 2) || (mesh.userData.entity.length / 2)); // second value is length if model was resized

            rayHelper = new THREE.Raycaster(boundingCube.position, vLeft);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube), true;
            var positionLeft = intesrsectWithSelf[intesrsectWithSelf.length - 1].point;
            var positionLeftOnWallSurface = positionFace.clone().addScaledVector(
                vLeft, (mesh.userData.length / 2) || (mesh.userData.entity.length / 2)); // second value is length if model was resized

            rayHelper = new THREE.Raycaster(boundingCube.position, vTop);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube, true);
            var positionTopOnWallSurface = positionFace.clone().addScaledVector(
                vTop, (mesh.userData.height / 2) || (mesh.userData.entity.height / 2)); // second value is height if model was resized

            rayHelper = new THREE.Raycaster(boundingCube.position, vBottom);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube), true;
            var positionBottom = intesrsectWithSelf[intesrsectWithSelf.length - 1].point;
            var positionBottomOnWallSurface = positionFace.clone().addScaledVector(
                vBottom, (mesh.userData.height / 2) || (mesh.userData.entity.height / 2)); // second value is height if model was resized

            var rayFace = new THREE.Raycaster(positionFace, vFace),
                intersects = rayFace.intersectObjects(modelsWithoutCurrent),
                distanceFace = intersects[0].distance;

            var rayRight = new THREE.Raycaster(positionRight, vRight),
                intersects = rayRight.intersectObjects(modelsWithoutCurrentAndWalls);
            if (intersects.length)
                var distanceRight = intersects[0].distance;
            else {
                rayRight = new THREE.Raycaster(positionRightOnWallSurface, vRight);
                intersects = rayRight.intersectObjects(modelsWithoutCurrent);
                var distanceRight = intersects[0].distance;
            }

            var rayLeft = new THREE.Raycaster(positionLeft, vLeft),
                intersects = rayLeft.intersectObjects(modelsWithoutCurrentAndWalls);
            if (intersects.length)
                distanceLeft = intersects[0].distance;
            else {
                rayLeft = new THREE.Raycaster(positionLeftOnWallSurface, vLeft);
                intersects = rayLeft.intersectObjects(modelsWithoutCurrent);
                var distanceLeft = intersects[0].distance;
            }

            var distanceTop = constants.wallHeight - mesh.position.y - ((mesh.userData.height / 2) || (mesh.userData.entity.height / 2));

            var ray6 = new THREE.Raycaster(positionBottom, vBottom),
                intersects = ray6.intersectObjects(modelsWithoutCurrentAndWalls);
            if (intersects.length)
                distanceBottom = intersects[0].distance;
            else {
                ray6 = new THREE.Raycaster(positionBottomOnWallSurface, vBottom);
                intersects = ray6.intersectObjects(modelsWithoutCurrent);
                if (intersects.length)
                    var distanceBottom = intersects[0].distance;
                else var distanceBottom = 0;
            }

            var arrowFace = new THREE.ArrowHelper(vFace, positionFace, distanceFace, 0x0000ff, 5, 5),
                arrowRight = new THREE.ArrowHelper(vRight, positionRightOnWallSurface, distanceRight, 0x0000ff, 5, 5),
                arrowLeft = new THREE.ArrowHelper(vLeft, positionLeftOnWallSurface, distanceLeft, 0x0000ff, 5, 5),
                arrowTop = new THREE.ArrowHelper(vTop, positionTopOnWallSurface, distanceTop, 0x0000ff, 5, 5),
                arrowBottom = new THREE.ArrowHelper(vBottom, positionBottomOnWallSurface, distanceBottom, 0x0000ff, 5, 5);

            if (lengthUnit === 'ft') {
                var imgFace = textToImage(convertCMToFT(distanceFace), lengthUnit);
                var imgRight = textToImage(convertCMToFT(distanceRight), lengthUnit);
                var imgLeft = textToImage(convertCMToFT(distanceLeft), lengthUnit);
                var imgTop = textToImage(convertCMToFT(distanceTop), lengthUnit);
                var imgBottom = textToImage(convertCMToFT(distanceBottom), lengthUnit);
            }
            else {
                var imgFace = textToImage(distanceFace, lengthUnit);
                var imgRight = textToImage(distanceRight, lengthUnit);
                var imgLeft = textToImage(distanceLeft, lengthUnit);
                var imgTop = textToImage(distanceTop, lengthUnit);
                var imgBottom = textToImage(distanceBottom, lengthUnit);
            }


            buildSizes(arrowFace, imgFace, distanceFace);
            buildSizes(arrowRight, imgRight, distanceRight);
            buildSizes(arrowLeft, imgLeft, distanceLeft);
            buildSizes(arrowTop, imgTop, distanceTop);
            buildSizes(arrowBottom, imgBottom, distanceBottom);


            var dimensionalRadials = new THREE.Object3D();
            dimensionalRadials.userData.type = 'arrowHelper';

            if (distanceFace > 5) // don't add arrows for too little distances
            dimensionalRadials.add(arrowFace);
            if (distanceRight > 5)
            dimensionalRadials.add(arrowRight);
            if (distanceLeft > 5)
            dimensionalRadials.add(arrowLeft);
            if (distanceTop > 5)
            dimensionalRadials.add(arrowTop);
            if (distanceBottom > 5)
            dimensionalRadials.add(arrowBottom);
            // dimensionalRadials.add(arrowFace, arrowRight, arrowLeft, arrowTop, arrowBottom);
            return dimensionalRadials;
        }

        // TO DO
        // break into simpler functions
        var getDimensianalRadialsForFloorModel = function (mesh, modelsWithoutCurrent, boundingCube) {
            var lengthUnit = constants.wallUnitLength.M ? 'cm' : 'ft';;

            var vFace = mesh.getWorldDirection();

            var axis = new THREE.Vector3(0, 1, 0);
            var angle = Math.PI / 2;

            var vRight = mesh.getWorldDirection().applyAxisAngle(axis, angle);

            angle = Math.PI;
            var vBack = mesh.getWorldDirection().applyAxisAngle(axis, angle);

            angle = 3 * Math.PI / 2;
            var vLeft = mesh.getWorldDirection().applyAxisAngle(axis, angle);

            rayHelper = new THREE.Raycaster(boundingCube.position, vFace);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube, true);
            var positionFace = intesrsectWithSelf[intesrsectWithSelf.length - 1].point;

            rayHelper = new THREE.Raycaster(boundingCube.position, vRight);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube, true);
            var positionRight = intesrsectWithSelf[intesrsectWithSelf.length - 1].point;

            rayHelper = new THREE.Raycaster(boundingCube.position, vBack);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube), true;
            var positionBack = intesrsectWithSelf[intesrsectWithSelf.length - 1].point;

            rayHelper = new THREE.Raycaster(boundingCube.position, vLeft);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube, true);
            var positionLeft = intesrsectWithSelf[intesrsectWithSelf.length - 1].point;


            var rayFace = new THREE.Raycaster(positionFace, vFace),
                intersects = rayFace.intersectObjects(modelsWithoutCurrent),
                distanceFace = intersects[0].distance;

            var rayRight = new THREE.Raycaster(positionRight, vRight),
                intersects = rayRight.intersectObjects(modelsWithoutCurrent),
                distanceRight = intersects[0].distance;

            var rayBack = new THREE.Raycaster(positionBack, vBack),
                intersects = rayBack.intersectObjects(modelsWithoutCurrent),
                distanceBack = intersects[0].distance;

            var rayLeft = new THREE.Raycaster(positionLeft, vLeft),
                intersects = rayLeft.intersectObjects(modelsWithoutCurrent),
                distanceLeft = intersects[0].distance;
                
            var arrowFace = new THREE.ArrowHelper(vFace, positionFace, distanceFace, 0x0000ff, 5, 5),
                arrowRight = new THREE.ArrowHelper(vRight, positionRight, distanceRight, 0x0000ff, 5, 5),
                arrowBack = new THREE.ArrowHelper(vBack, positionBack, distanceBack, 0x0000ff, 5, 5),
                arrowLeft = new THREE.ArrowHelper(vLeft, positionLeft, distanceLeft, 0x0000ff, 5, 5);

            //     if (distanceFace > 2) // don't build arrows for too little distances
            //     var arrowFace = new THREE.ArrowHelper(vFace, positionFace, distanceFace, 0x0000ff, 30, 5);
            // if (distanceRight > 2)
            //     var arrowRight = new THREE.ArrowHelper(vRight, positionRight, distanceRight, 0x0000ff, 30, 5);
            // if (distanceBack > 2)
            //     var arrowBack = new THREE.ArrowHelper(vBack, positionBack, distanceBack, 0x0000ff, 30, 5);
            // if (distanceLeft > 2)
            //     var arrowLeft = new THREE.ArrowHelper(vLeft, positionLeft, distanceLeft, 0x0000ff, 30, 5);

            if (lengthUnit === 'ft') {
                var imgFace = textToImage(convertCMToFT(distanceFace), lengthUnit);
                var imgRight = textToImage(convertCMToFT(distanceRight), lengthUnit);
                var imgBack = textToImage(convertCMToFT(distanceBack), lengthUnit);
                var imgLeft = textToImage(convertCMToFT(distanceLeft), lengthUnit);
            }
            else {
                var imgFace = textToImage(distanceFace, lengthUnit);
                var imgRight = textToImage(distanceRight, lengthUnit);
                var imgBack = textToImage(distanceBack, lengthUnit);
                var imgLeft = textToImage(distanceLeft, lengthUnit);
            }


            buildSizes(arrowFace, imgFace, distanceFace);
            buildSizes(arrowRight, imgRight, distanceRight);
            buildSizes(arrowBack, imgBack, distanceBack);
            buildSizes(arrowLeft, imgLeft, distanceLeft);

            var dimensionalRadials = new THREE.Object3D();
            dimensionalRadials.userData.type = 'arrowHelper';

            if (distanceFace > 5) // don't add arrows for too little distances
            dimensionalRadials.add(arrowFace);
            if (distanceRight > 5)
            dimensionalRadials.add(arrowRight);
            if (distanceBack > 5)
            dimensionalRadials.add(arrowBack);
            if (distanceLeft > 5)
            dimensionalRadials.add(arrowLeft);
            // dimensionalRadials.add(arrowFace, arrowRight, arrowBack, arrowLeft);

            return dimensionalRadials;
        }

        // TO DO
        // break into simpler functions
        var getDimensianalRadialsForWallMountableModel = function (mesh, modelsWithoutCurrent, boundingCube) {

            var dimensionalRadials = getDimensianalRadialsForFloorModel(mesh, modelsWithoutCurrent, boundingCube),
                lengthUnit = constants.wallUnitLength.M ? 'cm' : 'ft';

            var vTop = new THREE.Vector3(0, 1, 0),
                vBottom = new THREE.Vector3(0, -1, 0);

            rayHelper = new THREE.Raycaster(boundingCube.position, vTop);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube);
            var positionTop = intesrsectWithSelf[intesrsectWithSelf.length - 1].point;

            rayHelper = new THREE.Raycaster(boundingCube.position, vBottom);
            intesrsectWithSelf = rayHelper.intersectObject(boundingCube);
            var positionBottom = intesrsectWithSelf[intesrsectWithSelf.length - 1].point;

            // count distance to roof, because it can't be intersected
            var distanceTop = constants.wallHeight - mesh.position.y - (
                (mesh.userData.height / 2) || (mesh.userData.entity.height / 2)); // 

            var ray6 = new THREE.Raycaster(positionBottom, vBottom),
                intersects = ray6.intersectObjects(modelsWithoutCurrent),
                distanceBottom = intersects[0].distance;

            var arrowTop = new THREE.ArrowHelper(vTop, positionTop, distanceTop, 0x0000ff, 30, 5),
                arrowBottom = new THREE.ArrowHelper(vBottom, positionBottom, distanceBottom, 0x0000ff, 30, 5);

            if (lengthUnit === 'ft') {
                var img5 = textToImage(convertCMToFT(distanceTop), lengthUnit);
                var img6 = textToImage(convertCMToFT(distanceBottom), lengthUnit);
            }
            else {
                var img5 = textToImage(distanceTop, lengthUnit);
                var img6 = textToImage(distanceBottom, lengthUnit);
            }

            buildSizes(arrowTop, img5, distanceTop);
            buildSizes(arrowBottom, img6, distanceBottom);

            if (distanceTop > 5)
            dimensionalRadials.add(arrowTop);
            if (distanceBottom > 5)
            dimensionalRadials.add(arrowBottom);
            // dimensionalRadials.add(arrowTop, arrowBottom);

            return dimensionalRadials;
        }

        return {
            getDimensionalRadials: function (mesh) {

                var wallInteraction = mesh.userData.entity.wallInteraction;

                var modelsWithoutCurrent = scene3D.filterChildren(function (item) {
                    return item.uuid !== mesh.uuid;
                });

                var geometry = new THREE.BoxGeometry(mesh.userData.length || mesh.userData.entity.length,
                    mesh.userData.height || mesh.userData.entity.height, mesh.userData.width || mesh.userData.entity.width),
                    material = new THREE.MeshBasicMaterial({ color: 0x00ff00 , side : THREE.DoubleSide }),
                    boundingCube = new THREE.Mesh(geometry, material);

                boundingCube.position.copy(mesh.position);
                boundingCube.rotation.copy(mesh.rotation);
                boundingCube.updateMatrixWorld();

                switch (wallInteraction) {
                    case 'embeddable': {
                        var dimensionalRadials = getDimensianalRadialsForWallEmbeddableModel(mesh, modelsWithoutCurrent, boundingCube);
                    }
                        break;
                    case 'mountable': {
                        var dimensionalRadials = getDimensianalRadialsForWallMountableModel(mesh, modelsWithoutCurrent, boundingCube);
                    }
                        break;
                    default: {
                        var dimensionalRadials = getDimensianalRadialsForFloorModel(mesh, modelsWithoutCurrent, boundingCube);
                    }
                }

                return dimensionalRadials;
            },
            deleteDimensionalRadials: function () {
                var arrows = scene3D.filterChildren(function (obj) {
                    return obj.userData.type === "arrowHelper";
                });
                for (var i = 0; i < arrows.length; i++) {
                scene3D.remove(arrows[i]);
                }
            },
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('dimensionalRadialsManager', service);

})();
