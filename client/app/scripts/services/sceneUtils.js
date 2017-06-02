; (function () {
    'use strict';

    var dependencies = ['cameraManager', 'rendererSrvc'];

    var service = function (cameraManager, rendererSrvc) {

        return {

            screenToWorld: function (x, y) {
                var canvas = rendererSrvc.getCanvas();
                var w = canvas.width;
                var h = canvas.height;
                var camera = cameraManager.getCamera();
                var position = new THREE.Vector3((x / w) * 2 - 1,
                    -(y / h) * 2 + 1, 0);
                position.unproject(camera);
                return position;
            },

            worldToScreen: function (vector3) {
                var camera = cameraManager.getCamera();
                vector3.project(camera);
                var canvas = rendererSrvc.getCanvas();
                var boundingClientRect = canvas.getBoundingClientRect();
                vector3.x = (vector3.x + 1) / 2 * canvas.width;
                vector3.y = -(vector3.y - 1) / 2 * canvas.height;
                return vector3;
            },

            getRay: function (x, y, rc) {

                var canvas = rendererSrvc.getCanvas();
                var x = (x / canvas.offsetWidth) * 2 - 1;
                var y = -(y / canvas.offsetHeight) * 2 + 1;

                var v = new THREE.Vector3(x, y, 0);

                rc = rc || new THREE.Raycaster();
                rc.setFromCamera(v, cameraManager.getCamera());

                return rc;
            }
        }

    };

    service.$inject = dependencies;

    angular.module('vigilantApp').service('sceneUtils', service);

})();
