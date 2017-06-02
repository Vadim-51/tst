'use strict';
/**
 * @ngdoc service
 * @name vigilantApp.service
 * @description
 * # service
 * Service in the vigilantApp.
 */

//var sc;
angular.module('vigilantApp').service('Scene2d', ['$window', 'sceneHelper',
function ($window, sceneHelper) {

    var domElement,
      camera,
      scene,
      stepRenderers = {},
      activeRenderer,
      canvasHeight,
      canvasWidth,
      initialized = false,
      onWindowResize = function () {

          var h = $(activeRenderer.domElement).parents('.stepContainer').height();
          var w = $(activeRenderer.domElement).parents('.stepContainer').width();

          var parent = activeRenderer.domElement.parentNode;
          //console.debug("Resize", renderer.domElement.parentNode);
          canvasWidth = w;
          canvasHeight = h;
          activeRenderer.setSize(canvasWidth, canvasHeight);
          camera.left = -canvasWidth / 2;
          camera.right = canvasWidth / 2;
          camera.top = canvasHeight / 2;
          camera.bottom = -canvasHeight / 2;
          camera.updateProjectionMatrix();
          rend();
      },
      frustum = new THREE.Frustum(),
      rend = function () {
         // activeRenderer.render(scene, camera);
      };

    var axisHelper;

    var service = {
        init: function (width, height, step) {

            canvasWidth = width;
            canvasHeight = height;

            if (!initialized) {

                initialized = true;

                scene = new THREE.Scene();
                scene.name = '2D';

                camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -1000, 1000);
                camera.position.x = 0;
                camera.position.y = 0;

              //  sc = scene;

                var grid = new THREE.GridHelper(4000, 160, 0xE8E8E8, 0xE8E8E8);
                grid.name = 'grid';
                grid.rotation.x = Math.PI / 2;
                scene.add(grid);

                //axisHelper = new THREE.AxisHelper(40)
                //axisHelper.position.z = 500;
                //scene.add(axisHelper);

                $window.addEventListener('resize', onWindowResize, false);
            }

            if (!stepRenderers[step])
            {
                var renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
                renderer.setPixelRatio(1);
                renderer.setSize(width, height);
                renderer.setClearColor(0xffffff, 1);
                stepRenderers[step] = renderer;
            }
            else {
                renderer = stepRenderers[step];
            }

            activeRenderer = renderer;

            return renderer.domElement;
        },
        switchRenderer: function (step) {

            var render = stepRenderers[step];

            if (render) {

                activeRenderer = render;

                //wrapper.append(renderer.domElement);

                //var parent = renderer.domElement.parentNode;

                //canvasWidth = parent.clientWidth ? parent.clientWidth
                //    : Number(parent.children[0].getAttribute("width"));
                //canvasHeight = parent.clientHeight ? parent.clientHeight
                //    : Number(parent.children[0].getAttribute("height"));

                //var canvasSize = { width: canvasWidth, height: canvasHeight };
                //renderer.setSize(canvasWidth, canvasHeight);

                //camera.left = -canvasWidth / 2;
                //camera.right = canvasWidth / 2;
                //camera.top = canvasHeight / 2;
                //camera.bottom = -canvasHeight / 2;
                //camera.updateProjectionMatrix();
                //camera.updateProjectionMatrix();

                onWindowResize();
                //service.render();
            }
        },
        animate: function () {
            requestAnimationFrame(service.animate);
        },
        addModel: function (model) {
            scene.add(model);
        },
        remove: function () {
            scene.remove.apply(scene, arguments);
            if (arguments.length === 1) {
                var obj = arguments[0];
                if (obj.parent && !(obj.parent instanceof THREE.Scene))
                    obj.parent.remove(obj);
            }
        },
        render: function () {
            rend();
        },
        getFrustum: function () {
            camera.updateMatrix();
            camera.updateMatrixWorld();
            camera.matrixWorldInverse.getInverse(camera.matrixWorld);
            frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
            return frustum;
        },
        worldToScreen: function (vector3) {
            vector3.project(camera);
            var boundingClientRect = activeRenderer.domElement.getBoundingClientRect();
            vector3.x = (vector3.x + 1) / 2 * canvasWidth;
            vector3.y = -(vector3.y - 1) / 2 * canvasHeight;
            //var boundingClientRect = renderer.domElement.getBoundingClientRect(),
            //    x = (vector3.x * (boundingClientRect.width / 2)) + (boundingClientRect.width / 2) + boundingClientRect.left,
            //    y = -(vector3.y * (boundingClientRect.height / 2)) + (boundingClientRect.height / 2) + boundingClientRect.top;
            //vector3.set(x, y, 0);
        },
        getSizeCanvas: function () {
            return { width: canvasWidth, height: canvasHeight };

        },
        getObjectByName: function (name) {
            return scene.getObjectByName(name);
        },
        resize: onWindowResize,
        cameraRay: function (x, y) {
            return sceneHelper.getPickingRay(x, y, canvasWidth, canvasHeight, camera);
        },
        getSnapShots: function () {
            activeRenderer.render(scene, camera);
            var result = activeRenderer.domElement.toDataURL("image/png");
            return result;
        },
        screenToWorld: function (x, y) {
            var position = new THREE.Vector3((x / canvasWidth) * 2 - 1,
                -(y / canvasHeight) * 2 + 1, 0);
            position.unproject(camera);
            return position;
        },
        getChildren: function () {
            return scene.children;
        },
        getCamera: function () {
            return camera;
        },
        clean: function () {

            var children = scene.children,
                i = children.length - 1,
                item;

            for (; i >= 0; i--) {

                item = children[i];

                if (!item || item.name === 'grid' || item === axisHelper)
                    continue;

                scene.remove(item);
            }
        },
        addMany: function (objects) {
            scene.add.apply(scene, objects);
        },
        getWalls: function () {
            return scene.children.filter(function (item) {
                return item.userData.isWall;
            });
        },
        getWallByIndex: function (index) {
            return this.getObjectByName('Wall ' + index);
        },
        getConnectionPointByIndex: function (index) {
            return this.getObjectByName('connectionPoint ' + index);
        },
        getFloor: function () {
            return this.getObjectByName('floor');
        },
        getCanvas: function () {
            return activeRenderer.domElement;
        },
        setObjectsVisibilityByPredicate: function (predicate, isVisible) {
            scene.traverse(function (item) {
                if (predicate(item))
                    item.visible = isVisible;
            });
        },
        removeMany: function (objects) {
            scene.remove.apply(scene, objects);
        },
        getConnectionPoints: function () {
            return scene.children.filter(function (item) {
                return item.userData.isConnectionPoint;
            });
        },
        getObjectByUUID: function (uuid) {
            var mesh;

            scene.traverse(function (obj) {
                if (obj.uuid === uuid) {
                    mesh = obj;
                    return;
                }
            });

            return mesh;
        },
        getEntityObjects: function () {

            var result = [];

            scene.traverse(function (obj) {
                if (obj.userData.entity)
                    result.push(obj);
            });

            return result;
        }
    };

    return service;
}]);
