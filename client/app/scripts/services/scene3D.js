var sc3d;

; (function () {

    'use strict';

    var dependencies = ['$window', 'sceneHelper', 'geometryHelper', 'wallVisibilityManager',
        'roomBuilder', 'constants', 'wall3DDataManager', 'orbitControl', 'wallNumberSrvc'];

    var service = function ($window, sceneHelper, geometryHelper,
        wallVisibilityManager, roomBuilder, constants, wall3DDataManager,
        orbitControl, wallNumberSrvc) {

        var scene,
            camera,
            renderer,
            aspect,
            elementWidth,
            elementHeight,
            canvas,
            destroyed = true,
            roomBoundingSphere,
            originalWalls,
            boundingRectangle;

        var render = function () {
            //renderer.clear();
           // renderer.render(scene, camera);
            //renderer.clearDepth();
        };

        var draw = function () {
            //if (destroyed)
            //    return;
            //requestAnimationFrame(draw);
            //render();
        };

        var getPickingRay = function (x, y, rayCaster) {
            return sceneHelper.getPickingRay(x, y, elementWidth, elementHeight, camera, rayCaster);
        };

        var onWindowResize = function () {

            if (destroyed)
                return;

            var parent = canvas.parentNode;

            var h = $(canvas).parents('.stepContainer').height();
            var w = $(canvas).parents('.stepContainer').width();

            elementWidth = w;
            elementHeight = h;
            aspect = elementWidth / elementHeight;

            camera.aspect = aspect;
            camera.updateProjectionMatrix();

            renderer.setSize(elementWidth, elementHeight);

            boundingRectangle = parent.getBoundingClientRect();
        };

        var getChildrenByFilter = function (filterFn) {
            return scene.children.filter(filterFn);
        };

        var getWalls = function () {
            var entity;
            return getChildrenByFilter(function (item) {
                entity = item.userData.entity;
                return entity && entity.isWall;
            });
        };

        var getWallsObjects = function () {
            return getChildrenByFilter(function (item) {
                return item.userData.wall;
            });
        };

        var centralizeCamera = function () {
            var roomCenter = roomBoundingSphere.center,
                distance = Math.abs(roomBoundingSphere.radius / Math.sin(camera.fov / 2));
            camera.position.copy(roomCenter);
            camera.position.y += distance;
          //  orbitControl.setTarget(roomCenter);
            camera.updateMatrixWorld();
            var walls = getWalls();
            var wallsObjects = getWallsObjects();
            wallVisibilityManager.reset(walls, wallsObjects);
        };

        var roomBuildCallBack = function (resetCamera,result) {

            originalWalls = result.originalWalls;

            this.add(result.floor);
            this.add(result.roomObjects);
            this.add(result.cuttedWalls);
           // this.add(wallNumberSrvc.get(originalWalls));

            roomBoundingSphere = geometryHelper.computeBoundingSphereFromMeshes(originalWalls);
            if (resetCamera !== false)
                centralizeCamera();

            destroyed = false;
            draw();
            this.resize();
        };

        return {
            init: function (width, height) {

                if (!renderer) {

                    scene = new THREE.Scene();
                    scene.name = '3D';

                    aspect = width / height;

                    wall3DDataManager.cameraFov = 45;

                    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 5000);

                    elementWidth = width;
                    elementHeight = height;

                    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); ////  preserveDrawingBuffer   : true   // required to support .toDataURL()
                    renderer.setSize(width, height);
                    //renderer.autoClear = false;

                    canvas = renderer.domElement;

                    var light = new THREE.HemisphereLight(0xffffff, 0xC0C0C0, 1.04)
                    light.position.set(0, 1, 0);
                    scene.add(light);

                   // orbitControl.init(camera, canvas);

                    sc3d = scene;

                    $window.addEventListener('resize', onWindowResize, false);
                }

                return canvas;
            },
            add: function () {
                if (arguments.length > 0) {

                    var firstArgument = arguments[0];

                    if (angular.isArray(firstArgument)) {
                        if (firstArgument.length > 0)
                            scene.add.apply(scene, firstArgument);
                        return;
                    }

                    if (firstArgument)
                        scene.add(firstArgument);
                }
            },
            remove: function () {
                scene.remove.apply(scene, arguments);
                if (arguments.length === 1) {
                    var obj = arguments[0];
                    if (obj.parent && !(obj.parent instanceof THREE.Scene))
                        obj.parent.remove(obj);
                }
            },
            getObject: function (name) {
                return scene.getObjectByName(name);
            },
            getObjectById: function (id) {
                return scene.getObjectById(id);
            },
            dispose: function () {

                destroyed = true;

                var children = scene.children,
                    count = scene.children.length,
                    i = count - 1,
                    item;

                for (; i >= 0; i--) {

                    item = children[i];

                    if (!item)
                        continue;

                    if (item.userData.keepOnScene === false || item instanceof THREE.Mesh)
                        scene.remove(item);
                }

              //  orbitControl.enable();
                //wallNumberSrvc.clear();

                originalWalls = roomBoundingSphere = null;
                wall3DDataManager.clearAll();
            },
            getPickingRay: getPickingRay,
            resize: onWindowResize,
            isDestroyed: function () {
                return destroyed;
            },
            draw: function (roomData, objects, reset3DCamera) {
                roomBuilder.buildRoom(roomData, objects).then(angular.bind(this, roomBuildCallBack, reset3DCamera));
            },
            hideCars: function (val) {
                angular.forEach(scene.children, function (obj) {
                    if (obj.userData.entity) {
                        if (obj.userData.entity.type === "vehicle") {
                            obj.visible = !val;
                        }
                    }
                });
            },
            focusOnWall: function (wallName) {
                var wallData = wall3DDataManager.getScrollData(wallName);
                camera.position.copy(wallData.center.clone().add(wallData.currentDistanceFromWallToCamera));
                camera.lookAt(wallData.center);
                camera.updateMatrixWorld();
                var walls = this.getWalls();
                var wallsObjects = this.getWallsObjects();
                wallVisibilityManager.reset(walls, wallsObjects);
                wallVisibilityManager.hideLookBlockWalls(walls, camera.getWorldDirection(), wallsObjects);
              //  orbitControl.setTarget(wallData.center);
            },
            getWallsObjects: getWallsObjects,
            getAspect: function () {
                return aspect;
            },
            getCameraFOV: function () {
                return camera.fov;
            },
            centralizeCamera: centralizeCamera,
            getChildren: function () {
                return scene.children;
            },
            getHtmlElement: function () {
                return canvas;
            },
            getCamera: function () {
                return camera;
            },
            getWalls: getWalls,
            getNonCuttedWallByName: function (name) {
                for (var i = 0; i < originalWalls.length; i++) {
                    if (originalWalls[i].name === name)
                        return originalWalls[i];
                }
            },
            getWallChildren: function (wallName) {
                return getChildrenByFilter(function (item) {
                    return item.userData.wall === wallName;
                });
            },
            filterChildren: getChildrenByFilter,
            getFloor: function () {
                return scene.getObjectByName('floor');
            },
            replace: function (oldObj, newObj) {
                this.remove(oldObj);
                this.add(newObj);
            },
            render: render,
            toImage: function () {
                return renderer.domElement.toDataURL("image/png");
            }
        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('scene3D', service);

})();
