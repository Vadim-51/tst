; (function () {
    'use strict';

    var dependencies = ['wall3DDataManager'];

    var service = function (wall3DDataManager) {

        var wallNumberSize = 40;
        var controls;
        var scaleVector = new THREE.Vector3();
        var scaleFactor = 25;
        var isVisible = true;

        var createWallNumberImg = function (number) {

            var canvas = document.createElement('canvas'),
                cnx = canvas.getContext('2d'),
                size = 64,
                halfOfSize = size / 2,
                textSize;

            canvas.width = canvas.height = size;

            cnx.font = "40px Arial";
            cnx.textAlign = "center";

            textSize = cnx.measureText(number);

            cnx.fillText(number, halfOfSize, halfOfSize + textSize.width / 2);

            cnx.globalCompositeOperation = "destination-over";
            cnx.beginPath();
            cnx.arc(halfOfSize, halfOfSize, halfOfSize, 0, Math.PI * 2, true);
            cnx.closePath();
            cnx.fillStyle = 'white';
            cnx.fill();

            return canvas;
        };

        var buildWallNumbers = function (count) {

            var i = 0,
                wall,
                sprite,
                wallNumber,
                texture,
                result = [],
                wallName,
                container = new THREE.Object3D();

            container.name = 'wallNumbers';
            container.userData.keepOnScene = false;
            container.visible = isVisible;

            for (; i < count; i++) {

                wallNumber = i + 1;
                wallName = 'Wall ' + wallNumber;
            
                texture = new THREE.Texture(createWallNumberImg(wallNumber));
                texture.needsUpdate = true;

                sprite = new THREE.Sprite(new THREE.SpriteMaterial({
                    map: texture,
                    depthTest: false,
                    depthWrite: false,
                    needsUpdate: true
                }));

                sprite.scale.set(wallNumberSize, wallNumberSize, 1);
                sprite.name = 'wallNumber ' + wallNumber;

               
                var p = wall3DDataManager.getPoints(wallName).topCenter;

                    //new THREE.Vector3(wall.userData.entity.length / 2, wall.userData.entity.height, -wall.userData.entity.width / 2)
                          //  .applyMatrix4(wall.matrixWorld);
                    //
                sprite.position.copy(p);

                container.add(sprite);
            }

            return container;
        };

        return {
            get: function (count) {
                controls = controls || buildWallNumbers(count);
                return controls;
            },
            updateScale: function (cameraPosition) {
                if (controls) {
                    var i = 0,
                        sprites = controls.children,
                        sprite,
                        scale;
                    for (; i < sprites.length; i++) {
                        sprite = sprites[i];
                        scale = scaleVector.subVectors(sprite.position, cameraPosition).length() / scaleFactor;
                        sprite.scale.set(scale, scale, 1);
                    }
                }
            },
            updatePosition: function (wallName) {
                if (controls) {
                    var name = 'wallNumber ' + wallName.split(' ').pop();
                    var wn = controls.getObjectByName(name);
                    var p = wall3DDataManager.getPoints(wallName).topCenter;
                    wn.position.copy(p);
                }
            },
            setVisibility: function (bool) {
                if (controls) {
                    controls.visible = bool && isVisible;
                }
            },
            clear: function () {
                controls = null;
            },
            setIsVisible: function (bool) {
                isVisible = bool;
            },
            isVisible: function () {
                return controls && controls.visible;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('wallNumberSrvc', service);

})();
