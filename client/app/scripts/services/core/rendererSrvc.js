; (function () {
    'use strict';

    var dependencies = ['cameraManager'];

    var service = function (cameraManager) {

        var renderer;

        return {

            init: function () {

                if (!renderer) {
                    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
                    renderer.setPixelRatio(1);
                    renderer.setClearColor(0xffffff, 1);
                }

                return renderer;
            },

            get: function () {
                return renderer;
            },

            render: function (scene) {
                renderer.render(scene, cameraManager.getCamera());
            },

            getCanvas: function () {
                return renderer.domElement;
            },

            resize: function (w, h) {
                renderer.setSize(w, h);
            },

            getMaxAnisotropy: function () {
                return renderer.getMaxAnisotropy();
            }

        }
    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('rendererSrvc', service);

})();
