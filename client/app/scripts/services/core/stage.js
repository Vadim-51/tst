var scn;
; (function () {
    'use strict';

    var dependencies = ['cameraManager', '$window', 'rendererSrvc'];

    var service = function (cameraManager, $window, rendererSrvc) {
       
        var initialized = false;
        var scene = new THREE.Scene();

        var resize = function () {
            var canvas = rendererSrvc.getCanvas();
            var h = $(canvas).parents('.stepContainer').height();
            var w = $(canvas).parents('.stepContainer').width();
            cameraManager.resize(w, h);
            rendererSrvc.resize(w, h);
        };

        var render = function () {
            rendererSrvc.render(scene);
           // activeRenderer.render(scene, cameraManager.getCamera());
        };

        var draw = function () {
            requestAnimationFrame(draw);
            render();
        };

        return {

            init: function (width, height) {

                if (!initialized) {
                    initialized = true;

                    rendererSrvc.init();

                   // scene = new THREE.Scene();
                    scn = scene;

                    var grid = new THREE.GridHelper(4000, 160, 0xE8E8E8, 0xE8E8E8);
                    grid.name = 'grid';
                    scene.add(grid);

                    //var axisHelper = new THREE.AxisHelper(40);
                    //axisHelper.position.y = 50;
                    //scene.add(axisHelper);

                    var light = new THREE.HemisphereLight(0xffffff, 0xC0C0C0, 1.04)
                    light.position.set(0, 500, 0);
                    scene.add(light);

                    $window.addEventListener('resize', resize, false);

                   // cameraManager.resize(width, height);
                    draw();
                }

                resize();
            },

            getCanvas: function () {
                return rendererSrvc.getCanvas();
            },

            add: function (obj) {
                scene.add(obj);
            },

            addMany: function (objs) {
                scene.add.apply(scene, objs);
            },

            clean: function () {

                var children = scene.children,
                    i = children.length - 1,
                    item;

                for (; i >= 0; i--) {

                    item = children[i];

                    if (!item || item instanceof THREE.GridHelper ||
                        item instanceof THREE.AxisHelper ||
                        item instanceof THREE.Light)
                        continue;

                    scene.remove(item);
                }
            },

            getChildren: function (predicate) {
                return scene.children;
            },

            remove: function (obj) {
                scene.remove(obj);
            },

            removeMany : function (objs) {
                scene.remove.apply(scene, objs);
            },

            getWalls: function () {
                return scene.children.filter(function (item) {
                    return item.userData.entity && item.userData.entity.isWall;
                });
            },

            getChildrenByPredicate: function (predicate) {
                var result = [];

                scene.traverse(function (obj) {
                    if (predicate(obj))
                        result.push(obj);
                });

                return result;
            },

            getFloor: function () {
                return scene.getObjectByName('floor');
            },

            getConnectionPoints: function () {
                return scene.children.filter(function (item) {
                    return item.userData.isConnectionPoint;
                });
            },

            getWallByIndex: function (index) {
                return scene.getObjectByName('Wall ' + index);
            },

            getObjectById: function (id) {
                return scene.getObjectById(id);
            },

            setObjectsVisibilityByPredicate: function (predicate, isVisible) {
                scene.traverse(function (item) {
                    if (predicate(item))
                        item.visible = isVisible;
                });
            },

            getObjectByName: function (name) {
                return scene.getObjectByName(name);
            },

            getWallObjects: function (wallName) {
                return this.getChildrenByPredicate(function (obj) {
                    return !(obj instanceof THREE.Mesh) &&
                        obj.userData.wall === wallName
                });
            },

            getConnectionPointByIndex: function (index) {
                return scene.getObjectByName('connectionPoint ' + index);
            },

            replace: function (oldObj, newObj) {
                this.remove(oldObj);
                this.add(newObj);
            },

            resize : resize
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('stage', service);

})();
